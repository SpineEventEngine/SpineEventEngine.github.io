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

/**
 * Checks whether the input contains only supported phone-number characters.
 *
 * Allowed: digits, parentheses, hyphens, and spaces.
 *
 * @param {string} value phone-number value to check
 * @return {boolean} true when the value contains only allowed characters
 */
export function isValidPhoneNumberInput(value) {
    return /^[0-9\s()-]+$/.test(value);
}

/**
 * Removes characters that are not accepted by the phone-number field.
 *
 * Allowed: digits, parentheses, hyphens, and spaces.
 *
 * @param {string} value phone-number value to sanitize
 * @return {string} sanitized phone-number value
 */
export function sanitizePhoneNumberInput(value) {
    return String(value || '').replace(/[^0-9\s()-]/g, '');
}

/**
 * Builds the phone-number payload with country code and number with digits only.
 *
 * @param {string} rawCountryCode phone country code
 * @param {string} rawNumber local phone number
 * @return {{countryCode: number, number: string}|null}
 *   normalized phone-number payload, or null when incomplete
 */
export function normalizePhoneNumber(rawCountryCode, rawNumber) {
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
