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
            showNotFoundPage();
            return;
        }

        keepProductIdInPath(productId);
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

            purchaseClient.submitBillingInfo(payload, {
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
            return Array.from(form.querySelectorAll(requiredSelector))
                .map(validateField)
                .every(Boolean);
        }

        function placeOrder() {
            setSummaryLoading(true);

            purchaseClient.placeOrder(productId, {
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
                        showSummaryError(responseMessage(jqXhr) || 'Failed to load checkout details.');
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
            const requestId = ++chargeRequestId;
            const payload = {
                orderId,
                buyerCountryCode,
                vatId
            };

            purchaseClient.calculateCharges(payload, {
                success: response => {
                    if (requestId !== chargeRequestId) {
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

        function requestChargesNow() {
            clearScheduledChargesRequest();
            requestChargesIfReady();
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
            const responseCurrency = response.currency || currency;

            currency = responseCurrency;

            $vatLabel.text(`VAT (${String(vatRatePercent)}%)`);
            $subtotalValue.text(formatMoney(response.netPrice, responseCurrency));
            $vatValue.text(formatMoney(response.vatAmount, responseCurrency));
            $totalValue.text(formatMoney(response.total, responseCurrency));
        }

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

        function showVatIdError(reason) {
            const message = vatIdErrorMessage(reason);

            setFieldError($vatId.get(0), message);
        }

        function updateVatIdFieldState() {
            const field = $vatId.get(0);
            const vatId = ($vatId.val() || '').trim();

            vatId ? validateField(field) : setFieldError(field, '');
            lastChargesRequestKey = '';
        }

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

        function clearPhoneNumber() {
            $phoneNumber.val('');
            validateField($phoneNumber.get(0));
        }

        function hasPhoneNumber() {
            return Boolean(($phoneNumber.val() || '').trim());
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

        function joinAddressLines(line1, line2) {
            return [line1, line2].map(value => (value || '').trim()).filter(Boolean).join(', ');
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
            return jqXhr.status === 404 || /not found/i.test(responseMessage(jqXhr) || '');
        }

        function isVatIdErrorResponse(jqXhr) {
            return jqXhr.status === 422 &&
                jqXhr.responseJSON &&
                /^VAT_ID_/.test(jqXhr.responseJSON.reason || '');
        }

        function isServerErrorResponse(jqXhr) {
            return jqXhr.status >= 500;
        }

        function responseMessage(jqXhr) {
            return jqXhr.responseJSON && jqXhr.responseJSON.message
                ? jqXhr.responseJSON.message
                : jqXhr.responseText;
        }

        function showNotFoundPage() {
            window.sessionStorage.removeItem('checkoutProductId');
            window.sessionStorage.setItem('showCheckoutNotFound', 'true');
            window.location.replace('/404.html');
        }
    }
);
