/*
 * Copyright 2026, TeamDev. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
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

import {isEuCountry} from 'js/pages/checkout/vat-countries';
import {normalizeIntlPhoneNumber} from 'js/modules/forms/phone-number';

/**
 * Generic async field-validation states.
 */
export const fieldValidationState = Object.freeze({
    idle: 'idle',
    loading: 'loading',
    success: 'success'
});

/**
 * @typedef {import('js/pages/checkout/dom').CheckoutDom} CheckoutDom
 * @typedef {import('js/modules/paygate/purchases').SubmitBillingInfoRequest}
 * SubmitBillingInfoRequest
 */

/**
 * API exposed by the checkout form controller.
 *
 * @typedef {Object} CheckoutFormController
 * @property {function(boolean): void} applyPhoneCountryFromBillingCountry
 *   syncs phone country from billing country when allowed
 * @property {function(): void} bindPhoneEvents
 *   attaches phone field event handlers
 * @property {function(string): SubmitBillingInfoRequest}
 *   buildSubmitBillingInfoRequest builds the billing-info payload for Paygate
 * @property {function(): void} clearVatIdError
 *   clears the VAT ID API validation error
 * @property {function(): void} focusPhoneNumber
 *   focuses the phone number input when a country is selected
 * @property {function(): string} getVatId
 *   returns VAT ID only when it applies to the selected country
 * @property {function(Object): void} restoreCountryState
 *   restores the billing-country and phone-country controls
 * @property {function(HTMLElement, string): void} setFieldValidationState
 *   updates generic async field validation styling
 * @property {function(string): void} showVatIdError
 *   renders VAT API validation errors inline
 * @property {function(): void} initPhoneNumberField
 *   initializes the shared international phone input
 * @property {function(): void} updateVatIdFieldState
 *   refreshes VAT field state after country changes
 * @property {function(HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement):boolean}
 *   validateField
 *   validates one form field
 * @property {function(string): boolean} validateRequiredFields
 *   validates all required checkout fields
 * @property {function(): boolean} validatePhoneNumber
 *   validates the optional international phone number
 */

/**
 * Creates the checkout form controller.
 *
 * @param {Object} options form controller options
 * @param {CheckoutDom} options.dom checkout DOM references
 * @return {CheckoutFormController} checkout form helpers and event handlers
 */
