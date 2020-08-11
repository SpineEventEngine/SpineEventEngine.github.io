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
        const $loader = $('#loader');

        $confirmPersonalInformation.change(function () {
            confirmAgreement($orderButton);
        });

        $confirmDevelopmentAgreement.change(function () {
            confirmAgreement($orderButton);
        });

        $orderButton.click(function() {
            submitOrder(this);
        });

        /**
         * Disables and enables order button.
         *
         * @param {Object} disabled/enabled element
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

        function submitOrder(element) {
            const orderUrl = "https://secure.2checkout.com/order/checkout.php?PRODS=31007663&QTY=1&CART=1&CARD=1&SHORT_FORM=1&CURRENCY=EUR";
            // Payment transactions API path
            const apiUrl = "https://us-central1-spine-site-server.cloudfunctions.net/paymentTransaction";
            const devApiUrl = "http://localhost:5001/spine-site-server/us-central1/paymentTransaction";
            const registerTransactionPath = "/registerTransaction";

            const date = new Date();
            const dataProcessingConsent = $confirmPersonalInformation.prop("checked");
            const supportAgreementConsent = $confirmDevelopmentAgreement.prop("checked");

            const data = {
                "timestamp": date,
                "dataProcessingConsent": dataProcessingConsent,
                "supportAgreementConsent": supportAgreementConsent
            };
            const transactionUrl = devApiUrl + registerTransactionPath;
            sendPaymentTransaction (transactionUrl, data);

            /**
             * Sends transaction data and returns the transaction ID.
             *
             * @param {String} API URL
             * @param {Object} transaction data
             * @return {object}
             */
            function sendPaymentTransaction (transactionUrl, data) {
                $loader.show();
                $.ajax(transactionUrl, {
                    type: 'POST',
                    data: data,
                    success: function (data, status) {
                        const obj = JSON.parse(data);
                        const paymentUrl = orderUrl + '&CUSTOMERID=' + obj.id;
                        window.location = paymentUrl;
                    },
                    error: function (jqXhr, textStatus, errorMessage) {
                        console.log("textStatus", textStatus);
                        console.log("Error", errorMessage);
                    },
                    complete: function(){
                        $loader.hide();
                    }
                });
            }
        }
    }
);
