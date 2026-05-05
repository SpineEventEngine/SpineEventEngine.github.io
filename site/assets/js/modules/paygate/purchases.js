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
 * Paygate currency payload returned inside money values.
 *
 * @typedef {Object} PaygateCurrency
 * @property {string} code ISO currency code
 * @property {string} symbol currency symbol
 */

/**
 * Paygate money payload.
 *
 * @typedef {Object} PaygateMoney
 * @property {number|string} value decimal amount value
 * @property {PaygateCurrency} currency currency metadata
 */

/**
 * Paygate order data returned by the purchase endpoint.
 *
 * @typedef {Object} PaygateOrder
 * @property {string} orderId paygate order ID
 * @property {string} productName product display name
 * @property {string} productDescription product description shown on checkout
 * @property {boolean} paymentCompleted whether the order was already paid
 */

/**
 * Paygate response for the `place-order` endpoint.
 *
 * @typedef {Object} PlaceOrderResponse
 * @property {string} orderId created paygate order ID
 */

/**
 * Paygate request payload for the `calculate-charges` endpoint.
 *
 * @typedef {Object} CalculateChargesRequest
 * @property {string} orderId paygate order ID
 * @property {string} buyerCountryCode iso billing country code
 * @property {string} vatId buyer VAT ID
 */

/**
 * Paygate response for the `calculate-charges` endpoint.
 *
 * @typedef {Object} CalculateChargesResponse
 * @property {PaygateMoney} netAmount price before VAT
 * @property {number|string} vatRate vat rate as a decimal fraction
 * @property {PaygateMoney} vatAmount VAT amount for the order
 * @property {PaygateMoney} totalAmount total price including VAT
 */

/**
 * Billing address submitted to Paygate.
 *
 * @typedef {Object} BillingAddress
 * @property {string} countryCode iso billing country code
 * @property {string} city billing city
 * @property {string} street combined street address
 * @property {string} postalCode billing postal code
 */

/**
 * Company billing details submitted to Paygate.
 *
 * @typedef {Object} BillingCompany
 * @property {string} name company legal or display name
 * @property {string} vatId company VAT ID
 */

/**
 * Phone number submitted to Paygate.
 *
 * @typedef {Object} PhoneNumber
 * @property {number} countryCode dialing country code without a leading plus sign
 * @property {string} number local phone number digits
 */

/**
 * Billing information submitted to Paygate before redirecting to payment.
 *
 * @typedef {Object} BillingInfo
 * @property {string} name full buyer name or company fallback name
 * @property {string} email buyer email address
 * @property {BillingAddress} address billing address details
 * @property {BillingCompany} company company billing details
 * @property {PhoneNumber} [phoneNumber] optional normalized phone number
 */

/**
 * Paygate request payload for the `submit-billing-info` endpoint.
 *
 * @typedef {Object} SubmitBillingInfoRequest
 * @property {string} orderId paygate order ID
 * @property {BillingInfo} billingInfo billing details for the order
 */

/**
 * Paygate response for the billing-info submission step.
 *
 * @typedef {Object} SubmitBillingInfoResponse
 * @property {string} paymentLink hosted payment redirect URL
 */

/**
 * Generic Paygate error response used for 400, 404, and 500 responses.
 *
 * @typedef {Object} PaygateErrorResponse
 * @property {string} message human-readable error message
 */

/**
 * Charge-calculation validation error response returned with status 422.
 *
 * @typedef {Object} CalculateChargesFailureResponse
 * @property {string|null} vatIdInvalid VAT validation failure reason
 */

/**
 * Error object thrown when a Paygate request fails.
 *
 * @typedef {Object} PurchaseApiError
 * @property {number} status http response status code
 * @property {string} statusText http response status text
 * @property {PaygateErrorResponse|CalculateChargesFailureResponse|string|null} body
 *   parsed response body, if any
 */

/**
 * Paygate purchase endpoint methods used by checkout.
 *
 * @typedef {Object} PaygatePurchaseClient
 * @property {function(string): Promise<PaygateOrder>} getOrder
 *   loads checkout order data by order ID
 * @property {function(string): Promise<PlaceOrderResponse>} placeOrder
 *   creates a checkout order for the given product ID
 * @property {function(CalculateChargesRequest): Promise<CalculateChargesResponse>} calculateCharges
 *   calculates VAT and totals for the current order
 * @property {function(SubmitBillingInfoRequest): Promise<SubmitBillingInfoResponse>} submitBillingInfo
 *   sends billing details and returns payment redirect data
 */

/**
 * Creates a client for Paygate purchase endpoints.
 *
 * @param {string} serverUrl base URL of the Paygate API server
 * @return {PaygatePurchaseClient} paygate purchase endpoint methods
 */
export function createPurchaseClient(serverUrl) {
    return {
        getOrder(orderId) {
            return getJson(`${serverUrl}/purchases/${encodeURIComponent(orderId)}`);
        },
        placeOrder(productId) {
            return postJson(`${serverUrl}/purchases/place-order`, {productId});
        },
        calculateCharges(payload) {
            return postJson(`${serverUrl}/purchases/calculate-charges`, payload);
        },
        submitBillingInfo(payload) {
            return postJson(`${serverUrl}/purchases/provide-billing-details`, payload);
        }
    };
}

/**
 * Sends a JSON GET request and returns the parsed response body.
 *
 * Body will be parsed as JSON or plain text if possible, otherwise `null` is returned.
 *
 * @param {string} url endpoint URL
 * @return {Promise<*>} parsed response body when the request succeeds
 *
 * @throws {PurchaseApiError} if response status is not OK
 */
async function getJson(url) {
    const response = await fetch(url);
    const body = await readResponseBody(response);

    if (!response.ok) {
        throw ({
            status: response.status,
            statusText: response.statusText,
            body
        });
    }

    return body;
}

/**
 * Sends a JSON POST request and returns the parsed response body.
 *
 * Body will be parsed as JSON or plain text if possible, otherwise `null` is returned.
 *
 * @param {string} url endpoint URL
 * @param {Object} payload json request body
 * @return {Promise<*>} parsed response body when the request succeeds
 *
 * @throws {PurchaseApiError} if response status is not OK
 */
async function postJson(url, payload) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    const body = await readResponseBody(response);

    if (!response.ok) {
        throw ({
            status: response.status,
            statusText: response.statusText,
            body
        });
    }

    return body;
}

/**
 * Parses a fetch response body as JSON when possible, otherwise as text.
 *
 * @param {Response} response fetch response to parse
 * @return {Promise<*>} parsed JSON, text, or null when there is no readable body
 */
async function readResponseBody(response) {
    const contentType = response.headers.get('content-type') || '';
    try {
        return contentType.includes('application/json')
            ? await response.json()
            : await response.text();
    } catch (ignored) {
        return null;
    }
}
