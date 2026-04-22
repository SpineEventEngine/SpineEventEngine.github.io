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

$(
    function () {
        const $form = $('#checkout-form');
        const $summary = $('.checkout-summary');
        const $country = $('#checkout-country');
        const $phone = $('.checkout-form__phone');
        const $phoneCountryCode = $('#checkout-phone-country-code');
        const $phoneFlag = $('#checkout-phone-flag');
        const $phoneDialCode = $('#checkout-phone-dial-code');
        const $phoneNumber = $('#checkout-phone');
        const $vatId = $('#checkout-vat-id');
        const $loading = $('#checkout-summary-loading');
        const $productName = $('#checkout-product-name');
        const $productDescription = $('#checkout-product-description');
        const $subtotalValue = $('#checkout-subtotal-value');
        const $vatLabel = $('#checkout-vat-label');
        const $vatValue = $('#checkout-vat-value');
        const $totalValue = $('#checkout-total-value');
        const $errorModal = $('#checkout-error-modal');

        if (!$form.length || !$summary.length) {
            return;
        }

        const serverUrl = normalizeServerUrl(params.paygate.serverurl);
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
        let chargesRequestId = 0;
        let chargesRequestTimer = null;
        let lastChargesRequestKey = '';
        let countryManuallySelected = false;
        let phoneCountryManuallySelected = false;

        if (!productId) {
            showNotFoundPage();
            return;
        }

        keepProductIdInPath(productId);
        applyDefaultCountry();
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
            clearScheduledChargesRequest();
            requestChargesIfReady();
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
            clearScheduledChargesRequest();
            requestChargesIfReady();
        });

        $form.on('submit', event => {
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

            $.ajax(`${serverUrl}/purchases/submit-billing-info`, {
                type: 'POST',
                data: JSON.stringify(payload),
                contentType: 'application/json',
                success: response => {
                    const redirectUrl = response.paymentLink || response.redirectUrl || response.url || response.link;

                    if (redirectUrl) {
                        window.location = redirectUrl;
                    } else {
                        console.log('Billing info response:', response);
                    }
                },
                error: jqXhr => {
                    if (isServerErrorResponse(jqXhr)) {
                        showErrorModal();
                    }
                    console.error(`${jqXhr.status}: ${jqXhr.statusText}`);
                }
            });
        });

        function validateRequiredFields() {
            const requiredFields = Array.from(form.querySelectorAll(requiredSelector));
            let isValid = true;

            requiredFields.forEach(field => {
                const fieldValid = validateField(field);
                if (!fieldValid) {
                    isValid = false;
                }
            });

            return isValid;
        }

        function placeOrder() {
            setSummaryLoading(true);

            $.ajax(`${serverUrl}/purchases/place-order`, {
                type: 'POST',
                data: JSON.stringify({productId}),
                contentType: 'application/json',
                success: response => {
                    if (!response.product) {
                        showNotFoundPage();
                        return;
                    }

                    orderId = response.orderId;
                    hydrateProductSummary(response.product);
                    setSummaryLoading(false);
                    requestChargesIfReady();
                },
                error: jqXhr => {
                    if (isNotFoundResponse(jqXhr)) {
                        showNotFoundPage();
                        return;
                    }

                    setSummaryLoading(false);
                    if (isServerErrorResponse(jqXhr)) {
                        showErrorModal();
                        showSummaryError('Failed to load checkout details.');
                    } else {
                        showSummaryError(jqXhr.responseJSON && jqXhr.responseJSON.message ? jqXhr.responseJSON.message : 'Failed to load checkout details.');
                    }
                    console.error(`${jqXhr.status}: ${jqXhr.statusText}`);
                }
            });
        }

        function requestChargesIfReady() {
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
            const requestId = ++chargesRequestId;
            const payload = {
                orderId,
                buyerCountryCode,
                vatId: vatId || null
            };

            $.ajax(`${serverUrl}/purchases/calculate-charges`, {
                type: 'POST',
                data: JSON.stringify(payload),
                contentType: 'application/json',
                success: response => {
                    if (requestId !== chargesRequestId) {
                        return;
                    }

                    updateCharges(response);
                },
                error: jqXhr => {
                    lastChargesRequestKey = '';
                    if (isVatIdErrorResponse(jqXhr)) {
                        showVatIdError(jqXhr.responseJSON.reason);
                    } else if (isServerErrorResponse(jqXhr)) {
                        showErrorModal();
                    }
                    console.error(`${jqXhr.status}: ${jqXhr.statusText}`);
                }
            });
        }

        function scheduleChargesRequest() {
            clearScheduledChargesRequest();

            chargesRequestTimer = window.setTimeout(() => {
                chargesRequestTimer = null;
                requestChargesIfReady();
            }, vatIdInputDelay);
        }

        function clearScheduledChargesRequest() {
            if (!chargesRequestTimer) {
                return;
            }

            window.clearTimeout(chargesRequestTimer);
            chargesRequestTimer = null;
        }

        function updateCharges(response) {
            const vatRatePercent = Number(response.vatRate) * 100;
            const formattedVatRate = `${stripTrailingZeros(vatRatePercent)}%`;
            const responseCurrency = response.currency || currency;

            currency = responseCurrency;

            $vatLabel.text(`VAT (${formattedVatRate})`);
            $subtotalValue.text(formatMoney(response.netPrice, responseCurrency));
            $vatValue.text(formatMoney(response.vatAmount, responseCurrency));
            $totalValue.text(formatMoney(response.total, responseCurrency));
        }

        function validateField(field) {
            if (!field) {
                return true;
            }

            const fieldContainer = field.closest('.checkout-form__field');
            if (!fieldContainer) {
                return true;
            }

            const errorElement = getOrCreateError(fieldContainer);
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

            fieldContainer.classList.toggle('field-error', Boolean(message));
            errorElement.textContent = message;

            return !message;
        }

        function isValidPhoneNumberInput(value) {
            return /^[0-9\s()-]+$/.test(value);
        }

        function sanitizePhoneNumberInput(value) {
            return String(value || '').replace(/[^0-9\s()-]/g, '');
        }

        function showVatIdError(reason) {
            const message = vatIdErrorMessage(reason);

            setFieldError($vatId.get(0), message);
        }

        function updateVatIdFieldState() {
            validateField($vatId.get(0));
            lastChargesRequestKey = '';
        }

        function setFieldError(field, message) {
            if (!field) {
                return;
            }

            const fieldContainer = field.closest('.checkout-form__field');

            if (!fieldContainer) {
                return;
            }

            const errorElement = getOrCreateError(fieldContainer);
            fieldContainer.classList.toggle('field-error', Boolean(message));
            errorElement.textContent = message || '';
        }

        function vatIdErrorMessage(reason) {
            switch (reason) {
                case 'VAT_ID_INVALID_FORMAT':
                    return 'Enter a valid VAT ID.';
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

        function getOrCreateError(fieldContainer) {
            let errorElement = fieldContainer.querySelector('.error-message');

            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                fieldContainer.appendChild(errorElement);
            }

            return errorElement;
        }

        function buildSubmitBillingInfoRequest() {
            const formData = Object.fromEntries(new FormData(form).entries());
            const selectedCountry = (formData.country || '').trim();
            const companyName = (formData.company || '').trim();
            const vatId = (formData.vat_id || '').trim();
            const firstName = (formData.first_name || '').trim();
            const lastName = (formData.last_name || '').trim();
            const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || companyName;
            const phoneNumber = normalizePhoneNumber(
                formData.phone_country_code || '',
                formData.phone_number || ''
            );
            const billingInfo = {
                name: fullName,
                email: (formData.email || '').trim(),
                address: {
                    countryCode: selectedCountry,
                    city: (formData.city || '').trim(),
                    street: joinAddressLines(formData.address_line_1, formData.address_line_2),
                    postalCode: (formData.postal_code || '').trim()
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

        function applyDefaultCountry() {
            const countryCode = inferCountryCode();

            if (!countryCode) {
                updatePhoneCountryDisplay();
                return;
            }

            if (!$country.val() && hasCountryOption(countryCode)) {
                $country.val(countryCode);
            }

            applyPhoneCountryFromBillingCountry();
        }

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
            clearScheduledChargesRequest();
            requestChargesIfReady();
        }

        function applyPhoneCountryFromBillingCountry() {
            if (phoneCountryManuallySelected) {
                updatePhoneCountryDisplay();
                return;
            }

            const countryCode = $country.val();
            const phoneCode = countryPhoneCodes[countryCode];
            const previousPhoneCode = $phoneCountryCode.val();

            if (phoneCode) {
                $phoneCountryCode.val(phoneCode);
            }

            if (previousPhoneCode && phoneCode && previousPhoneCode !== phoneCode) {
                clearPhoneNumber();
            }

            updatePhoneCountryDisplay();
        }

        function clearPhoneNumber() {
            $phoneNumber.val('');
            validateField($phoneNumber.get(0));
        }

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

        function focusPhoneCountrySelector() {
            $phoneCountryCode.trigger('focus');
        }

        function inferCountryCode() {
            const languages = navigator.languages && navigator.languages.length
                ? navigator.languages
                : [navigator.language || navigator.userLanguage || ''];

            for (const language of languages) {
                const countryCode = countryCodeFromLocale(language);

                if (countryCode && hasCountryOption(countryCode)) {
                    return countryCode;
                }
            }

            return '';
        }

        function countryCodeFromLocale(locale) {
            if (!locale) {
                return '';
            }

            if (typeof Intl !== 'undefined' && Intl.Locale) {
                try {
                    const region = new Intl.Locale(locale).region;

                    if (region) {
                        return region.toUpperCase();
                    }
                } catch (ignored) {
                    // Fall back to parsing below.
                }
            }

            const match = String(locale).match(/[-_]([A-Za-z]{2})\b/);
            return match ? match[1].toUpperCase() : '';
        }

        function hasCountryOption(countryCode) {
            return $country.find(`option[value="${countryCode}"]`).length > 0;
        }

        function countryCodeFromPhoneCode(phoneCode) {
            return Object.keys(countryPhoneCodes).find(
                countryCode => countryPhoneCodes[countryCode] === phoneCode
            ) || '';
        }

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

        function setSummaryLoading(isLoading) {
            $summary.attr('data-loading', isLoading ? 'true' : 'false');
            $loading.prop('hidden', !isLoading);
        }

        function showSummaryError(message) {
            $loading.text(message).prop('hidden', false);
            $productName.prop('hidden', true);
            $productDescription.prop('hidden', true);
            $subtotalValue.text('—');
            $vatLabel.text('VAT');
            $vatValue.text('—');
            $totalValue.text('—');
        }

        function showErrorModal() {
            $errorModal.prop('hidden', false);
        }

        function closeErrorModal() {
            $errorModal.prop('hidden', true);
        }

        function formatAmount(amount) {
            const numericAmount = Number(amount);
            return Number.isNaN(numericAmount) ? amount : numericAmount.toFixed(2);
        }

        function formatMoney(amount, amountCurrency) {
            const formattedAmount = formatAmount(amount);
            return amountCurrency ? `${formattedAmount} ${amountCurrency}` : formattedAmount;
        }

        function stripTrailingZeros(amount) {
            return Number.isInteger(amount) ? String(amount) : String(amount);
        }

        function joinAddressLines(line1, line2) {
            return [line1, line2].map(value => (value || '').trim()).filter(Boolean).join(', ');
        }

        function normalizePhoneNumber(rawCountryCode, rawNumber) {
            const countryCode = String(rawCountryCode || '').replace(/\D/g, '');
            const number = String(rawNumber || '').replace(/\D/g, '');

            if (!countryCode || !number) {
                return null;
            }

            const numericCountryCode = Number(countryCode);
            if (!Number.isInteger(numericCountryCode) || numericCountryCode <= 0) {
                return null;
            }

            return {
                countryCode: numericCountryCode,
                number
            };
        }

        function normalizeServerUrl(url) {
            return String(url || '').replace(/\/+$/, '');
        }

        function getProductId() {
            const pathProductId = getProductIdFromPath();

            if (pathProductId) {
                return pathProductId;
            }

            return consumeStoredProductId();
        }

        function getProductIdFromPath() {
            const segments = window.location.pathname.split('/').filter(Boolean);
            const checkoutIndex = segments.indexOf('checkout');

            if (checkoutIndex === -1 || checkoutIndex === segments.length - 1) {
                return '';
            }

            return decodeURIComponent(segments[checkoutIndex + 1]);
        }

        function consumeStoredProductId() {
            const productId = window.sessionStorage.getItem('checkoutProductId') || '';
            window.sessionStorage.removeItem('checkoutProductId');
            return productId.trim();
        }

        function keepProductIdInPath(currentProductId) {
            if (getProductIdFromPath()) {
                return;
            }

            window.history.replaceState(null, '', `/checkout/${encodeURIComponent(currentProductId)}`);
        }

        function isNotFoundResponse(jqXhr) {
            const responseMessage = jqXhr.responseJSON && jqXhr.responseJSON.message
                ? jqXhr.responseJSON.message
                : jqXhr.responseText;

            return jqXhr.status === 404 || /not found/i.test(responseMessage || '');
        }

        function isVatIdErrorResponse(jqXhr) {
            return jqXhr.status === 422 &&
                jqXhr.responseJSON &&
                /^VAT_ID_/.test(jqXhr.responseJSON.reason || '');
        }

        function isServerErrorResponse(jqXhr) {
            return jqXhr.status >= 500;
        }

        function showNotFoundPage() {
            window.sessionStorage.removeItem('checkoutProductId');
            window.sessionStorage.setItem('showCheckoutNotFound', 'true');
            window.location.replace('/404.html');
        }
    }
);
