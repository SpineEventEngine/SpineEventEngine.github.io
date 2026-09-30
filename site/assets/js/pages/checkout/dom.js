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
 * DOM references used across the checkout page controllers.
 *
 * @typedef {Object} CheckoutDom
 * @property {JQuery<HTMLFormElement>} $form checkout billing form wrapper
 * @property {JQuery<HTMLElement>} $summary order summary container
 * @property {JQuery<HTMLSelectElement>} $country billing country select
 * @property {JQuery<HTMLInputElement>} $phoneNumber international phone input
 * @property {JQuery<HTMLInputElement>} $phoneCountry native phone-country state
 * @property {JQuery<HTMLInputElement>} $vatId vat ID input
 * @property {JQuery<HTMLElement>} $loading summary loading container
 * @property {JQuery<HTMLElement>} $productTitle product title element
 * @property {JQuery<HTMLElement>} $productDescription product description
 *   element
 * @property {JQuery<HTMLElement>} $subtotalValue subtotal value element
 * @property {JQuery<HTMLElement>} $vatLabel vat label element
 * @property {JQuery<HTMLElement>} $vatValue vat amount element
 * @property {JQuery<HTMLElement>} $totalValue total amount element
 * @property {JQuery<HTMLButtonElement>} $submitButton checkout submit button
 * @property {JQuery<HTMLElement>} $errorModal generic checkout error modal
 * @property {JQuery<HTMLElement>} $missingOrder missing-order result panel
 * @property {JQuery<HTMLElement>} $notFound order-not-found result panel
 * @property {JQuery<HTMLElement>} $summaryError generic checkout summary-error panel
 * @property {HTMLFormElement} form native checkout form element
 */

/**
 * Collects the checkout page DOM references used by the page controllers.
 *
 * @return {CheckoutDom|null} checkout DOM references, or null when the page is not present
 */
export function getCheckoutDom() {
    const dom = {
        $form: $('#checkout-form'),
        $summary: $('.checkout-summary'),
        $country: $('#checkout-country'),
        $phoneNumber: $('#checkout-phone'),
        $phoneCountry: $('#checkout-phone-country'),
        $vatId: $('#checkout-vat-id'),
        $loading: $('#checkout-summary-loading'),
        $productTitle: $('#checkout-product-title'),
        $productDescription: $('#checkout-product-description'),
        $subtotalValue: $('#checkout-subtotal-value'),
        $vatLabel: $('#checkout-vat-label'),
        $vatValue: $('#checkout-vat-value'),
        $totalValue: $('#checkout-total-value'),
        $submitButton: $('#checkout-submit'),
        $errorModal: $('#checkout-error-modal'),
        $missingOrder: $('#checkout-missing-order'),
        $notFound: $('#checkout-not-found'),
        $summaryError: $('#checkout-summary-error')
    };

    if (!dom.$form.length || !dom.$summary.length) {
        return null;
    }

    return {
        ...dom,
        form: dom.$form.get(0)
    };
}
