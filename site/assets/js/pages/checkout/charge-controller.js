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

import {createDelayedRequestController} from 'js/pages/checkout/delayed-request-controller';
import {fieldValidationState} from 'js/pages/checkout/form-controller';

/**
 * Delay in milliseconds before sending the 'calculate-charges' request when VAT ID was changed.
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
 * @param {function(): boolean} [options.canSubmit] checks whether submit is allowed by other UI
 *   requirements
 * @param {function(string): void} options.onFieldValidationStateChange updates field UI state
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
        canSubmit = () => true,
        onFieldValidationStateChange,
        onVatIdError,
        logApiError
    }
) {
    const delayedRequest = createDelayedRequestController({
        delay: vatIdInputDelay,
        getRequestKey,
        request: requestCharges,
        onSuccess: response => {
            view.updateCharges(response);
        },
        onError: handleRequestError,
        onStateChange: handleRequestStateChange
    });

    /**
     * Reacts to delayed-request state changes.
     *
     * @param {Object} state delayed-request state snapshot
     * @param {boolean} state.hasCurrentResult whether charges are ready for current inputs
     * @param {boolean} state.isRequesting whether a charge request is currently in flight
     */
    function handleRequestStateChange(state) {
        updateSubmitState(state.hasCurrentResult);
        updateVatIdState(state);
    }

    /**
     * Enables checkout submission only when the current charge calculation is ready.
     *
     * @param {boolean} [hasCurrentResult] whether current inputs already have fresh charges
     */
    function updateSubmitState(hasCurrentResult = delayedRequest.hasCurrentResult()) {
        view.setSubmitDisabled(view.isFormHidden() || !hasCurrentResult || !canSubmit());
    }

    /**
     * Updates the VAT field visual validation state.
     *
     * @param {Object} state delayed-request state snapshot
     * @param {boolean} state.hasCurrentResult whether charges are ready for current inputs
     * @param {boolean} state.isRequesting whether a charge request is currently in flight
     */
    function updateVatIdState({hasCurrentResult, isRequesting}) {
        const hasRequestKey = Boolean(getRequestKey());

        if (!hasRequestKey) {
            onFieldValidationStateChange(fieldValidationState.idle);
            return;
        }

        if (isRequesting) {
            onFieldValidationStateChange(fieldValidationState.loading);
            return;
        }

        onFieldValidationStateChange(
            hasCurrentResult ? fieldValidationState.success : fieldValidationState.idle
        );
    }

    /**
     * Sends the current Paygate `calculate-charges` request.
     *
     * @return {Promise<Object|null>} charge response, or `null` when inputs are incomplete
     */
    async function requestCharges() {
        const orderId = await ensureOrderId();
        const buyerCountryCode = getBuyerCountryCode();
        const vatId = getVatId();

        if (!orderId || !buyerCountryCode || !vatId) {
            return null;
        }

        return purchaseClient.calculateCharges({
            orderId,
            buyerCountryCode,
            vatId
        });
    }

    /**
     * Builds the cache key for the current charge calculation inputs.
     *
     * @return {string} joined country:VAT key, or empty string when request cannot run yet
     */
    function getRequestKey() {
        const buyerCountryCode = getBuyerCountryCode();
        const vatId = getVatId();

        return buyerCountryCode && vatId
            ? [buyerCountryCode, vatId].join(':')
            : '';
    }

    /**
     * Handles a failed charge calculation response from the delayed request controller.
     *
     * @param {Object} error error response
     * @param {boolean} isCurrentRequest whether the failed request is still current
     */
    function handleRequestError(error, isCurrentRequest) {
        const isVatError = isVatErrorResponse(error);

        if (!isVatError) {
            view.showErrorModal();
        }

        if (!isCurrentRequest) {
            logApiError(error);
            return;
        }

        if (isVatError) {
            onVatIdError(getVatErrorReason(error));
        }

        logApiError(error);
    }

    /**
     * Checks whether the Paygate error is a VAT validation failure.
     *
     * @param {Object} error request error
     * @return {boolean} true when the error is a Paygate VAT validation response
     */
    function isVatErrorResponse(error) {
        return error.status === 422 && Boolean(error.body.vatIdInvalid);
    }

    /**
     * Returns the Paygate VAT validation reason from the error response.
     *
     * @param {Object} error request error
     * @return {string} VAT validation reason, or empty string
     */
    function getVatErrorReason(error) {
        return String(error.body && error.body.vatIdInvalid || '');
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
