---
---
// Do not remove `---` tags. These are the frontmatter tags for Jekyll variables.
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
        const $redirectScreen = $('#redirectScreen');
        const $loader = $redirectScreen.find('.redirect-loader');
        const $errorContainer = $redirectScreen.find('.redirect-error');
        const $linkBack = $redirectScreen.find('#linkBack');
        const $consentCheckboxes = $("input[type='checkbox'].consent");

        const orderUrl = "{{site.data.payment_config.orderUrl}}";

        let apiUrl;
        if ("{{jekyll.environment}}" === "development") {
            apiUrl = "{{site.data.payment_config.devApiUrl}}";
        } else {
            apiUrl = "{{site.data.payment_config.prodApiUrl}}";
        }

        $consentCheckboxes.change(() => {
            changeElementState($orderButton, isConsentObtained());
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
         * @return {boolean} true if all checkboxes are checked
         */
        function isConsentObtained () {
            return $consentCheckboxes.length == $consentCheckboxes.filter(":checked").length;
        }

        /**
         * Changes element disabled/enabled state.
         *
         * @param {jQuery} element the element, which state will be changed
         * @param {boolean} enabled if state is `true` the element will be enabled, otherwise it
         * will be disabled
         */
        function changeElementState(element, enabled) {
            if (enabled) {
                element.removeAttr('disabled');
                element.removeClass('disabled');
            } else {
                element.attr('disabled', true);
                element.addClass('disabled');
            }
        }

        /**
         * Submit order handler.
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
         * <p>Contains user's consents for services and data processing flows.
         *
         * @typedef {Object} Consent
         * @property {boolean} privacyConsent indicates whether the user give a consent to
         * process his personal information
         * @property {boolean} supportAgreementConsent indicates whether the user agree to be bound by the
         * terms of Development Support Agreement
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
                    console.error(jqXhr.status + ': ' + jqXhr.statusText);
                    showErrorMessage();
                }
            });
        }

        /**
         * Shows the redirect screen.
         */
        function showRedirect() {
            initRedirectScreenState();
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

        /**
         *  Inits the redirect screen.
         */
        function initRedirectScreenState() {
            $errorContainer.hide();
            $loader.show();
        }
    }
);
