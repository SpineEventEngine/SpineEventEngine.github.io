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
 */

/**
 * Paygate-specific charge request helpers.
 *
 * @typedef {Object} ChargeRequestService
 * @property {function(): string} getRequestKey builds the current country:VAT request key
 * @property {function(): string} getVatErrorReason returns the Paygate VAT error reason
 * @property {function(Object): boolean} isVatError checks whether the error is a VAT failure
 * @property {function(): Promise<Object|null>} requestCharges sends the current charge request
 */

/**
 * Creates the Paygate charge request service used by checkout.
 *
 * @param {Object} options charge request options
 * @param {PaygatePurchaseClient} options.purchaseClient paygate purchase client
 * @param {function(): Promise<string>} options.ensureOrderId creates or reuses the Paygate order
 * @param {function(): string} options.getBuyerCountryCode returns the selected billing country
 * @param {function(): string} options.getVatId returns the current VAT ID value
 * @return {ChargeRequestService} paygate charge request helpers
 */
export function createChargeRequestService({
    purchaseClient,
    ensureOrderId,
    getBuyerCountryCode,
    getVatId
}) {
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
     * Checks whether the Paygate error is a VAT validation failure.
     *
     * @param {Object} error request error
     * @return {boolean} true when the error is a Paygate VAT validation response
     */
    function isVatError(error) {
        const reason = getVatErrorReason(error);
        return error.status === 422 && Boolean(reason);
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
        getRequestKey,
        getVatErrorReason,
        isVatError,
        requestCharges
    };
}