export function createCheckoutFormController({dom}) {
    let isSettingPhoneCountryProgrammatically = false;

    /** Initializes the shared `intl-tel-input` field. */
    function initPhoneNumberField() {
        const field = dom.$phoneNumber.get(0);

        if (!field || typeof window.intlTelInput !== 'function') {
            return;
        }

        window.intlTelInput(field, {
            initialCountry: normalizeCountryCode(dom.$phoneCountry.val()) || 'us',
            autoPlaceholder: 'aggressive',
            separateDialCode: true,
            formatOnDisplay: true
        });
        syncPhoneCountryState();
    }

    /**
     * Attaches event handlers for the shared phone field.
     *
     * @param {Object} options phone event options
     * @param {function(): void} [options.onPhoneCountryChange] called after a
     *   user-driven phone country change
     */
    function bindPhoneEvents({onPhoneCountryChange} = {}) {
        dom.$phoneNumber.on('countrychange', () => {
            syncPhoneCountryState();
            if (
                !isSettingPhoneCountryProgrammatically &&
                typeof onPhoneCountryChange === 'function'
            ) {
                onPhoneCountryChange();
            }
        });
        dom.$phoneNumber.on('input', () => setPhoneFieldError(''));
        dom.$phoneNumber.on('blur', validatePhoneNumber);
    }

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

        if (field.disabled || field.closest('[hidden]')) {
            setFieldError(field, '');
            return true;
        }

        if (field.type === 'tel') {
            return true;
        }

        const value = field.value ? field.value.trim() : '';
        let message = '';

        if (field.required && !value) {
            message = 'This field is required.';
        } else if (field.type === 'email' && value && !field.validity.valid) {
            message = 'Enter a valid email address.';
        }

        setFieldError(field, message);
        return !message;
    }

    /**
     * Validates the optional phone number through `intl-tel-input`.
     *
     * @return {boolean} true when the phone is empty or valid
     */
    function validatePhoneNumber() {
        const value = String(dom.$phoneNumber.val() || '').trim();
        const phoneInput = getPhoneInputInstance();
        const utilsReady = Boolean(window.intlTelInputUtils);
        const isValid = !value || !utilsReady ||
            Boolean(phoneInput && phoneInput.isValidNumber());

        setPhoneFieldError(isValid ? '' : 'Enter a valid phone number.');
        return isValid;
    }

    /**
     * Shows the API-provided VAT ID validation error on the VAT ID field.
     *
     * @param {string} reason paygate VAT ID error reason
     */
    function showVatIdError(reason) {
        if (!isVatIdRelevant()) {
            return;
        }
        setFieldError(dom.$vatId.get(0), vatIdErrorMessage(reason));
    }

    /** Clears an earlier VAT ID validation response after the input changes. */
    function clearVatIdError() {
        setFieldError(dom.$vatId.get(0), '');
    }

    /**
     * Updates generic async field validation styling.
     *
     * @param {HTMLElement} field field whose validation styling should be updated
     * @param {string} state async validation state
     */
    function setFieldValidationState(field, state) {
        if (state === fieldValidationState.success) {
            setFieldError(field, '');
        }
        applyFieldValidationState(field, state);
    }

    /**
     * Refreshes VAT ID state after country changes without marking an empty field as invalid.
     */
    function updateVatIdFieldState() {
        const field = dom.$vatId.get(0);
        const fieldContainer = field && field.closest('.form-field');
        const isRelevant = isVatIdRelevant();

        if (!field || !fieldContainer) {
            return;
        }

        fieldContainer.hidden = !isRelevant;

        if (!isRelevant) {
            dom.$vatId.val('');
            setFieldError(field, '');
            applyFieldValidationState(field, fieldValidationState.idle);
            return;
        }

        setFieldError(field, '');
    }

    /**
     * Returns VAT ID only when it applies to the selected billing country.
     *
     * @return {string} VAT ID, or an empty string when VAT ID is not applicable
     */
    function getVatId() {
        return isVatIdRelevant()
            ? String(dom.$vatId.val() || '').trim()
            : '';
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
        const vatId = getVatId();
        const fullName = [field('first_name'), field('last_name')]
            .filter(Boolean)
            .join(' ') || companyName;
        const phoneNumber = buildPhoneNumberPayload();
        const company = (companyName || vatId) ? {
            ...(companyName ? {name: companyName} : {}),
            ...(vatId ? {vatId} : {})
        } : null;
        const billingInfo = {
            name: fullName,
            email: field('email'),
            address: {
                countryCode: field('country'),
                city: field('city'),
                street: joinAddressLines(formData.address_line_1, formData.address_line_2),
                postalCode: field('postal_code')
            },
            company
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
     * Sets phone country from billing country unless the phone country was chosen manually.
     *
     * @param {boolean} phoneCountryManuallySelected whether phone country was chosen by the user
     */
    function applyPhoneCountryFromBillingCountry(phoneCountryManuallySelected) {
        if (phoneCountryManuallySelected) {
            return;
        }

        setPhoneCountry(dom.$country.val());
    }

    /** Restores billing-country and phone-country controls from browser history. */
    function restoreCountryState({billingCountryCode, phoneCountryCode}) {
        if (!billingCountryCode || hasCountryOption(billingCountryCode)) {
            setBillingCountry(billingCountryCode);
        }

        setPhoneCountry(phoneCountryCode || billingCountryCode);
    }

    /** Returns country values restored by the browser's native form state. */
    function getBrowserRestoredCountryState() {
        return {
            billingCountryCode: normalizeCountryCode(dom.$country.val()),
            phoneCountryCode: normalizeCountryCode(dom.$phoneCountry.val())
        };
    }

    /**
     * Focuses the phone number input when the phone country is selected.
     */
    function focusPhoneNumber() {
        window.requestAnimationFrame(() => {
            dom.$phoneNumber.trigger('focus');
        });
    }

    /** Returns the `intl-tel-input` instance for the checkout phone field. */
    function getPhoneInputInstance() {
        const field = dom.$phoneNumber.get(0);

        if (!field || !window.intlTelInputGlobals) {
            return null;
        }

        return window.intlTelInputGlobals.getInstance(field);
    }

    /** Returns the selected phone country as an uppercase ISO code. */
    function getSelectedPhoneCountryCode() {
        const phoneInput = getPhoneInputInstance();
        const countryData = phoneInput && phoneInput.getSelectedCountryData();

        return String(countryData && countryData.iso2 || '').toUpperCase();
    }

    /** Mirrors the library-owned phone country into a native form control. */
    function syncPhoneCountryState() {
        dom.$phoneCountry.val(getSelectedPhoneCountryCode());
    }

    /** Selects the phone country without treating it as a user change. */
    function setPhoneCountry(countryCode) {
        const phoneInput = getPhoneInputInstance();
        const normalizedCode = String(countryCode || '').trim().toLowerCase();

        if (!phoneInput || !/^[a-z]{2}$/.test(normalizedCode)) {
            return;
        }

        isSettingPhoneCountryProgrammatically = true;
        try {
            // `setCountry()` emits `countrychange` synchronously. Keep the guard
            // through that event and release it after the current event turn.
            phoneInput.setCountry(normalizedCode);
        } finally {
            window.setTimeout(() => {
                isSettingPhoneCountryProgrammatically = false;
            }, 0);
        }
    }

    /** Sets the native country value and refreshes its Select2 presentation. */
    function setBillingCountry(countryCode) {
        dom.$country.val(countryCode);
        if (dom.$country.hasClass('select2-hidden-accessible')) {
            dom.$country.trigger('change.select2');
        }
    }

    /** Builds the optional Paygate phone number from the shared plugin state. */
    function buildPhoneNumberPayload() {
        const rawNumber = String(dom.$phoneNumber.val() || '').trim();
        const phoneInput = getPhoneInputInstance();
        const countryData = phoneInput && phoneInput.getSelectedCountryData();

        return normalizeIntlPhoneNumber(
            rawNumber,
            countryData && countryData.dialCode,
            phoneInput && phoneInput.getNumber()
        );
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

        if (message) {
            applyFieldValidationState(field, fieldValidationState.idle);
        }

        fieldContainer.classList.toggle('field-error', Boolean(message));
        errorElement.textContent = message || '';
    }

    /** Applies or clears the international phone field error state. */
    function setPhoneFieldError(message) {
        const field = dom.$phoneNumber.get(0);

        if (!field) {
            return;
        }

        setFieldError(field, message);
        field.setCustomValidity(message || '');
    }

    /**
     * Applies the field state classes used by inline validation styles.
     *
     * @param {HTMLElement} field field whose state should be updated
     * @param {string} state field validation state
     */
    function applyFieldValidationState(field, state) {
        const fieldContainer = field && field.closest('.form-field');

        if (!fieldContainer) {
            return;
        }

        fieldContainer.classList.toggle(
            'field-loading',
            state === fieldValidationState.loading
        );
        fieldContainer.classList.toggle(
            'field-success',
            state === fieldValidationState.success
        );
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
     * Checks whether the billing country select contains the given country code.
     *
     * @param {string} countryCode country ISO code to look for in the billing country select
     * @return {boolean} true when the select has an option for the country code
     */
    function hasCountryOption(countryCode) {
        const countryField = dom.$country.get(0);
        return Boolean(
            countryField && Array.from(countryField.options)
                .some(option => option.value === countryCode)
        );
    }

    /** Normalizes a possible ISO country code. */
    function normalizeCountryCode(countryCode) {
        const normalizedCode = String(countryCode || '').trim().toUpperCase();
        return /^[A-Z]{2}$/.test(normalizedCode) ? normalizedCode : '';
    }

    /** Checks whether the selected billing country supports VAT ID entry. */
    function isVatIdRelevant() {
        return isEuCountry(dom.$country.val());
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
        applyPhoneCountryFromBillingCountry,
        bindPhoneEvents,
        buildSubmitBillingInfoRequest,
        clearVatIdError,
        focusPhoneNumber,
        getBrowserRestoredCountryState,
        getVatId,
        initPhoneNumberField,
        restoreCountryState,
        setFieldValidationState,
        showVatIdError,
        updateVatIdFieldState,
        validateField,
        validatePhoneNumber,
        validateRequiredFields
    };
}
