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

export const checkoutNavigationMode = Object.freeze({
    none: 'none',
    reset: 'reset',
    restore: 'restore'
});

/** Chooses whether checkout state should be restored or reset for a navigation. */
export function getCheckoutNavigationMode(navigationType, pagePersisted = false) {
    if (pagePersisted || navigationType === 'back_forward') {
        return checkoutNavigationMode.restore;
    }
    if (navigationType === 'reload') {
        return checkoutNavigationMode.reset;
    }
    return checkoutNavigationMode.none;
}

/**
 * Restores whether the phone country should remain independent from billing country.
 *
 * @param {boolean} wasManuallySelected state retained by a cached page
 * @param {Object} restoredState country values restored by the browser
 * @return {boolean} whether billing-country changes should leave phone country unchanged
 */
export function getRestoredPhoneCountryManualState(wasManuallySelected, restoredState) {
    const billingCountryCode = restoredState && restoredState.billingCountryCode;
    const phoneCountryCode = restoredState && restoredState.phoneCountryCode;

    return Boolean(
        wasManuallySelected ||
        billingCountryCode && phoneCountryCode && phoneCountryCode !== billingCountryCode
    );
}
