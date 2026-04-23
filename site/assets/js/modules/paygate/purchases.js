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
 * Paygate product data returned for a checkout order.
 *
 * @typedef {Object} PaygateProduct
 * @property {string} [name] product display name
 * @property {string} [description] product description shown on checkout
 * @property {number|string} [netPrice] product price before VAT
 * @property {string} [currency] product currency code
 */

/**
 * Paygate response for the `place-order` endpoint.
 *
 * @typedef {Object} PlaceOrderResponse
 * @property {string} orderId created paygate order ID
 * @property {PaygateProduct|null} product product data for the new order
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
 * @property {number|string} netPrice price before VAT
 * @property {number|string} vatRate vat rate as a decimal fraction
 * @property {number|string} vatAmount VAT amount for the order
 * @property {number|string} total total price including VAT
 * @property {string} currency order currency code
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
 * Billing information submitted to Paygate before redirecting to payment.
 *
 * @typedef {Object} BillingInfo
 * @property {string} name full buyer name or company fallback name
 * @property {string} email buyer email address
 * @property {BillingAddress} address billing address details
 * @property {BillingCompany|null} company optional company billing details
 * @property {string} [phoneNumber] optional normalized phone number including
 *   country code
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
 * @property {string} [paymentLink] preferred payment redirect URL
 * @property {string} [redirectUrl] alternative payment redirect URL
 * @property {string} [url] alternative response URL field
 * @property {string} [link] alternative response link field
 */

/**
 * Error object thrown when a Paygate request fails.
 *
 * @typedef {Object} PurchaseApiError
 * @property {number} status http response status code
 * @property {string} statusText http response status text
 * @property {*|null} body parsed response body, if any
 * @property {string} message human-readable error message
 */

/**
 * Paygate purchase endpoint methods used by checkout.
 *
 * @typedef {Object} PaygatePurchaseClient
 * @property {function(string): Promise<PlaceOrderResponse>} placeOrder creates
 *   a checkout order for the given product ID
 * @property {function(CalculateChargesRequest):
 *   Promise<CalculateChargesResponse>} calculateCharges calculates VAT and
 *   totals for the current order
 * @property {function(SubmitBillingInfoRequest):
 *   Promise<SubmitBillingInfoResponse>} submitBillingInfo sends billing details
 *   and returns payment redirect data
 */

/**
 * Creates a client for Paygate purchase endpoints.
 *
 * @param {string} serverUrl base URL of the Paygate API server
 * @return {PaygatePurchaseClient} paygate purchase endpoint methods
 */
export function createPurchaseClient(serverUrl) {
    const baseUrl = normalizeServerUrl(serverUrl);

    return {
        placeOrder(productId) {
            return postJson(`${baseUrl}/purchases/place-order`, {productId});
        },
        calculateCharges(payload) {
            return postJson(`${baseUrl}/purchases/calculate-charges`, payload);
        },
        submitBillingInfo(payload) {
            return postJson(`${baseUrl}/purchases/submit-billing-info`, payload);
        }
    };
}

/**
 * Removes trailing slashes from the configured Paygate server URL.
 *
 * @param {string} url raw configured Paygate server URL
 * @return {string} server URL without trailing slashes
 */
export function normalizeServerUrl(url) {
    return String(url || '').replace(/\/+$/, '');
}

/**
 * Sends a JSON POST request and returns the parsed response body.
 *
 * @param {string} url endpoint URL
 * @param {Object} payload json request body
 * @return {Promise<*>} parsed response body when the request succeeds
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
        throw /** @type {PurchaseApiError} */ ({
            status: response.status,
            statusText: response.statusText,
            body,
            message: responseMessage(body)
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

    if (response.status === 204) {
        return null;
    }

    try {
        return contentType.includes('application/json')
            ? await response.json()
            : await response.text();
    } catch (ignored) {
        return null;
    }
}

/**
 * Extracts a human-readable error message from a parsed response body.
 *
 * @param {*} body parsed response body
 * @return {string} message text when present, otherwise an empty string
 */
function responseMessage(body) {
    if (!body) {
        return '';
    }

    return typeof body === 'string' ? body : body.message || '';
}
