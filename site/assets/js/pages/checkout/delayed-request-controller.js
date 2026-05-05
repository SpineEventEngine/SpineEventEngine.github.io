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
 * Generic delayed-request controller API.
 *
 * @typedef {Object} DelayedRequestController
 * @property {function(): Promise<void>} flush
 *   cancels the delayed request and runs it immediately
 * @property {function(): boolean} hasCurrentResult
 *   checks whether current inputs already have a fresh response
 * @property {function(): boolean} hasScheduledRequest
 *   checks whether a delayed request is pending
 * @property {function(): void} invalidate
 *   clears current request state and ignores older responses
 * @property {function(): Promise<void>} requestIfReady
 *   runs the request when a request key is available
 * @property {function(): void} schedule
 *   delays the request for the configured amount of time
 */

/**
 * Creates a reusable controller for `input -> delayed request -> latest response` flows.
 *
 * @typedef {Object} DelayedRequestState
 * @property {boolean} hasCurrentResult whether current inputs already have a fresh response
 * @property {boolean} isRequesting whether a request is currently in flight
 *
 * @param {Object} options delayed request options
 * @param {number} options.delay debounce delay in milliseconds
 * @param {function(): string} options.getRequestKey returns the current request key
 * @param {function(): Promise<*|null>} options.request sends the current request
 * @param {function(*): void} options.onSuccess handles the latest successful response
 * @param {function(Object, boolean): void} options.onError handles request failures
 * @param {function(DelayedRequestState): void} options.onStateChange reacts to state changes
 * @return {DelayedRequestController} delayed request helpers
 */
export function createDelayedRequestController({
    delay,
    getRequestKey,
    request,
    onSuccess,
    onError,
    onStateChange
}) {
    let requestId = 0;
    let requestTimer = null;
    let pendingRequestKey = '';
    let pendingRequestPromise = null;
    let readyRequestKey = '';
    let isRequesting = false;

    /**
     * Runs the request immediately when the current key is present.
     *
     * @return {Promise<void>} resolves when the request flow completes
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

        return startRequest(requestKey);
    }

    /**
     * Cancels the delayed request and runs it immediately.
     *
     * @return {Promise<void>} resolves when the request flow completes
     */
    function flush() {
        clearScheduledRequest();
        return requestIfReady();
    }

    /**
     * Schedules the request after the configured delay.
     */
    function schedule() {
        clearScheduledRequest();
        requestTimer = window.setTimeout(() => {
            requestTimer = null;
            requestIfReady();
        }, delay);
    }

    /**
     * Clears state and ignores any older in-flight response.
     */
    function invalidate() {
        clearScheduledRequest();
        requestId += 1;
        isRequesting = false;
        pendingRequestKey = '';
        pendingRequestPromise = null;
        readyRequestKey = '';
        emitStateChange();
    }

    /**
     * Checks whether a delayed request is currently scheduled.
     *
     * @return {boolean} true when a delayed request is pending
     */
    function hasScheduledRequest() {
        return Boolean(requestTimer);
    }

    /**
     * Checks whether the current inputs already have a fresh response.
     *
     * @return {boolean} true when the current request key is ready
     */
    function hasCurrentResult() {
        const requestKey = getRequestKey();
        return Boolean(requestKey) && requestKey === readyRequestKey;
    }

    /**
     * Reuses the latest request promise when inputs have not changed.
     *
     * @param {string} requestKey current request key
     * @return {Promise<void>|null} reusable request promise, if available
     */
    function getReusableRequest(requestKey) {
        if (requestKey === readyRequestKey) {
            return Promise.resolve();
        }

        return requestKey === pendingRequestKey && pendingRequestPromise
            ? pendingRequestPromise
            : null;
    }

    /**
     * Starts a new request for the given key.
     *
     * @param {string} requestKey current request key
     * @return {Promise<void>} resolves when the request flow completes
     */
    function startRequest(requestKey) {
        const currentRequestId = ++requestId;

        isRequesting = true;
        pendingRequestKey = requestKey;
        readyRequestKey = '';
        emitStateChange();
        pendingRequestPromise = Promise.resolve()
            .then(request)
            .then(response => handleSuccess(currentRequestId, requestKey, response))
            .catch(error => handleError(currentRequestId, requestKey, error))
            .finally(() => finishRequest(currentRequestId));

        return pendingRequestPromise;
    }

    /**
     * Applies a successful response when it still matches the latest request.
     *
     * @param {number} currentRequestId current request sequence number
     * @param {string} requestKey request key for the response
     * @param {*|null} response latest response
     */
    function handleSuccess(currentRequestId, requestKey, response) {
        if (currentRequestId !== requestId || !response) {
            return;
        }

        readyRequestKey = requestKey;
        onSuccess(response);
    }

    /**
     * Handles request failures and marks current inputs as not ready.
     *
     * @param {number} currentRequestId current request sequence number
     * @param {string} requestKey request key for the failed request
     * @param {Object} error request error
     */
    function handleError(currentRequestId, requestKey, error) {
        const isCurrentRequest = currentRequestId === requestId;

        if (isCurrentRequest) {
            readyRequestKey = '';
        }

        onError(error, isCurrentRequest);
    }

    /**
     * Clears the tracked in-flight request after it finishes.
     *
     * @param {number} currentRequestId current request sequence number
     */
    function finishRequest(currentRequestId) {
        if (currentRequestId !== requestId) {
            return;
        }

        isRequesting = false;
        pendingRequestKey = '';
        pendingRequestPromise = null;
        emitStateChange();
    }

    /**
     * Clears the delayed request timer when one exists.
     */
    function clearScheduledRequest() {
        if (!requestTimer) {
            return;
        }

        window.clearTimeout(requestTimer);
        requestTimer = null;
    }

    /**
     * Emits the current delayed-request state to the consumer.
     */
    function emitStateChange() {
        onStateChange({
            hasCurrentResult: hasCurrentResult(),
            isRequesting
        });
    }

    return {
        flush,
        hasCurrentResult,
        hasScheduledRequest,
        invalidate,
        requestIfReady,
        schedule
    };
}
