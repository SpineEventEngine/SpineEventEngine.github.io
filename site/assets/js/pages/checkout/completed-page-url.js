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

/**
 * Builds Spine's payment-result URL from its checkout URL.
 *
 * @param {string} currentUrl absolute checkout URL
 * @param {string} orderId Paygate order ID
 * @return {string} absolute payment-result URL
 */
export function getCompletedPageUrl(currentUrl, orderId) {
    const completedUrl = new URL(currentUrl);
    const checkoutPath = /\/checkout\/?$/;

    if (checkoutPath.test(completedUrl.pathname)) {
        completedUrl.pathname = completedUrl.pathname.replace(
            checkoutPath,
            '/checkout-completed/'
        );
    } else {
        return '';
    }
    completedUrl.search = '';
    completedUrl.searchParams.set('orderId', orderId);
    completedUrl.hash = '';
    return completedUrl.href;
}

/**
 * Builds Spine's checkout URL from its payment-result URL.
 *
 * @param {string} currentUrl absolute payment-result URL
 * @param {string} orderId Paygate order ID
 * @return {string} absolute checkout URL, or an empty string for an unsupported path
 */
export function getCheckoutPageUrl(currentUrl, orderId) {
    const checkoutUrl = new URL(currentUrl);
    const completedPath = /\/checkout-completed\/?$/;

    if (completedPath.test(checkoutUrl.pathname)) {
        checkoutUrl.pathname = checkoutUrl.pathname.replace(completedPath, '/checkout/');
    } else {
        return '';
    }
    checkoutUrl.search = '';
    checkoutUrl.searchParams.set('orderId', orderId);
    checkoutUrl.hash = '';
    return checkoutUrl.href;
}
