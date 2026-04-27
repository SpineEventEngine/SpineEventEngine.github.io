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
 * DOM references used across the checkout page controllers.
 *
 * @typedef {Object} CheckoutDom
 * @property {JQuery<HTMLFormElement>} $form checkout billing form wrapper
 * @property {JQuery<HTMLElement>} $summary order summary container
 * @property {JQuery<HTMLSelectElement>} $country billing country select
 * @property {JQuery<HTMLElement>} $phone custom phone field wrapper
 * @property {JQuery<HTMLSelectElement>} $phoneCountryCode phone country-code
 *   select
 * @property {JQuery<HTMLElement>} $phoneFlag visible phone country flag
 * @property {JQuery<HTMLElement>} $phoneDialCode visible phone dial code label
 * @property {JQuery<HTMLInputElement>} $phoneNumber national phone number input
 * @property {JQuery<HTMLInputElement>} $vatId vat ID input
 * @property {JQuery<HTMLElement>} $loading summary loading container
 * @property {JQuery<HTMLElement>} $loadingSpinner summary spinner element
 * @property {JQuery<HTMLElement>} $loadingText summary loading text element
 * @property {JQuery<HTMLElement>} $loadingSupport summary support text element
 * @property {JQuery<HTMLElement>} $productName product name element
 * @property {JQuery<HTMLElement>} $productDescription product description
 *   element
 * @property {JQuery<HTMLElement>} $subtotalValue subtotal value element
 * @property {JQuery<HTMLElement>} $vatLabel vat label element
 * @property {JQuery<HTMLElement>} $vatValue vat amount element
 * @property {JQuery<HTMLElement>} $totalValue total amount element
 * @property {JQuery<HTMLButtonElement>} $submitButton checkout submit button
 * @property {JQuery<HTMLElement>} $errorModal generic checkout error modal
 * @property {JQuery<HTMLElement>} $notFound product-not-found result panel
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
        $phone: $('.phone-field'),
        $phoneCountryCode: $('#checkout-phone-country-code'),
        $phoneFlag: $('#checkout-phone-flag'),
        $phoneDialCode: $('#checkout-phone-dial-code'),
        $phoneNumber: $('#checkout-phone'),
        $vatId: $('#checkout-vat-id'),
        $loading: $('#checkout-summary-loading'),
        $loadingSpinner: $('#checkout-summary-loading-spinner'),
        $loadingText: $('#checkout-summary-loading-text'),
        $loadingSupport: $('#checkout-summary-support'),
        $productName: $('#checkout-product-name'),
        $productDescription: $('#checkout-product-description'),
        $subtotalValue: $('#checkout-subtotal-value'),
        $vatLabel: $('#checkout-vat-label'),
        $vatValue: $('#checkout-vat-value'),
        $totalValue: $('#checkout-total-value'),
        $submitButton: $('#checkout-submit'),
        $errorModal: $('#checkout-error-modal'),
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
