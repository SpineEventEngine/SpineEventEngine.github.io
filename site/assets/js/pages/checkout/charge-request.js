/*
 * Copyright 2026, TeamDev. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/**
 * Builds a Paygate charge-calculation request for the current buyer inputs.
 *
 * @param {string} orderId Paygate order ID
 * @param {string} buyerCountryCode billing country ISO code
 * @param {string} vatId optional VAT ID
 * @return {Object|null} request body, or null while required inputs are absent
 */
export function buildChargeRequest(orderId, buyerCountryCode, vatId) {
    if (!orderId || !buyerCountryCode) {
        return null;
    }

    return vatId
        ? {orderId, buyerCountryCode, vatId}
        : {orderId, buyerCountryCode};
}

