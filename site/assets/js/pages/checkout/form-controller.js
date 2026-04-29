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

import {euCountryPhoneCodes} from 'js/pages/checkout/phone-codes';
import {
    isValidPhoneNumberInput,
    normalizePhoneNumber,
    sanitizePhoneNumberInput
} from 'js/modules/forms/phone-number';

/**
 * @typedef {import('js/pages/checkout/dom').CheckoutDom} CheckoutDom
 * @typedef {import('js/modules/paygate/purchases').SubmitBillingInfoRequest}
 * SubmitBillingInfoRequest
 */

/**
 * API exposed by the checkout form controller.
 *
 * @typedef {Object} CheckoutFormController
 * @property {function(boolean): boolean} applyBillingCountryFromPhoneCountry
 *   syncs billing country from phone country when allowed
 * @property {function(boolean): void} applyPhoneCountryFromBillingCountry
 *   syncs phone country from billing country when allowed
 * @property {function(string): SubmitBillingInfoRequest}
 *   buildSubmitBillingInfoRequest builds the billing-info payload for Paygate
 * @property {function(): void} handlePhoneClick
 *   focuses the phone-country selector when the field wrapper is clicked
 * @property {function(JQuery.Event): void} handlePhoneNumberBeforeInput
 *   blocks unsupported phone input characters
 * @property {function(): void} handlePhoneNumberFocus
 *   focuses the phone-country selector before number entry
 * @property {function(): void} sanitizePhoneNumberValue
 *   normalizes phone text after edits
 * @property {function(string): void} showVatIdError
 *   renders VAT API validation errors inline
 * @property {function(): void} updatePhoneCountryDisplay
 *   refreshes visible phone-country UI
 * @property {function(): void} updateVatIdFieldState
 *   refreshes VAT field state after country changes
 * @property {function(HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement):boolean} validateField
 *   validates one form field
 * @property {function(string): boolean} validateRequiredFields
 *   validates all required checkout fields
 */

/**
 * Creates the checkout form controller.
 *
 * @param {Object} options form controller options
 * @param {CheckoutDom} options.dom checkout DOM references
 * @return {CheckoutFormController} checkout form helpers and event handlers
 */
