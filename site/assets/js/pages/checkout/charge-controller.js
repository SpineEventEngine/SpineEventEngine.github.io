/*
 * Copyright 2026, TeamDev. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
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

/**
 * @typedef {import('js/modules/paygate/purchases').PaygatePurchaseClient} PaygatePurchaseClient
 * @typedef {import('js/pages/checkout/view-controller').CheckoutViewController}
 * CheckoutViewController
 */

import {createChargeRequestService} from 'js/pages/checkout/charge-request';
import {createDelayedRequestController} from 'js/pages/checkout/delayed-request-controller';

/**
 * Delay before sending the 'calculate-charges' request when VAT ID was changed.
 *
 * @type {number}
 */
const vatIdInputDelay = 1000;

/**
 * API exposed by the checkout charge controller.
 *
 * @typedef {Object} CheckoutChargeController
 * @property {function(): Promise<void>} flush
 *   cancels delayed VAT recalculation and requests charges immediately
 * @property {function(): boolean} hasCurrentCharges
 *   checks whether current country and VAT inputs have fresh charge data
 * @property {function(): boolean} hasScheduledRequest
 *   checks whether a delayed VAT recalculation is pending
 * @property {function(): void} invalidate
 *   clears charge state and ignores older in-flight responses
 * @property {function(): Promise<void>} requestIfReady
 *   recalculates charges when all required inputs are present
 * @property {function(): void} schedule
 *   debounces charge recalculation while typing VAT ID
 * @property {function(): void} updateSubmitState
 *   enables submit only when current charge data is ready
 */

/**
 * Creates the checkout charge-calculation controller.
 *
 * @param {Object} options charge controller options
 * @param {PaygatePurchaseClient} options.purchaseClient paygate purchase client
 * @param {CheckoutViewController} options.view checkout view controller
 * @param {function(): Promise<string>} options.ensureOrderId creates or reuses the Paygate order
 * @param {function(): string} options.getBuyerCountryCode returns the selected billing country
 * @param {function(): string} options.getVatId returns the current VAT ID value
 * @param {function(string): void} options.onVatIdError renders the VAT ID API validation error
 * @param {function(Object|Error): void} options.logApiError logs request failures
 * @return {CheckoutChargeController} charge lifecycle helpers for the checkout page
 */
export function createChargeController(
    {
        purchaseClient,
        view,
        ensureOrderId,
        getBuyerCountryCode,
        getVatId,
        onVatIdError,
        logApiError
    }
) {
    const requestService = createChargeRequestService({
        purchaseClient,
        ensureOrderId,
        getBuyerCountryCode,
        getVatId
    });
    const delayedRequest = createDelayedRequestController({
        delay: vatIdInputDelay,
        getRequestKey: requestService.getRequestKey,
        request: requestService.requestCharges,
        onSuccess: response => {
            view.updateCharges(response);
        },
        onError: handleRequestError,
        onStateChange: updateSubmitState
    });

    /**
     * Enables checkout submission only when the current charge calculation is ready.
     */
    function updateSubmitState() {
        view.setSubmitDisabled(view.isFormHidden() || !delayedRequest.hasCurrentResult());
    }

    /**
     * Handles a failed charge calculation response from the delayed request controller.
     *
     * @param {Object} error error response
     * @param {Object} context delayed request context
     * @param {boolean} context.isCurrentRequest whether the failed request is still current
     */
    function handleRequestError(error, {isCurrentRequest}) {
        const isVatError = requestService.isVatError(error);

        if (!isVatError) {
            view.showErrorModal();
        }

        if (!isCurrentRequest) {
            logApiError(error);
            return;
        }

        if (isVatError) {
            onVatIdError(requestService.getVatErrorReason(error));
        }

        logApiError(error);
    }

    return {
        flush: delayedRequest.flush,
        hasCurrentCharges: delayedRequest.hasCurrentResult,
        hasScheduledRequest: delayedRequest.hasScheduledRequest,
        invalidate: delayedRequest.invalidate,
        requestIfReady: delayedRequest.requestIfReady,
        schedule: delayedRequest.schedule,
        updateSubmitState
    };
}
