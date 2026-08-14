/*
 * Copyright 2026, TeamDev. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Redistribution and use in source and/or binary forms, with or without
 * modification, must retain the above copyright notice and the following
 * disclaimer.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

import * as params from '@params';
import {createPurchaseClient} from 'js/modules/paygate/purchases';
import {getCheckoutPageUrl} from 'js/pages/checkout/completed-page-url';
import {getOrderId} from 'js/pages/checkout/order-id';

const pollingIntervalsMs = [3000, 5000, 10000, 30000];
const failuresBeforeErrorView = 3;
const notFoundResponsesBeforeResult = 2;
const maxPollingDurationMs = 15 * 60 * 1000;
const unsuccessfulTerminalStatuses = new Set(['ABANDONED', 'FAILED', 'VOIDED']);
const viewIds = Object.freeze({
    IN_PROGRESS: 'payment-in-progress',
    COMPLETED: 'payment-completed',
    FAILED: 'payment-failed',
    REFUNDED: 'payment-refunded',
    CHARGED_BACK: 'payment-charged-back',
    STATUS_ERROR: 'payment-status-error',
    NOT_FOUND: 'payment-order-not-found',
    UNKNOWN: 'payment-status-unknown'
});

init();

/** Starts resolving the payment result represented by the current URL. */
function init() {
    if (!document.querySelector('[data-payment-status-page]')) {
        return;
    }

    const orderId = getOrderId(window.location);
    if (!orderId) {
        return;
    }
    configureBackToCheckoutLink(orderId);

    const paygateUrl = params.payment && params.payment.paygateurl;
    if (!paygateUrl) {
        return;
    }

    let purchaseClient;
    try {
        purchaseClient = createPurchaseClient(paygateUrl);
    } catch (error) {
        logApiError(error);
        return;
    }

    let consecutiveFailures = 0;
    let consecutiveNotFoundResponses = 0;
    let pollingIntervalIndex = 0;
    let pollingTimerId;
    let stopped = false;
    const pollingDeadlineMs = Date.now() + maxPollingDurationMs;
    const deadlineTimerId = window.setTimeout(reachPollingDeadline, maxPollingDurationMs);

    showView(viewIds.IN_PROGRESS);
    pollPaymentStatus();

    /** Reads the order until Paygate reports a terminal payment status. */
    async function pollPaymentStatus() {
        pollingTimerId = undefined;
        if (stopped) {
            return;
        }

        try {
            const order = await purchaseClient.getOrder(orderId);
            if (stopped) {
                return;
            }

            consecutiveFailures = 0;
            consecutiveNotFoundResponses = 0;

            if (order.paymentStatus === 'SETTLED' || (!order.paymentStatus && order.completed)) {
                finishWithView(viewIds.COMPLETED);
                return;
            }
            if (unsuccessfulTerminalStatuses.has(order.paymentStatus)) {
                finishWithView(viewIds.FAILED);
                return;
            }
            if (order.paymentStatus === 'REFUNDED') {
                finishWithView(viewIds.REFUNDED);
                return;
            }
            if (order.paymentStatus === 'CHARGED_BACK') {
                finishWithView(viewIds.CHARGED_BACK);
                return;
            }

            showView(viewIds.IN_PROGRESS);
        } catch (error) {
            if (stopped) {
                return;
            }

            if (error.status === 404) {
                consecutiveNotFoundResponses += 1;
                consecutiveFailures = 0;
                if (consecutiveNotFoundResponses >= notFoundResponsesBeforeResult) {
                    finishWithView(viewIds.NOT_FOUND);
                    return;
                }
            } else {
                consecutiveNotFoundResponses = 0;
                consecutiveFailures += 1;
                if (consecutiveFailures >= failuresBeforeErrorView) {
                    showView(viewIds.STATUS_ERROR);
                }
            }
            logApiError(error);
        }

        scheduleNextPoll();
    }

    /** Schedules the next attempt using a backoff capped at 30 seconds. */
    function scheduleNextPoll() {
        const remainingDurationMs = pollingDeadlineMs - Date.now();
        if (remainingDurationMs <= 0) {
            finishWithView(viewIds.UNKNOWN);
            return;
        }

        const delay = pollingIntervalsMs[pollingIntervalIndex];
        if (pollingIntervalIndex < pollingIntervalsMs.length - 1) {
            pollingIntervalIndex += 1;
        }
        pollingTimerId = window.setTimeout(
            pollPaymentStatus,
            Math.min(delay, remainingDurationMs)
        );
    }

    /** Stops polling when its maximum duration is reached. */
    function reachPollingDeadline() {
        finishWithView(viewIds.UNKNOWN);
    }

    /** Stops all timers and shows the final page view. */
    function finishWithView(viewId) {
        if (stopped) {
            return;
        }
        stopped = true;
        if (pollingTimerId !== undefined) {
            window.clearTimeout(pollingTimerId);
        }
        window.clearTimeout(deadlineTimerId);
        showView(viewId);
    }
}

/** Makes the failed-payment action navigate back to the same order. */
function configureBackToCheckoutLink(orderId) {
    const link = document.querySelector('#payment-failed [data-back-to-checkout]');
    if (!link) {
        return;
    }

    const checkoutUrl = getCheckoutPageUrl(window.location.href, orderId);
    if (checkoutUrl) {
        link.href = checkoutUrl;
        link.hidden = false;
    }
}

/** Shows one payment-status view and hides every other view. */
function showView(activeViewId) {
    Object.values(viewIds).forEach(viewId => {
        const view = document.getElementById(viewId);
        if (view) {
            view.hidden = viewId !== activeViewId;
        }
    });
}

/** Logs an API failure without exposing response data. */
function logApiError(error) {
    console.error(
        `${error.status || 'Network error'}: ` +
        `${error.statusText || 'Payment status request failed'}`
    );
}