export function createCheckoutFormController({dom}) {
    /**
     * Validates all required checkout fields before billing info submission.
     *
     * @param {string} requiredSelector selector used to find required form fields
     * @return {boolean} true when all required fields are valid
     */
    function validateRequiredFields(requiredSelector) {
        return Array.from(dom.form.querySelectorAll(requiredSelector))
            .map(validateField)
            .every(Boolean);
    }

    /**
     * Validates a single form field and renders its inline error state.
     *
     * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} field field element to
     *   validate
     * @return {boolean} true when the field has no validation error
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
        } else if (field.id === 'checkout-phone' && value && !dom.$phoneCountryCode.val()) {
            message = 'Choose a phone country code.';
        }

        setFieldError(field, message);
        return !message;
    }

    /**
     * Shows the API-provided VAT ID validation error on the VAT ID field.
     *
     * @param {string} reason paygate VAT ID error reason
     */
    function showVatIdError(reason) {
        setFieldError(dom.$vatId.get(0), vatIdErrorMessage(reason));
    }

    /**
     * Refreshes VAT ID state after country changes without marking an empty field as invalid.
     */
    function updateVatIdFieldState() {
        const field = dom.$vatId.get(0);
        const vatId = (dom.$vatId.val() || '').trim();

        vatId ? validateField(field) : setFieldError(field, '');
    }

    /**
     * Builds the Paygate submit-billing-info request from the checkout form.
     *
     * @param {string} orderId paygate order ID
     * @return {SubmitBillingInfoRequest} submit-billing-info request payload
     */
    function buildSubmitBillingInfoRequest(orderId) {
        const formData = Object.fromEntries(new FormData(dom.form).entries());
        const field = name => (formData[name] || '').trim();
        const companyName = field('company');
        const vatId = field('vat_id');
        const fullName = [field('first_name'), field('last_name')]
            .filter(Boolean)
            .join(' ') || companyName;
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
     *
     * @param {boolean} countryManuallySelected whether billing country was chosen by the user
     * @return {boolean} true when billing country was changed by the phone-country selector
     */
    function applyBillingCountryFromPhoneCountry(countryManuallySelected) {
        if (countryManuallySelected) {
            return false;
        }

        const phoneCode = dom.$phoneCountryCode.val();
        const countryCode = countryCodeFromPhoneCode(phoneCode);

        if (!countryCode || !hasCountryOption(countryCode) || dom.$country.val() === countryCode) {
            return false;
        }

        dom.$country.val(countryCode);
        return true;
    }

    /**
     * Sets phone country from billing country while the phone number is still untouched.
     *
     * @param {boolean} phoneCountryManuallySelected whether phone country was chosen by the user
     */
    function applyPhoneCountryFromBillingCountry(phoneCountryManuallySelected) {
        if (phoneCountryManuallySelected || hasPhoneNumber()) {
            updatePhoneCountryDisplay();
            return;
        }

        const phoneCode = euCountryPhoneCodes[dom.$country.val()] || '';
        dom.$phoneCountryCode.val(phoneCode);
        updatePhoneCountryDisplay();
    }

    /**
     * Mirrors the selected phone country into the custom visible phone field.
     */
    function updatePhoneCountryDisplay() {
        const selected = dom.$phoneCountryCode.find(':selected');
        const flag = selected.data('flag') || '';
        const code = selected.data('code') || '';
        const hasPhoneCountry = Boolean(dom.$phoneCountryCode.val());

        dom.$phoneFlag.text(flag);
        dom.$phoneDialCode.text(code);
        dom.$phone.attr('data-phone-country-selected', hasPhoneCountry ? 'true' : 'false');
        dom.$phoneNumber.prop('disabled', !hasPhoneCountry);

        if (!hasPhoneCountry) {
            clearPhoneNumber();
        }
    }

    /**
     * Moves focus to the invisible native select that backs the phone country picker.
     */
    function focusPhoneCountrySelector() {
        dom.$phoneCountryCode.trigger('focus');
    }

    /**
     * Handles clicks on the custom phone field wrapper.
     */
    function handlePhoneClick() {
        if (!dom.$phoneCountryCode.val()) {
            focusPhoneCountrySelector();
        }
    }

    /**
     * Handles focus on the phone number input.
     */
    function handlePhoneNumberFocus() {
        if (!dom.$phoneCountryCode.val()) {
            focusPhoneCountrySelector();
        }
    }

    /**
     * Prevents unsupported phone symbols from being typed into the phone field.
     *
     * @param {JQuery.Event} event phone number beforeinput event
     */
    function handlePhoneNumberBeforeInput(event) {
        const originalEvent = event.originalEvent;

        if (originalEvent && originalEvent.data && !isValidPhoneNumberInput(originalEvent.data)) {
            event.preventDefault();
        }
    }

    /**
     * Sanitizes the phone number input after user edits.
     */
    function sanitizePhoneNumberValue() {
        const value = dom.$phoneNumber.val();
        const sanitized = sanitizePhoneNumberInput(value);

        if (value !== sanitized) {
            dom.$phoneNumber.val(sanitized);
        }
    }

    /**
     * Applies or clears the visual error state for a form field.
     *
     * @param {HTMLElement} field field whose nearest form-field container should be updated
     * @param {string} message error message to show, or empty string to clear the error
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
     * Returns the field error element, creating it when the template has none.
     *
     * @param {HTMLElement} fieldContainer form field container that owns the error element
     * @return {HTMLDivElement} existing or newly created error element
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
     * Maps Paygate VAT ID error reasons to user-facing field messages.
     *
     * @param {string} reason paygate VAT ID error reason
     * @return {string} user-facing VAT ID field error message
     */
    function vatIdErrorMessage(reason) {
        switch (reason) {
            case 'INVALID_FORMAT':
                return 'Invalid VAT ID format. Example: EE1234567890.';
            case 'COUNTRY_MISMATCH':
                return 'The VAT ID country must match the selected billing country.';
            case 'NON_EU_COUNTRY':
                return 'Only European Union VAT ID is acceptable.';
            case 'NOT_ACTIVE':
                return 'This VAT ID is not active.';
            case 'UNSPECIFIED':
            case 'INVALID':
            case 'VAT_ID_INVALID':
            default:
                return 'Invalid VAT ID.';
        }
    }

    /**
     * Clears the national phone-number input and refreshes its validation state.
     */
    function clearPhoneNumber() {
        dom.$phoneNumber.val('');
        validateField(dom.$phoneNumber.get(0));
    }

    /**
     * Checks whether the national phone-number input has user-entered text.
     *
     * @return {boolean} true when the phone number input is not empty
     */
    function hasPhoneNumber() {
        return Boolean((dom.$phoneNumber.val() || '').trim());
    }

    /**
     * Checks whether the billing country select contains the given country code.
     *
     * @param {string} countryCode country ISO code to look for in the billing country select
     * @return {boolean} true when the select has an option for the country code
     */
    function hasCountryOption(countryCode) {
        return dom.$country.find(`option[value="${countryCode}"]`).length > 0;
    }

    /**
     * Resolves an EU billing country code from a phone country code.
     *
     * @param {string} phoneCode phone calling code without a plus sign
     * @return {string} matching billing country code, or empty string when none matches
     */
    function countryCodeFromPhoneCode(phoneCode) {
        return Object.keys(euCountryPhoneCodes).find(
            countryCode => euCountryPhoneCodes[countryCode] === phoneCode
        ) || '';
    }

    /**
     * Joins non-empty address lines into the single street value expected by Paygate.
     *
     * @param {string} line1 first street address line
     * @param {string} line2 second street address line
     * @return {string} comma-separated street value
     */
    function joinAddressLines(line1, line2) {
        return [line1, line2].map(value => (value || '').trim()).filter(Boolean).join(', ');
    }

    return {
        applyBillingCountryFromPhoneCountry,
        applyPhoneCountryFromBillingCountry,
        buildSubmitBillingInfoRequest,
        handlePhoneClick,
        handlePhoneNumberBeforeInput,
        handlePhoneNumberFocus,
        sanitizePhoneNumberValue,
        showVatIdError,
        updatePhoneCountryDisplay,
        updateVatIdFieldState,
        validateField,
        validateRequiredFields
    };
}
