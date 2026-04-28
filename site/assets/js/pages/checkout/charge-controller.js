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
export function createChargeController({
    purchaseClient,
    view,
    ensureOrderId,
    getBuyerCountryCode,
    getVatId,
    onVatIdError,
    logApiError
}) {
    let chargeRequestId = 0;
    let chargesRequestTimer = null;
    let pendingChargesKey = '';
    let pendingChargesPromise = null;
    let chargesReadyKey = '';

    /**
     * Recalculates charges when country and VAT ID are available.
     *
     * @return {Promise<void>} resolves when charges are updated, skipped, or handled as an error
     */
    async function requestIfReady() {
        const requestKey = getRequestKey();
        const reusableRequest = getReusableRequest(requestKey);

        if (!requestKey) {
            invalidate();
            return;
        }

        if (reusableRequest) {
            return reusableRequest;
        }

        return startChargesRequest(requestKey);
    }

    /**
     * Cancels delayed VAT recalculation and requests charges immediately.
     *
     * @return {Promise<void>} resolves when the immediate request flow finishes
     */
    function flush() {
        clearScheduledRequest();
        return requestIfReady();
    }

    /**
     * Debounces charge recalculation while the user types a VAT ID.
     */
    function schedule() {
        clearScheduledRequest();
        chargesRequestTimer = window.setTimeout(() => {
            chargesRequestTimer = null;
            requestIfReady();
        }, vatIdInputDelay);
    }

    /**
     * Clears charge state and ignores older responses.
     */
    function invalidate() {
        clearScheduledRequest();
        chargeRequestId += 1;
        pendingChargesKey = '';
        pendingChargesPromise = null;
        chargesReadyKey = '';
        updateSubmitState();
    }

    /**
     * Checks whether a delayed VAT request is currently scheduled.
     *
     * @return {boolean} true when a delayed request timer is active
     */
    function hasScheduledRequest() {
        return Boolean(chargesRequestTimer);
    }

    /**
     * Checks whether charges are calculated for the form's current country and VAT ID.
     *
     * @return {boolean} true when the latest charges match the current form state
     */
    function hasCurrentCharges() {
        const requestKey = getRequestKey();
        return Boolean(requestKey) && requestKey === chargesReadyKey;
    }

    /**
     * Returns a finished or in-flight request promise that can be reused.
     *
     * @param {string} requestKey joined country:VAT key
     * @return {Promise<void>|null} reusable promise for the same inputs, if any
     */
    function getReusableRequest(requestKey) {
        if (requestKey === chargesReadyKey) {
            return Promise.resolve();
        }

        return requestKey === pendingChargesKey && pendingChargesPromise
            ? pendingChargesPromise
            : null;
    }

    /**
     * Starts a new charge calculation request for the current checkout inputs.
     *
     * @param {string} requestKey joined country:VAT key
     * @return {Promise<void>} resolves when the request lifecycle is finished
     */
    function startChargesRequest(requestKey) {
        const requestId = ++chargeRequestId;

        pendingChargesKey = requestKey;
        chargesReadyKey = '';
        updateSubmitState();
        pendingChargesPromise = ensureOrderId()
            .then(orderId => createRequestPayload(requestId, orderId))
            .then(payload => payload ? purchaseClient.calculateCharges(payload) : null)
            .then(response => handleRequestSuccess(requestId, requestKey, response))
            .catch(error => handleRequestError(requestId, error))
            .finally(() => finishRequest(requestId));

        return pendingChargesPromise;
    }

    /**
     * Enables checkout submission only when the current charge calculation is ready.
     */
    function updateSubmitState() {
        view.setSubmitDisabled(view.isFormHidden() || !hasCurrentCharges());
    }

    /**
     * Builds the Paygate calculate-charges payload for the current request state.
     *
     * @param {number} requestId internal request sequence number
     * @param {string} orderId paygate order ID
     * @return {{orderId: string, buyerCountryCode: string, vatId: string}|null} request payload
     */
    function createRequestPayload(requestId, orderId) {
        if (requestId !== chargeRequestId) {
            return null;
        }

        const buyerCountryCode = getBuyerCountryCode();
        const vatId = getVatId();

        if (!orderId || !buyerCountryCode || !vatId) {
            return null;
        }

        return {
            orderId,
            buyerCountryCode,
            vatId
        };
    }

    /**
     * Builds the cache key for the current charge calculation inputs.
     *
     * @return {string} joined country:VAT key,
     *   or empty string when calculation cannot run yet
     */
    function getRequestKey() {
        const buyerCountryCode = getBuyerCountryCode();
        const vatId = getVatId();

        return buyerCountryCode && vatId
            ? [buyerCountryCode, vatId].join(':')
            : '';
    }

    /**
     * Applies a successful charge calculation response if it is still current.
     *
     * @param {number} requestId internal request sequence number
     * @param {string} requestKey joined order:country:VAT key
     * @param {Object} response paygate charge calculation response
     */
    function handleRequestSuccess(requestId, requestKey, response) {
        if (requestId !== chargeRequestId || !response) {
            return;
        }

        chargesReadyKey = requestKey;
        view.updateCharges(response);
        updateSubmitState();
    }

    /**
     * Handles a failed charge calculation response.
     *
     * @param {number} requestId internal request sequence number
     * @param {Object} error error response
     */
    function handleRequestError(requestId, error) {
        const isCurrentRequest = requestId === chargeRequestId;
        const isVatError = isVatErrorResponse(error);

        if (!isVatError) {
            view.showErrorModal();
        }

        if (!isCurrentRequest) {
            logApiError(error);
            return;
        }

        chargesReadyKey = '';
        updateSubmitState();

        if (isVatError) {
            onVatIdError(error.body.reason);
        }

        logApiError(error);
    }

    /**
     * Clears the tracked in-flight request when the current request finishes.
     *
     * @param {number} requestId internal request sequence number
     */
    function finishRequest(requestId) {
        if (requestId !== chargeRequestId) {
            return;
        }

        pendingChargesKey = '';
        pendingChargesPromise = null;
    }

    /**
     * Clears the delayed VAT recalculation timer when one is active.
     */
    function clearScheduledRequest() {
        if (!chargesRequestTimer) {
            return;
        }

        window.clearTimeout(chargesRequestTimer);
        chargesRequestTimer = null;
    }

    /**
     * Checks whether a calculation error should is related to the VAT ID.
     *
     * @param {Object} error error response
     * @return {boolean} true when response contains a VAT ID verification failure reason
     */
    function isVatErrorResponse(error) {
        return error.status === 422 &&
            error.body &&
            /^VAT_ID_/.test(error.body.reason || '');
    }

    return {
        flush,
        hasCurrentCharges,
        hasScheduledRequest,
        invalidate,
        requestIfReady,
        schedule,
        updateSubmitState
    };
}
