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
            const orderUrl = "https://secure.2checkout.com/order/checkout.php?PRODS=31007663&QTY=1&CART=1&CARD=1&SHORT_FORM=1&CURRENCY=EUR";
            const prodApiUrl = "https://us-central1-spine-site-server.cloudfunctions.net/paymentTransaction";
            const devApiUrl = "http://localhost:5001/spine-site-server/us-central1/paymentTransaction";
            const apiUrl = window.mode == "development" ? devApiUrl : prodApiUrl;
            const registerTransactionPath = "/transaction";
            const dataProcessingConsent = $confirmPersonalInformation.prop("checked");
            const supportAgreementConsent = $confirmDevelopmentAgreement.prop("checked");
            const data = {
                "dataProcessingConsent": dataProcessingConsent,
                "supportAgreementConsent": supportAgreementConsent
            };

            const transactionUrl = apiUrl + registerTransactionPath;
            sendPaymentTransaction (transactionUrl, data);

            /**
             * Sends the transaction data and returns the transaction ID. If the request is successful, redirects to the Payment screen.
             *
             * @param {String} transactionUrl - the API URL
             * @param {Object} data - the transaction data
             * @return {Object}
             */
            function sendPaymentTransaction (transactionUrl, data) {
                showRedirect(false);
                $.ajax(transactionUrl, {
                    type: 'POST',
                    data: data,
                    success: function (data) {
                        const obj = JSON.parse(data);
                        const paymentUrl = orderUrl + '&CUSTOMERID=' + obj.id;
                        window.location = paymentUrl;
                        hideRedirect();
                    },
                    error: function (jqXhr) {
                        let errorMessage = jqXhr.status + ': ' + jqXhr.statusText;
                        console.log(errorMessage);
                        showRedirect(true);
                    }
                });
            }
        }

        /**
         * Shows the redirect screen.
         * @param {Boolean} isError - if it is true, hides the loader and shows the error section
         */
        function showRedirect (isError) {
            $redirect.show();
            if (isError) {
                $errorContainer.show();
                $loader.hide();
            }
        }

        /**
         *  Hides the redirect screen.
         */
        function hideRedirect () {
            $redirect.hide();
        }
    }
);
