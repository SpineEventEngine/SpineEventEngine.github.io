/*
 * Copyright 2026 CodeMatters, Lda.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

'use strict';

/**
 * Builds the phone-number payload with country code and number with digits only.
 *
 * @param {string} rawCountryCode phone country code
 * @param {string} rawNumber local phone number
 * @return {{countryCode: number, number: string}|null}
 *   normalized phone-number payload, or null when incomplete
 */
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

/**
 * Builds a Paygate phone payload from an `intl-tel-input` field.
 *
 * @param {string} rawNumber displayed national phone number
 * @param {string} rawCountryCode selected international dial code
 * @param {string} rawFullNumber full number returned by the plugin
 * @return {{countryCode: number, number: string}|null}
 *   normalized phone-number payload, or null when incomplete
 */
export function normalizeIntlPhoneNumber(rawNumber, rawCountryCode, rawFullNumber) {
    const countryCode = digits(rawCountryCode);
    const fullNumber = digits(rawFullNumber);
    const fallbackNumber = digits(rawNumber);

    if (!countryCode || !fallbackNumber) {
        return null;
    }

    const number = fullNumber.indexOf(countryCode) === 0
        ? fullNumber.slice(countryCode.length)
        : fallbackNumber;

    return normalizePhoneNumber(countryCode, number);
}

/** Returns decimal digits from a phone-number fragment. */
function digits(value) {
    return String(value || '').replace(/\D/g, '');
}
