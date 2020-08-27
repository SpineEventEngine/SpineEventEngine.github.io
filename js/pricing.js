---
    # Do not remove`---` tags.These are the frontmatter tags for Jekyll variables.
---

    /*
     * Copyright 2020, TeamDev. All rights reserved.
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

    /**
     * This script contains helper functions for the agreement checkboxes on `Getting Help` page.
     *
     * Please see `/getting-help/service-section.html` for usage.
     */
    'use strict';

$(
    function () {
        const $privacyConsent = $('#privacyConsent');
        const $supportAgreementConsent = $('#supportAgreementConsent');
        const $orderButton = $('#order-now-btn');
        const $orderButtonHolder = $('.pricing-btn-holder');
        const $redirectScreen = $('#redirectScreen');
        const $loader = $redirectScreen.find('.redirect-loader');
        const $errorContainer = $redirectScreen.find('.redirect-error');
        const $linkBack = $redirectScreen.find('#linkBack');
        const $consentCheckboxes = $("input[type='checkbox'].consent");
        const disabledBtnTitle = 'Read and agree to the terms to\xA0continue';

        const orderUrl = "{{site.data.payment_config.orderUrl}}";

        const apiUrl = getApiUrl();

        $orderButtonHolder.attr('data-original-title', disabledBtnTitle);

        $consentCheckboxes.change(() => {
            changeElementState($orderButton, $orderButtonHolder, isConsentObtained());
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
         * Returns transaction API Url.
         *
         * @return {string} returns development or production API Url based on jekyll environment
         */
        function getApiUrl() {
            if ("{{jekyll.environment}}" === "development") {
                return "{{site.data.payment_config.devApiUrl}}";
            } else {
                return "{{site.data.payment_config.prodApiUrl}}";
            }
        }

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
         * @param {jQuery} elementHolder the element holder to apply or hide a tooltip
         * @param {boolean} enable denotes whether the element should be enabled.
         * If `true` — enables the element, otherwise — disables
         */
        function changeElementState(element, elementHolder, enable) {
            if (enable) {
                element.removeAttr('disabled');
                element.removeClass('disabled');
                elementHolder.removeAttr('data-original-title');
            } else {
                element.attr('disabled', true);
                element.addClass('disabled');
                elementHolder.attr('data-original-title', disabledBtnTitle);
            }
        }

        /**
         * Submits consent transaction.
         *
         * <p>Prepares Privacy, Support Agreement consents data and transaction Url for sending and
         * calls send transaction function.
         */
        function submitOrder() {
            const privacyConsent = $privacyConsent.prop("checked");
            const supportAgreementConsent = $supportAgreementConsent.prop("checked");
            const data = JSON.stringify({privacyConsent, supportAgreementConsent});
            const transactionUrl = `${apiUrl}/transaction`;
            sendPaymentTransaction(transactionUrl, data);
        }

        /**
         * The user's consent.
         *
         * <p>The user's consents for services and data processing flows.
         *
         * @typedef {Object} Consent
         * @property {boolean} privacyConsent indicates whether the user gives consent to
         * process his personal information
         * @property {boolean} supportAgreementConsent indicates whether the user agrees to be bound by the
         * terms of the Development Support Agreement
         */

        /**
         * Generates the payment processing transaction.
         *
         * <p>Sends the transaction data and returns the transaction ID. If the request is successful,
         * redirects to the Payment screen.
         *
         * @param {string} transactionUrl the transaction API URL
         * @param {Consent} data the Consent transaction data
         */
        function sendPaymentTransaction(transactionUrl, data) {
            showRedirect();
            $.ajax(transactionUrl, {
                type: 'POST',
                data: data,
                contentType: 'application/json',
                success: (data) => {
                    const obj = JSON.parse(data);
                    const paymentUrl = `${orderUrl}&CUSTOMERID=${obj.id}`;
                    window.location = paymentUrl;
                    hideRedirect();
                },
                error: (jqXhr) => {
                    console.error(`${jqXhr.status}: ${jqXhr.statusText}`);
                    showErrorMessage();
                }
            });
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
         *  Hides the redirect screen.
         */
        function hideRedirect() {
            $redirectScreen.hide();
        }
    }
);
