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
import {isValidPhoneNumberInput, normalizePhoneNumber, sanitizePhoneNumberInput} from '../modules/forms/phone-number';
import {createPurchaseClient} from '../modules/paygate/purchases';

$(
    function () {
        const $form = $('#checkout-form');
        const $summary = $('.checkout-summary');
        const $country = $('#checkout-country');
        const $phone = $('.phone-field');
        const $phoneCountryCode = $('#checkout-phone-country-code');
        const $phoneFlag = $('#checkout-phone-flag');
        const $phoneDialCode = $('#checkout-phone-dial-code');
        const $phoneNumber = $('#checkout-phone');
        const $vatId = $('#checkout-vat-id');
        const $loading = $('#checkout-summary-loading');
        const $loadingSpinner = $('#checkout-summary-loading-spinner');
        const $loadingText = $('#checkout-summary-loading-text');
        const $loadingSupport = $('#checkout-summary-support');
        const $productName = $('#checkout-product-name');
        const $productDescription = $('#checkout-product-description');
        const $subtotalValue = $('#checkout-subtotal-value');
        const $vatLabel = $('#checkout-vat-label');
        const $vatValue = $('#checkout-vat-value');
        const $totalValue = $('#checkout-total-value');
        const $errorModal = $('#checkout-error-modal');
        const $notFound = $('#checkout-not-found');

        if (!$form.length || !$summary.length) {
            return;
        }

        const purchaseClient = createPurchaseClient(params.paygate.serverurl);
        const form = $form.get(0);
        const requiredSelector = 'input[required], select[required], textarea[required]';
        const productId = getProductId();
        const vatIdInputDelay = 2000;
        const countryPhoneCodes = {
            AT: '43',
            BE: '32',
            BG: '359',
            HR: '385',
            CY: '357',
            CZ: '420',
            DK: '45',
            EE: '372',
            FI: '358',
            FR: '33',
            DE: '49',
            GR: '30',
            HU: '36',
            IE: '353',
            IT: '39',
            LV: '371',
            LT: '370',
            LU: '352',
            MT: '356',
            NL: '31',
            PL: '48',
            PT: '351',
            RO: '40',
            SK: '421',
            SI: '386',
            ES: '34',
            SE: '46'
        };
        let orderId = null;
        let currency = '';
        let chargeRequestId = 0;
        let chargesRequestTimer = null;
        let lastChargesRequestKey = '';
        let countryManuallySelected = false;
        let phoneCountryManuallySelected = false;

        if (!productId) {
            showNotFoundView();
            return;
        }

        $form.prop('hidden', true);
        updatePhoneCountryDisplay();
        placeOrder();

        $form.on('input change', requiredSelector, event => {
            validateField(event.target);
        });

        $('[data-checkout-modal-close]').on('click', closeErrorModal);

        $(document).on('keydown', event => {
            if (event.key === 'Escape') {
                closeErrorModal();
            }
        });

        $country.on('change', () => {
            countryManuallySelected = true;
            applyPhoneCountryFromBillingCountry();
            updateVatIdFieldState();
            requestChargesNow();
        });

        $phoneCountryCode.on('change', () => {
            phoneCountryManuallySelected = true;
            updatePhoneCountryDisplay();
            applyBillingCountryFromPhoneCountry();
        });

        $phone.on('click', () => {
            if (!$phoneCountryCode.val()) {
                focusPhoneCountrySelector();
            }
        });

        $phoneNumber.on('focus', () => {
            if (!$phoneCountryCode.val()) {
                focusPhoneCountrySelector();
            }
        });

        $phoneNumber.on('beforeinput', event => {
            const originalEvent = event.originalEvent;

            if (originalEvent && originalEvent.data && !isValidPhoneNumberInput(originalEvent.data)) {
                event.preventDefault();
            }
        });

        $phoneNumber.on('input', () => {
            const value = $phoneNumber.val();
            const sanitized = sanitizePhoneNumberInput(value);

            if (value !== sanitized) {
                $phoneNumber.val(sanitized);
            }
        });

        $vatId.on('input', () => {
            scheduleChargesRequest();
        });

        $vatId.on('blur change', () => {
            requestChargesNow();
        });

        $form.on('submit', async event => {
            event.preventDefault();

            const hasErrors = !validateRequiredFields();
            if (hasErrors) {
                form.reportValidity();
                return;
            }

            if (!orderId) {
                console.error('Order ID is not available yet.');
                return;
            }

            const payload = buildSubmitBillingInfoRequest();

            try {
                const response = await purchaseClient.submitBillingInfo(payload);
                const redirectUrl = response.paymentLink || response.redirectUrl || response.url || response.link;

                if (redirectUrl) {
                    window.location = redirectUrl;
                } else {
                    console.log('Billing info response:', response);
                }
            } catch (error) {
                if (isServerErrorResponse(error)) {
                    showErrorModal();
                }
                logApiError(error);
            }
        });

        /**
         * Validates all required checkout fields before billing info submission.
         *
         * @return {boolean} True when all required fields are valid.
         */
        function validateRequiredFields() {
            return Array.from(form.querySelectorAll(requiredSelector))
                .map(validateField)
                .every(Boolean);
        }

        /**
         * Creates a Paygate order for the product in the current checkout URL.
         *
         * @return {Promise<void>} Resolves when the initial order load flow finishes.
         */
        async function placeOrder() {
            setSummaryLoading(true);

            try {
                const response = await purchaseClient.placeOrder(productId);

                if (!response.product) {
                    showNotFoundView();
                    return;
                }

                orderId = response.orderId;
                hydrateProductSummary(response.product);
                setSummaryLoading(false);
                $form.prop('hidden', false);
                requestChargesIfReady();
            } catch (error) {
                if (isNotFoundResponse(error)) {
                    showNotFoundView();
                    return;
                }

                setSummaryLoading(false);
                if (isServerErrorResponse(error)) {
                    showErrorModal();
                    showSummaryError();
                } else {
                    showSummaryError();
                }
                logApiError(error);
            }
        }

        /**
         * Recalculates charges when order, country, and VAT ID are available.
         *
         * @return {Promise<void>} Resolves when charges are updated, skipped, or handled as an error.
         */
        async function requestChargesIfReady() {
            const buyerCountryCode = $country.val();
            const vatId = ($vatId.val() || '').trim();

            if (!orderId || !buyerCountryCode || !vatId) {
                lastChargesRequestKey = '';
                return;
            }

            const requestKey = [orderId, buyerCountryCode, vatId].join(':');

            if (requestKey === lastChargesRequestKey) {
                return;
            }

            lastChargesRequestKey = requestKey;
            const requestId = ++chargeRequestId;
            const payload = {
                orderId,
                buyerCountryCode,
                vatId
            };

            try {
                const response = await purchaseClient.calculateCharges(payload);

                if (requestId !== chargeRequestId) {
                    return;
                }

                updateCharges(response);
            } catch (error) {
                lastChargesRequestKey = '';
                if (isVatIdErrorResponse(error)) {
                    showVatIdError(error.body.reason);
                } else if (isServerErrorResponse(error)) {
                    showErrorModal();
                }
                logApiError(error);
            }
        }

        /**
         * Cancels delayed VAT recalculation and requests charges immediately.
         */
        function requestChargesNow() {
            clearScheduledChargesRequest();
            requestChargesIfReady();
        }

        /**
         * Debounces VAT-based charge recalculation while the user types.
         */
        function scheduleChargesRequest() {
            clearScheduledChargesRequest();

            chargesRequestTimer = window.setTimeout(() => {
                chargesRequestTimer = null;
                requestChargesIfReady();
            }, vatIdInputDelay);
        }

        /**
         * Clears any pending delayed charge recalculation.
         */
        function clearScheduledChargesRequest() {
            if (!chargesRequestTimer) {
                return;
            }

            window.clearTimeout(chargesRequestTimer);
            chargesRequestTimer = null;
        }

        /**
         * Updates the order summary from the Paygate charge calculation response.
         *
         * @param {Object} response - Paygate charge calculation response.
         */
        function updateCharges(response) {
            const vatRatePercent = Number(response.vatRate) * 100;
            const responseCurrency = response.currency || currency;

            currency = responseCurrency;

            $vatLabel.text(`VAT (${String(vatRatePercent)}%)`);
            $subtotalValue.text(formatMoney(response.netPrice, responseCurrency));
            $vatValue.text(formatMoney(response.vatAmount, responseCurrency));
            $totalValue.text(formatMoney(response.total, responseCurrency));
        }

        /**
         * Validates a single form field and renders its inline error state.
         *
         * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} field - Field element to validate.
         * @return {boolean} True when the field has no validation error.
         */
        function validateField(field) {
            if (!field) {
                return true;
            }

            const value = field.value ? field.value.trim() : '';
            let message = '';

            if (field.required && !value) {
                message = 'This field is required.';
            } else if (field.type === 'email' && value && !field.validity.valid) {
                message = 'Enter a valid email address.';
            } else if (field.id === 'checkout-phone' && value && !isValidPhoneNumberInput(value)) {
                message = 'Use digits, spaces, parentheses, or hyphens only.';
            } else if (field.id === 'checkout-phone' && value && !$phoneCountryCode.val()) {
                message = 'Choose a phone country code.';
            }

            setFieldError(field, message);

            return !message;
        }

        /**
         * Shows the API-provided VAT ID validation error on the VAT ID field.
         *
         * @param {string} reason - Paygate VAT ID error reason.
         */
        function showVatIdError(reason) {
            const message = vatIdErrorMessage(reason);

            setFieldError($vatId.get(0), message);
        }

        /**
         * Refreshes VAT ID state after country changes without marking an empty field as invalid.
         */
        function updateVatIdFieldState() {
            const field = $vatId.get(0);
            const vatId = ($vatId.val() || '').trim();

            vatId ? validateField(field) : setFieldError(field, '');
            lastChargesRequestKey = '';
        }

        /**
         * Applies or clears the visual error state for a form field.
         *
         * @param {HTMLElement} field - Field whose nearest form-field container should be updated.
         * @param {string} message - Error message to show, or empty string to clear the error.
         */
        function setFieldError(field, message) {
            if (!field) {
                return;
            }

            const fieldContainer = field.closest('.form-field');

            if (!fieldContainer) {
                return;
            }

            const errorElement = getOrCreateError(fieldContainer);
            fieldContainer.classList.toggle('field-error', Boolean(message));
            errorElement.textContent = message || '';
        }

        /**
         * Maps Paygate VAT ID error reasons to user-facing field messages.
         *
         * @param {string} reason - Paygate VAT ID error reason.
         * @return {string} User-facing VAT ID field error message.
         */
        function vatIdErrorMessage(reason) {
            switch (reason) {
                case 'VAT_ID_INVALID_FORMAT':
                    return 'Invalid VAT ID format. Example: EE1234567890';
                case 'VAT_ID_COUNTRY_MISMATCH':
                    return 'The VAT ID country must match the selected billing country.';
                case 'VAT_ID_NON_EU_COUNTRY':
                    return 'VAT ID verification is available for EU countries only.';
                case 'VAT_ID_NOT_ACTIVE':
                    return 'This VAT ID is not active.';
                case 'VAT_ID_INVALID':
                default:
                    return 'Enter a valid VAT ID.';
            }
        }

        /**
         * Returns the field error element, creating it when the template has none.
         *
         * @param {HTMLElement} fieldContainer - Form field container that owns the error element.
         * @return {HTMLDivElement} Existing or newly created error element.
         */
        function getOrCreateError(fieldContainer) {
            let errorElement = fieldContainer.querySelector('.error-message');

            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                fieldContainer.appendChild(errorElement);
            }

            return errorElement;
        }

        /**
         * Builds the Paygate submit-billing-info request from the checkout form.
         *
         * @return {{orderId: string, billingInfo: Object}} Submit-billing-info request payload.
         */
        function buildSubmitBillingInfoRequest() {
            const formData = Object.fromEntries(new FormData(form).entries());
            const field = name => (formData[name] || '').trim();
            const companyName = field('company');
            const vatId = field('vat_id');
            const fullName = [field('first_name'), field('last_name')].filter(Boolean).join(' ') || companyName;
            const phoneNumber = normalizePhoneNumber(
                formData.phone_country_code || '',
                formData.phone_number || ''
            );
            const billingInfo = {
                name: fullName,
                email: field('email'),
                address: {
                    countryCode: field('country'),
                    city: field('city'),
                    street: joinAddressLines(formData.address_line_1, formData.address_line_2),
                    postalCode: field('postal_code')
                },
                company: companyName ? {
                    name: companyName,
                    vatId
                } : null
            };

            if (phoneNumber) {
                billingInfo.phoneNumber = phoneNumber;
            }

            return {
                orderId,
                billingInfo
            };
        }

        /**
         * Sets billing country from phone country when the user has not chosen country manually.
         */
        function applyBillingCountryFromPhoneCountry() {
            if (countryManuallySelected) {
                return;
            }

            const phoneCode = $phoneCountryCode.val();
            const countryCode = countryCodeFromPhoneCode(phoneCode);

            if (!countryCode || !hasCountryOption(countryCode)) {
                return;
            }

            $country.val(countryCode);
            updateVatIdFieldState();
            requestChargesNow();
        }

        /**
         * Sets phone country from billing country while the phone number is still untouched.
         */
        function applyPhoneCountryFromBillingCountry() {
            if (phoneCountryManuallySelected || hasPhoneNumber()) {
                updatePhoneCountryDisplay();
                return;
            }

            const countryCode = $country.val();
            const phoneCode = countryPhoneCodes[countryCode];

            if (phoneCode) {
                $phoneCountryCode.val(phoneCode);
            }

            updatePhoneCountryDisplay();
        }

        /**
         * Clears the national phone-number input and refreshes its validation state.
         */
        function clearPhoneNumber() {
            $phoneNumber.val('');
            validateField($phoneNumber.get(0));
        }

        /**
         * Checks whether the national phone-number input has user-entered text.
         *
         * @return {boolean} True when the phone number input is not empty.
         */
        function hasPhoneNumber() {
            return Boolean(($phoneNumber.val() || '').trim());
        }

        /**
         * Mirrors the selected phone country into the custom visible phone field.
         */
        function updatePhoneCountryDisplay() {
            const selected = $phoneCountryCode.find(':selected');
            const flag = selected.data('flag') || '';
            const code = selected.data('code') || '';
            const hasPhoneCountry = Boolean($phoneCountryCode.val());

            $phoneFlag.text(flag);
            $phoneDialCode.text(code);
            $phone.attr('data-phone-country-selected', hasPhoneCountry ? 'true' : 'false');
            $phoneNumber.prop('disabled', !hasPhoneCountry);

            if (!hasPhoneCountry) {
                clearPhoneNumber();
            }
        }

        /**
         * Moves focus to the invisible native select that backs the phone country picker.
         */
        function focusPhoneCountrySelector() {
            $phoneCountryCode.trigger('focus');
        }

        /**
         * Checks whether the billing country select contains the given country code.
         *
         * @param {string} countryCode - ISO country code to look for in the billing country select.
         * @return {boolean} True when the select has an option for the country code.
         */
        function hasCountryOption(countryCode) {
            return $country.find(`option[value="${countryCode}"]`).length > 0;
        }

        /**
         * Resolves an EU billing country code from a phone country code.
         *
         * @param {string} phoneCode - Phone calling code without a plus sign.
         * @return {string} Matching billing country code, or empty string when none matches.
         */
        function countryCodeFromPhoneCode(phoneCode) {
            return Object.keys(countryPhoneCodes).find(
                countryCode => countryPhoneCodes[countryCode] === phoneCode
            ) || '';
        }

        /**
         * Fills the order summary with product details returned by Paygate.
         *
         * @param {Object} product - Paygate product data for the current order.
         */
        function hydrateProductSummary(product) {
            if (!product) {
                return;
            }

            currency = product.currency || currency;

            $productName.text(product.name || 'Unnamed product').prop('hidden', false);

            if (product.description) {
                $productDescription.text(product.description).prop('hidden', false);
            } else {
                $productDescription.text('').prop('hidden', true);
            }

            $subtotalValue.text(formatMoney(product.netPrice, currency));
            $vatLabel.text('VAT');
            $vatValue.text(formatMoney(0, currency));
            $totalValue.text(formatMoney(product.netPrice, currency));
        }

        /**
         * Shows or hides the order-summary loading state.
         *
         * @param {boolean} isLoading - Whether the summary should show the loading state.
         */
        function setSummaryLoading(isLoading) {
            $summary.attr('data-loading', isLoading ? 'true' : 'false');
            $summary.attr('data-error', 'false');
            $loading.prop('hidden', !isLoading);
            $loadingSpinner.prop('hidden', !isLoading);
            $loadingSupport.prop('hidden', true);
            $form.prop('hidden', isLoading);

            if (isLoading) {
                $loadingText.text('Loading checkout details...');
            }
        }

        /**
         * Replaces order-summary values with a short support-oriented error state.
         */
        function showSummaryError() {
            $summary.attr('data-error', 'true');
            $loading.prop('hidden', false);
            $loadingSpinner.prop('hidden', true);
            $loadingText.text('Ooops...');
            $loadingSupport.prop('hidden', false);
            $form.prop('hidden', true);
            $productName.prop('hidden', true);
            $productDescription.prop('hidden', true);
            $subtotalValue.text('—');
            $vatLabel.text('VAT');
            $vatValue.text('—');
            $totalValue.text('—');
        }

        /**
         * Opens the generic checkout error modal.
         */
        function showErrorModal() {
            $errorModal.prop('hidden', false);
        }

        /**
         * Closes the generic checkout error modal.
         */
        function closeErrorModal() {
            $errorModal.prop('hidden', true);
        }

        /**
         * Formats numeric money amounts with two fractional digits.
         *
         * @param {number|string} amount - Amount value returned by Paygate.
         * @return {string} Amount formatted with two decimals when numeric.
         */
        function formatAmount(amount) {
            const numericAmount = Number(amount);
            return Number.isNaN(numericAmount) ? amount : numericAmount.toFixed(2);
        }

        /**
         * Formats an amount with its currency suffix when currency is known.
         *
         * @param {number|string} amount - Amount value returned by Paygate.
         * @param {string} amountCurrency - Currency code to append.
         * @return {string} Formatted money value with optional currency suffix.
         */
        function formatMoney(amount, amountCurrency) {
            const formattedAmount = formatAmount(amount);
            return amountCurrency ? `${formattedAmount} ${amountCurrency}` : formattedAmount;
        }

        /**
         * Joins non-empty address lines into the single street value expected by Paygate.
         *
         * @param {string} line1 - First street address line.
         * @param {string} line2 - Second street address line.
         * @return {string} Comma-separated street value.
         */
        function joinAddressLines(line1, line2) {
            return [line1, line2].map(value => (value || '').trim()).filter(Boolean).join(', ');
        }

        /**
         * Reads the product ID from the `product` query parameter.
         *
         * @return {string} Checkout product ID, or empty string when unavailable.
         */
        function getProductId() {
            return (new URLSearchParams(window.location.search).get('product') || '').trim();
        }

        /**
         * Checks whether a Paygate error means the requested product/order was not found.
         *
         * @param {Object} error - Error object thrown by the Paygate client.
         * @return {boolean} True when the error represents a not-found response.
         */
        function isNotFoundResponse(error) {
            return error.status === 404 || /not found/i.test(error.message || '');
        }

        /**
         * Checks whether a Paygate error should be rendered on the VAT ID field.
         *
         * @param {Object} error - Error object thrown by the Paygate client.
         * @return {boolean} True when the error contains a VAT ID validation reason.
         */
        function isVatIdErrorResponse(error) {
            return error.status === 422 &&
                error.body &&
                /^VAT_ID_/.test(error.body.reason || '');
        }

        /**
         * Checks whether a Paygate error should open the generic failure modal.
         *
         * @param {Object} error - Error object thrown by the Paygate client.
         * @return {boolean} True when the response status is a server error.
         */
        function isServerErrorResponse(error) {
            return error.status >= 500;
        }

        /**
         * Logs API failures in a compact and consistent format.
         *
         * @param {Object|Error} error - Request error to log.
         */
        function logApiError(error) {
            console.error(`${error.status || 'Network error'}: ${error.statusText || error.message || 'Request failed'}`);
        }

        /**
         * Shows the not-found result panel inside the checkout page.
         */
        function showNotFoundView() {
            clearScheduledChargesRequest();
            closeErrorModal();
            $summary.prop('hidden', true);
            $form.prop('hidden', true);
            $notFound.prop('hidden', false);
        }
    }
);
