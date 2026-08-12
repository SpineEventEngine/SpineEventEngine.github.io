/*
 * Copyright 2026, TeamDev. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
    const checkoutFile = /\/checkout(\.[^./]+)$/;

    if (checkoutPath.test(completedUrl.pathname)) {
        completedUrl.pathname = completedUrl.pathname.replace(
            checkoutPath,
            '/checkout-completed/'
        );
    } else if (checkoutFile.test(completedUrl.pathname)) {
        completedUrl.pathname = completedUrl.pathname.replace(
            checkoutFile,
            '/checkout-completed$1'
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
    const completedFile = /\/checkout-completed(\.[^./]+)$/;

    if (completedPath.test(checkoutUrl.pathname)) {
        checkoutUrl.pathname = checkoutUrl.pathname.replace(completedPath, '/checkout/');
    } else if (completedFile.test(checkoutUrl.pathname)) {
        checkoutUrl.pathname = checkoutUrl.pathname.replace(
            completedFile,
            '/checkout$1'
        );
    } else {
        return '';
    }
    checkoutUrl.search = '';
    checkoutUrl.searchParams.set('orderId', orderId);
    checkoutUrl.hash = '';
    return checkoutUrl.href;
}
