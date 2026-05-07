/*
 * Copyright 2025, TeamDev. All rights reserved.
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

import * as params from '@params';
import {createPurchaseClient} from 'js/modules/paygate/purchases';

/**
 * The user's consent.
 *
 * <p>The user's consents for services and data processing flows.
 *
 * @typedef {Object} Consent
 * @property {boolean} privacyConsent indicates whether the user gives consent to
 * process his personal information
 * @property {boolean} supportAgreementConsent indicates whether the user agrees to be
 * bound by the terms of the Development Support Agreement
 * @property {boolean} newsletterConsent indicates whether the user agrees to receive
 * newsletters
 */

/**
 * The user's consent submission data.
 *
 * <p>The user's consents and the reCAPTCHA token. The token is used to verify whether it is a
 * real user or some malicious code.
 *
 * @typedef {Object} ConsentRequest
 * @property {string} orderId paygate order ID
 * @property {Consent} consent the user's consent
 * @property {{token: string}} recaptcha reCAPTCHA verification payload
 */

/**
 * Paygate response for the `place-order` endpoint.
 *
 * @typedef {Object} PlaceOrderResponse
 * @property {string} orderId created paygate order ID
 */
$(
    function () {
        const $privacyConsent = $('#privacyConsent');
        const $supportAgreementConsent = $('#supportAgreementConsent');
        const $orderButtonHolder = $('.pricing-btn-holder');
        const $orderButton = $('#order-now-btn');
        const $redirectScreen = $('#redirectScreen');
        const $loader = $redirectScreen.find('.redirect-loader');
        const $errorContainer = $redirectScreen.find('.redirect-error');
        const $linkBack = $redirectScreen.find('#linkBack');
        const $consentCheckboxes = $("input[type='checkbox'].consent");

        const purchaseClient = createPurchaseClient(params.payment.paygateurl);
        const reCaptchaSiteKey = params.payment.recaptchakey;
        const consentUrl = params.payment.consenturl;
        const productId = ($('[data-paygate-product-id]').attr('data-paygate-product-id') || '')
            .trim();
        const shouldSubmitConsent = params.environment === 'production';

        $orderButtonHolder.tooltip('enable');

        $consentCheckboxes.change(() => {
            changeElementState($orderButtonHolder, isConsentObtained());
        });

        $orderButton.click(() => {
            if (isConsentObtained()) {
                submitOrder();
            }
        });

        $linkBack.click(e => {
            e.preventDefault();
            hideRedirect();
        });

        /**
         * Checks if all consent checkboxes are checked.
         *
         * @return {boolean} `true` if all checkboxes are checked, `false` otherwise
         */
        function isConsentObtained() {
            return $consentCheckboxes.length == $consentCheckboxes.filter(":checked").length;
        }

        /**
         * Changes element's disabled/enabled state.
         *
         * @param {jQuery} element the element to change the state for
         * @param {boolean} enable denotes whether the element should be enabled
         */
        function changeElementState(element, enable) {
            const button = element.find($orderButton);
            if (enable) {
                button.removeAttr('disabled');
                button.removeClass('disabled');
                $orderButtonHolder.tooltip('disable');
            } else {
                button.attr('disabled', true);
                button.addClass('disabled');
                $orderButtonHolder.tooltip('enable');
            }
        }

        /**
         * Places a Paygate order, sends consent in production, and opens checkout.
         *
         * <p>Development builds skip consent submission so local Paygate testing is not blocked by
         * the production consent service.
         */
        async function submitOrder() {
            showRedirect();
            setOrderButtonProcessing(true);

            try {
                if (!productId) {
                    throw new Error('Paygate product ID is not configured.');
                }

                const order = await purchaseClient.placeOrder(productId);
                const orderId = order.orderId;

                if (!orderId) {
                    throw new Error('Paygate did not return an order ID.');
                }

                if (shouldSubmitConsent) {
                    const token = await getRecaptchaToken();
                    await submitConsent(buildConsentRequest(orderId, token));
                }

                redirectToCheckout(orderId);
            } catch (error) {
                logOrderError(error);
                showErrorMessage();
                setOrderButtonProcessing(false);
            }
        }

        /**
         * Builds the production consent API request.
         *
         * @param {string} orderId paygate order ID
         * @param {string} token reCAPTCHA token generated by Google API
         * @return {ConsentRequest} consent request body
         */
        function buildConsentRequest(orderId, token) {
            return {
                orderId,
                consent: {
                    privacyConsent: $privacyConsent.prop('checked'),
                    supportAgreementConsent: $supportAgreementConsent.prop('checked'),
                },
                recaptcha: {
                    token
                }
            };
        }

        /**
         * Gets the invisible reCAPTCHA token for consent submission.
         *
         * @return {Promise<string>} generated reCAPTCHA token
         */
        function getRecaptchaToken() {
            return new Promise((resolve, reject) => {
                if (!window.grecaptcha) {
                    reject(new Error('reCAPTCHA is unavailable.'));
                    return;
                }

                grecaptcha.ready(() => {
                    grecaptcha
                        .execute(reCaptchaSiteKey, {action: 'submitConsent'})
                        .then(resolve)
                        .catch(reject);
                });
            });
        }

        /**
         * Sends the consent payload to the production consent endpoint.
         *
         * @param {ConsentRequest} consentRequest consent request body
         * @return {Promise<void>} resolves when consent is accepted
         */
        async function submitConsent(consentRequest) {
            const response = await fetch(consentUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(consentRequest)
            });

            if (!response.ok) {
                throw ({
                    status: response.status,
                    statusText: response.statusText,
                    body: await readResponseBody(response)
                });
            }
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

        /**
         * Shows the redirect screen.
         */
        function showRedirect() {
            $errorContainer.hide();
            $loader.show();
            $redirectScreen.show();
        }

        /**
         * Hides the loader and shows the error message.
         */
        function showErrorMessage() {
            $loader.hide();
            $errorContainer.show();
        }

        /**
         * Hides the redirect screen.
         */
        function hideRedirect() {
            $redirectScreen.hide();
            setOrderButtonProcessing(false);
        }

        /**
         * Enables or disables the order button while the order flow is in progress.
         *
         * @param {boolean} isProcessing whether the order flow is currently running
         */
        function setOrderButtonProcessing(isProcessing) {
            $orderButton.prop('disabled', isProcessing || !isConsentObtained());
            $orderButton.toggleClass('disabled', isProcessing || !isConsentObtained());
        }

        /**
         * Redirects to the checkout page for the created order.
         *
         * @param {string} orderId paygate order ID
         */
        function redirectToCheckout(orderId) {
            window.location = `/checkout/?orderId=${encodeURIComponent(orderId)}`;
        }

        /**
         * Logs order-flow failures in a compact and consistent format.
         *
         * @param {Object|Error} error order-flow error
         */
        function logOrderError(error) {
            console.error(
                `${error.status || 'Order flow error'}: ` +
                `${error.statusText || error.message || 'Request failed'}`
            );

            if (error.body) {
                console.error('Error response:', error.body);
            }
        }
    }
);
