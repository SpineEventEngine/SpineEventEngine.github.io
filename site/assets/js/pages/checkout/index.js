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

import * as params from '@params';
import {createPurchaseClient} from '../../modules/paygate/purchases';
import {createChargeController} from './charge-controller';
import {getCheckoutDom} from './dom';
import {createCheckoutFormController} from './form-controller';
import {createCheckoutView} from './view-controller';

const requiredSelector = 'input[required], select[required], textarea[required]';

$(
    function () {
        const dom = getCheckoutDom();

        if (!dom) {
            return;
        }

        const purchaseClient = createPurchaseClient(params.paygate.serverurl);
        const productId = getProductId();
        const view = createCheckoutView(dom);
        const formController = createCheckoutFormController({dom});
        let orderId = null;
        let countryManuallySelected = false;
        let phoneCountryManuallySelected = false;
        const chargeController = createChargeController({
            purchaseClient,
            view,
            getOrderId: () => orderId,
            getBuyerCountryCode: () => dom.$country.val(),
            getVatId: () => (dom.$vatId.val() || '').trim(),
            onVatIdError: formController.showVatIdError,
            logApiError
        });

        if (!productId) {
            chargeController.invalidate();
            view.showNotFoundView();
            return;
        }

        dom.$form.prop('hidden', true);
        formController.updatePhoneCountryDisplay();
        chargeController.updateSubmitState();
        placeOrder();
        bindEvents();

        /**
         * Registers checkout page event handlers.
         */
        function bindEvents() {
            dom.$form.on('input', requiredSelector, event => {
                formController.validateField(event.target);
            });

            dom.$form.on('change', 'select[required]', event => {
                formController.validateField(event.target);
            });

            $('[data-checkout-modal-close]').on('click', view.closeErrorModal);

            $(document).on('keydown', event => {
                if (event.key === 'Escape') {
                    view.closeErrorModal();
                }
            });

            dom.$country.on('change', () => {
                countryManuallySelected = true;
                chargeController.invalidate();
                formController.applyPhoneCountryFromBillingCountry(phoneCountryManuallySelected);
                formController.updateVatIdFieldState();
                chargeController.flush();
            });

            dom.$phoneCountryCode.on('change', () => {
                phoneCountryManuallySelected = true;
                formController.updatePhoneCountryDisplay();

                if (formController.applyBillingCountryFromPhoneCountry(countryManuallySelected)) {
                    chargeController.invalidate();
                    formController.updateVatIdFieldState();
                    chargeController.flush();
                }
            });

            dom.$phone.on('click', formController.handlePhoneClick);
            dom.$phoneNumber.on('focus', formController.handlePhoneNumberFocus);
            dom.$phoneNumber.on('beforeinput', formController.handlePhoneNumberBeforeInput);
            dom.$phoneNumber.on('input', formController.sanitizePhoneNumberValue);

            dom.$vatId.on('input', () => {
                chargeController.invalidate();
                chargeController.schedule();
            });

            dom.$vatId.on('blur', () => {
                if (chargeController.hasScheduledRequest()) {
                    chargeController.flush();
                }
            });

            dom.$form.on('submit', handleSubmit);
        }

        /**
         * Creates an order for the product from the current checkout URL.
         *
         * @return {Promise<void>} resolves when the initial order load flow finishes
         */
        async function placeOrder() {
            view.setSummaryLoading(true);

            try {
                const response = await purchaseClient.placeOrder(productId);

                if (!response.product) {
                    chargeController.invalidate();
                    view.showNotFoundView();
                    chargeController.updateSubmitState();
                    return;
                }

                orderId = response.orderId;
                view.hydrateProductSummary(response.product);
                view.setSummaryLoading(false);
                dom.$form.prop('hidden', false);
                chargeController.updateSubmitState();
                chargeController.requestIfReady();
            } catch (error) {
                if (error.status === 404) {
                    chargeController.invalidate();
                    view.showNotFoundView();
                    chargeController.updateSubmitState();
                    return;
                }

                view.setSummaryLoading(false);
                showServerErrorModal(error);
                view.showSummaryError();
                chargeController.updateSubmitState();
                logApiError(error);
            }
        }

        /**
         * Submits checkout billing data after the current charge state is valid.
         *
         * @param {JQuery.SubmitEvent} event checkout form submit event
         * @return {Promise<void>} resolves when submit handling finishes
         */
        async function handleSubmit(event) {
            event.preventDefault();

            if (!formController.validateRequiredFields(requiredSelector)) {
                dom.form.reportValidity();
                return;
            }

            if (!orderId) {
                console.error('Order ID is not available yet.');
                return;
            }

            await chargeController.requestIfReady();

            if (!chargeController.hasCurrentCharges()) {
                return;
            }

            try {
                const response = await purchaseClient.submitBillingInfo(
                    formController.buildSubmitBillingInfoRequest(orderId)
                );
                const redirectUrl = response.paymentLink ||
                    response.redirectUrl ||
                    response.url ||
                    response.link;

                if (redirectUrl) {
                    window.location = redirectUrl;
                } else {
                    console.log('Billing info response:', response);
                }
            } catch (error) {
                showServerErrorModal(error);
                logApiError(error);
            }
        }

        /**
         * Opens the generic checkout error modal for server-side request failures.
         *
         * @param {Object|Error} error request error to inspect
         * @return {boolean} true when the error represents a server response
         */
        function showServerErrorModal(error) {
            if (error.status >= 500) {
                return false;
            }

            view.showErrorModal();
            return true;
        }

        /**
         * Reads the product ID from the `product` query parameter.
         *
         * @return {string} checkout product ID, or empty string when unavailable
         */
        function getProductId() {
            return (new URLSearchParams(window.location.search).get('product') || '').trim();
        }

        /**
         * Logs API failures in a compact and consistent format.
         *
         * @param {Object|Error} error request error to log
         */
        function logApiError(error) {
            console.error(
                `${error.status || 'Network error'}: ` +
                `${error.statusText || error.message || 'Request failed'}`
            );
        }
    }
);
