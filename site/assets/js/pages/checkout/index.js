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
import {createPurchaseClient} from 'js/modules/paygate/purchases';
import {createChargeController} from 'js/pages/checkout/charge-controller';
import {getCheckoutDom} from 'js/pages/checkout/dom';
import {createCheckoutFormController} from 'js/pages/checkout/form-controller';
import {createCheckoutView} from 'js/pages/checkout/view-controller';

const requiredSelector = 'input[required], select[required], textarea[required]';

$(
    function () {
        const dom = getCheckoutDom();

        if (!dom) {
            return;
        }

        const purchaseClient = createPurchaseClient(params.paygate.serverurl);
        const orderId = getOrderId();
        const view = createCheckoutView(dom);
        const formController = createCheckoutFormController({dom});
        let countryManuallySelected = false;
        let phoneCountryManuallySelected = false;
        const chargeController = createChargeController({
            purchaseClient,
            view,
            ensureOrderId: () => Promise.resolve(orderId),
            getBuyerCountryCode: () => dom.$country.val(),
            getVatId: () => (dom.$vatId.val() || '').trim(),
            onFieldValidationStateChange: state => {
                formController.setFieldValidationState(dom.$vatId.get(0), state);
            },
            onVatIdError: formController.showVatIdError,
            logApiError
        });

        if (!orderId) {
            redirectToGettingHelp();
            return;
        }

        dom.$form.prop('hidden', true);
        formController.updatePhoneCountryDisplay();
        formController.bindPhoneEvents();
        chargeController.updateSubmitState();
        loadOrder();
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

            $(window).on('pageshow', () => {
                scheduleRestoredVatResume();
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
                formController.focusPhoneNumber();

                if (formController.applyBillingCountryFromPhoneCountry(countryManuallySelected)) {
                    chargeController.invalidate();
                    formController.updateVatIdFieldState();
                    chargeController.flush();
                }
            });

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
         * Loads order details for the checkout page from the current checkout URL.
         *
         * @return {Promise<void>} resolves when the initial order load flow finishes
         */
        async function loadOrder() {
            view.setSummaryLoading(true);

            try {
                const order = await purchaseClient.getOrder(orderId);
                view.fillOrderSummary(order);
                view.setSummaryLoading(false);
                dom.$form.prop('hidden', false);
                chargeController.updateSubmitState();
                scheduleRestoredVatResume();
            } catch (error) {
                if (error.status === 404) {
                    chargeController.invalidate();
                    view.showNotFoundView();
                    chargeController.updateSubmitState();
                    return;
                }

                view.setSummaryLoading(false);
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

            await chargeController.requestIfReady();

            if (!chargeController.hasCurrentCharges() || !orderId) {
                return;
            }

            try {
                const response = await purchaseClient.submitBillingInfo(
                    formController.buildSubmitBillingInfoRequest(orderId)
                );
                window.location = response.paymentLink;
            } catch (error) {
                view.showErrorModal();
                logApiError(error);
            }
        }

        /**
         * Reads the order ID from the `orderId` query parameter.
         *
         * @return {string} checkout order ID, or empty string when unavailable
         */
        function getOrderId() {
            return (new URLSearchParams(window.location.search).get('orderId') || '').trim();
        }

        /**
         * Redirects visitors with incomplete checkout links to the help page.
         */
        function redirectToGettingHelp() {
            window.location.replace('/getting-help');
        }

        /**
         * Logs API failures in a compact and consistent format.
         *
         * @param {Object|Error} error request error to log
         */
        function logApiError(error) {
            console.error(
                `${error.status || 'Network error'}: ` +
                `${error.statusText || 'Request failed'}`
            );
        }

        /**
         * Schedules one pass that resumes charge calculation from browser-restored VAT data.
         */
        function scheduleRestoredVatResume() {
            window.setTimeout(resumeChargesFromRestoredVatId, 0);
        }

        /**
         * Restarts charge calculation when the browser already restored VAT ID into the field.
         */
        function resumeChargesFromRestoredVatId() {
            if (view.isFormHidden()) {
                return;
            }

            if (!(dom.$vatId.val() || '').trim()) {
                return;
            }

            chargeController.requestIfReady();
        }
    }
);
