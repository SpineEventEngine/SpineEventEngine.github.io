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
 * Creates a client for Paygate purchase endpoints.
 *
 * @param {string} serverUrl - Base URL of the Paygate API server.
 * @return {{placeOrder: function(string): Promise<*>, calculateCharges: function(Object): Promise<*>, submitBillingInfo: function(Object): Promise<*>}} Paygate purchase endpoint methods.
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
 * @param {string} url - Raw configured Paygate server URL.
 * @return {string} Server URL without trailing slashes.
 */
export function normalizeServerUrl(url) {
    return String(url || '').replace(/\/+$/, '');
}

/**
 * Sends a JSON POST request and returns the parsed response body.
 *
 * @param {string} url - Endpoint URL.
 * @param {Object} payload - JSON request body.
 * @return {Promise<*>} Parsed response body when the request succeeds.
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
        throw {
            status: response.status,
            statusText: response.statusText,
            body,
            message: responseMessage(body)
        };
    }

    return body;
}

/**
 * Parses a fetch response body as JSON when possible, otherwise as text.
 *
 * @param {Response} response - Fetch response to parse.
 * @return {Promise<*>} Parsed JSON, text, or null when there is no readable body.
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
 * @param {*} body - Parsed response body.
 * @return {string} Message text when present, otherwise an empty string.
 */
function responseMessage(body) {
    if (!body) {
        return '';
    }

    return typeof body === 'string' ? body : body.message || '';
}
