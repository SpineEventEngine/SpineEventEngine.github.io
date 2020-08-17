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
        const $confirmPersonalInformation = $('#confirm-personal-information');
        const $confirmDevelopmentAgreement = $('#confirm-development-agreement');
        const $orderButton = $('#order-now-btn');
        const $redirectScreen = $('#redirectScreen');
        const $loader = $('.redirect-loader', '#redirectScreen');
        const $errorContainer = $('.redirect-error', '#redirectScreen');
        const $tryAgain = $('#try-again');

        const orderUrl = "{{site.data.payment_config.orderUrl}}";
        const prodApiUrl = "{{site.data.payment_config.prodApiUrl}}";
        const devApiUrl = "{{site.data.payment_config.devApiUrl}}";
        // `window.mode` we setup in the `getting-help/service-section.html` file by Jekyll.
        const apiUrl = "{{jekyll.environment}}" === "development" ? devApiUrl : prodApiUrl;

        $confirmPersonalInformation.change(() => {
            confirmAgreement($orderButton);
        });

        $confirmDevelopmentAgreement.change(() => {
            confirmAgreement($orderButton);
        });

        $orderButton.click(submitOrder);

        $tryAgain.click(e => {
            e.preventDefault();
            hideRedirect();
            submitOrder();
        });

        /**
         * Disables and enables order button.
         *
         * @param {jQuery} disabledElement - disabled/enabled element
         */
        function confirmAgreement(disabledElement) {
            const isConfirmed = $confirmPersonalInformation.prop('checked') && $confirmDevelopmentAgreement.prop('checked');
            if (isConfirmed) {
                disabledElement.removeAttr('disabled');
                disabledElement.removeClass('disabled');
            } else {
                disabledElement.attr('disabled', true);
                disabledElement.addClass('disabled');
            }
        }

        /**
         * Submit order handler.
         */
        function submitOrder() {
            const dataProcessingConsent = $confirmPersonalInformation.prop("checked");
            const supportAgreementConsent = $confirmDevelopmentAgreement.prop("checked");
            const data = JSON.stringify({dataProcessingConsent, supportAgreementConsent});
            const transactionUrl = `${apiUrl}/transaction`;
            sendPaymentTransaction(transactionUrl, data);
        }

        /**
         * The consent data.
         * @typedef {object} Consent
         * @property {boolean} dataProcessingConsent - Indicates whether the user give a consent to processing of his
         * personal information.
         * @property {boolean} supportAgreementConsent - Indicates whether the user agree to be bound by the terms of
         */

        /**
         * Sends the transaction data and returns the transaction ID. If the request is successful,
         * redirects to the Payment screen.
         *
         * @param {String} transactionUrl - the API URL
         * @param {Consent} data - the transaction data
         */
        function sendPaymentTransaction(transactionUrl, data) {
            showRedirect(false);
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
                    showRedirect(true);
                }
            });
        }

        /**
         * Shows the redirect screen.
         *
         * @param {Boolean} isError - if it is true, hides the loader and shows the error section
         */
        function showRedirect(isError) {
            $redirectScreen.show();
            if (isError) {
                $errorContainer.show();
                $loader.hide();
            }
        }

        /**
         *  Hides the redirect screen.
         */
        function hideRedirect() {
            $redirectScreen.hide();
        }
    }
);
