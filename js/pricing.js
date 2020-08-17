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
        const $redirect = $('#redirect');
        const $loader = $('.redirect-loader', '#redirect');
        const $errorContainer = $('.redirect-error', '#redirect');
        const $tryAgain = $('#try-again');

        const orderUrl = "{{site.data.payment_config.orderUrl}}";
        const prodApiUrl = "{{site.data.payment_config.prodApiUrl}}";
        const devApiUrl = "{{site.data.payment_config.devApiUrl}}";
        // `window.mode` we setup in the `getting-help/service-section.html` file by Jekyll.
        const apiUrl = window.mode === "development" ? devApiUrl : prodApiUrl;


        $confirmPersonalInformation.change(function () {
            confirmAgreement($orderButton);
        });

        $confirmDevelopmentAgreement.change(function () {
            confirmAgreement($orderButton);
        });

        $orderButton.click(function() {
            submitOrder();
        });

        $tryAgain.click(function(event) {
            event.preventDefault();
            hideRedirect ();
            submitOrder();
        });

        /**
         * Disables and enables order button.
         *
         * @param {Object} disabledElement - disabled/enabled element
         */
        const confirmAgreement = (disabledElement) => {
            const isConfirmed = $confirmPersonalInformation.prop('checked') && $confirmDevelopmentAgreement.prop('checked');
            if (isConfirmed) {
                disabledElement.removeAttr('disabled');
                disabledElement.removeClass('disabled');
            } else {
                disabledElement.attr('disabled', true);
                disabledElement.addClass('disabled');
            }
        };

        /**
         * Submit order handler.
         */
        const submitOrder = () => {
            const dataProcessingConsent = $confirmPersonalInformation.prop("checked");
            const supportAgreementConsent = $confirmDevelopmentAgreement.prop("checked");
            const data = JSON.stringify({
                "dataProcessingConsent": dataProcessingConsent,
                "supportAgreementConsent": supportAgreementConsent
            });

            const transactionUrl = apiUrl + '/transaction';
            sendPaymentTransaction (transactionUrl, data);
        };

        /**
         * Sends the transaction data and returns the transaction ID. If the request is successful,
         * redirects to the Payment screen.
         *
         * @param {String} transactionUrl - the API URL
         * @param {Object} data - the transaction data
         */
        const sendPaymentTransaction = (transactionUrl, data) => {
            showRedirect(false);
            $.ajax(transactionUrl, {
                type: 'POST',
                data: data,
                contentType: 'application/json',
                success: (data) => {
                    const obj = JSON.parse(data);
                    const paymentUrl = orderUrl + '&CUSTOMERID=' + obj.id;
                    window.location = paymentUrl;
                    hideRedirect();
                },
                error: (jqXhr) => {
                    console.error(jqXhr.status + ': ' + jqXhr.statusText);
                    showRedirect(true);
                }
            });
        };

        /**
         * Shows the redirect screen.
         * @param {Boolean} isError - if it is true, hides the loader and shows the error section
         */
        const showRedirect = (isError) => {
            $redirect.show();
            if (isError) {
                $errorContainer.show();
                $loader.hide();
            }
        };

        /**
         *  Hides the redirect screen.
         */
        const hideRedirect = () => {
            $redirect.hide();
        }
    }
);
