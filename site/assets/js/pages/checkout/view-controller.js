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
 * @typedef {import('js/pages/checkout/dom').CheckoutDom} CheckoutDom
 */

/**
 * API exposed by the checkout view controller.
 *
 * @typedef {Object} CheckoutViewController
 * @property {function(): void} closeErrorModal
 *   closes the generic checkout error modal
 * @property {function(Object): void} fillOrderSummary
 *   fills summary fields with order data
 * @property {function(): boolean} isFormHidden
 *   checks whether the checkout form is currently hidden
 * @property {function(boolean): void} setSubmitDisabled
 *   enables or disables the checkout submit button
 * @property {function(boolean): void} setSummaryLoading
 *   shows or hides the summary loading state
 * @property {function(): void} showErrorModal
 *   opens the generic checkout error modal
 * @property {function(): void} showNotFoundView
 *   shows the checkout order-not-found panel
 * @property {function(): void} showSummaryError
 *   shows the generic checkout summary-error panel
 * @property {function(Object): void} updateCharges
 *   refreshes summary totals from charge-calculation response
 */

/**
 * Creates the checkout view controller.
 *
 * @param {CheckoutDom} dom checkout DOM references
 * @return {CheckoutViewController} view update helpers for the checkout page
 */
export function createCheckoutView(dom) {

    /**
     * Enables or disables the checkout submit button.
     *
     * @param {boolean} isDisabled whether submit should be disabled
     */
    function setSubmitDisabled(isDisabled) {
        dom.$submitButton.prop('disabled', isDisabled);
    }

    /**
     * Checks whether the checkout form is currently hidden.
     *
     * @return {boolean} true when the form is hidden
     */
    function isFormHidden() {
        return dom.$form.prop('hidden');
    }

    /**
     * Fills the order summary with order details returned by Paygate.
     *
     * @param {Object} order paygate order data for the current order
     */
    function fillOrderSummary(order) {
        if (!order) {
            return;
        }

        dom.$productName.text(order.productName || 'Unnamed product').prop('hidden', false);

        if (order.productDescription) {
            dom.$productDescription.text(order.productDescription).prop('hidden', false);
        } else {
            dom.$productDescription.text('').prop('hidden', true);
        }

        dom.$subtotalValue.text(formatMoney(order.netAmount));
        dom.$vatLabel.text('VAT');
        dom.$vatValue.text(formatMoney(zeroMoney(order.netAmount.currency)));
        dom.$totalValue.text(formatMoney(order.netAmount));
    }

    /**
     * Updates the order summary from the Paygate charge calculation response.
     *
     * @param {Object} response paygate charge calculation response
     */
    function updateCharges(response) {
        const vatRatePercent = Number(response.vatRate) * 100;

        dom.$vatLabel.text(`VAT (${String(vatRatePercent)}%)`);
        dom.$subtotalValue.text(formatMoney(response.netAmount));
        dom.$vatValue.text(formatMoney(response.vatAmount));
        dom.$totalValue.text(formatMoney(response.totalAmount));
    }

    /**
     * Shows or hides the order-summary loading state.
     *
     * @param {boolean} isLoading whether the summary should show the loading state
     */
    function setSummaryLoading(isLoading) {
        dom.$summary.attr('data-loading', isLoading ? 'true' : 'false');
        dom.$summary.attr('data-error', 'false');
        dom.$summary.prop('hidden', false);
        dom.$loading.prop('hidden', !isLoading);
        dom.$loadingSpinner.prop('hidden', !isLoading);
        dom.$loadingSupport.prop('hidden', true);
        dom.$form.prop('hidden', isLoading);
        dom.$notFound.prop('hidden', true);
        dom.$summaryError.prop('hidden', true);

        if (isLoading) {
            dom.$loadingText.text('Loading checkout details...');
        }
    }

    /**
     * Shows the generic summary error panel inside the checkout page.
     */
    function showSummaryError() {
        dom.$summary.attr('data-error', 'true');
        dom.$summary.prop('hidden', true);
        dom.$form.prop('hidden', true);
        dom.$notFound.prop('hidden', true);
        dom.$summaryError.prop('hidden', false);
    }

    /**
     * Opens the generic checkout error modal.
     */
    function showErrorModal() {
        dom.$errorModal.prop('hidden', false);
    }

    /**
     * Closes the generic checkout error modal.
     */
    function closeErrorModal() {
        dom.$errorModal.prop('hidden', true);
    }

    /**
     * Shows the not-found result panel inside the checkout page.
     */
    function showNotFoundView() {
        closeErrorModal();
        dom.$summary.prop('hidden', true);
        dom.$form.prop('hidden', true);
        dom.$summaryError.prop('hidden', true);
        dom.$notFound.prop('hidden', false);
    }

    /**
     * Formats a money value with its currency symbol.
     *
     * @param {Object} amount money value returned by Paygate
     * @return {string} formatted money value
     */
    function formatMoney(amount) {
        const numericAmount = Number(amount.value);
        const formattedAmount = Number.isNaN(numericAmount)
            ? String(amount.value || '')
            : numericAmount.toFixed(2);
        const currency = amount.currency;

        return `${currency.symbol}${formattedAmount}`;
    }

    /**
     * Creates a zero-value money payload for the given currency.
     *
     * @param {Object} currency money currency
     * @return {{value: number, currency: Object}} zero money value
     */
    function zeroMoney(currency) {
        return {
            value: 0,
            currency
        };
    }

    return {
        closeErrorModal,
        fillOrderSummary,
        isFormHidden,
        setSubmitDisabled,
        setSummaryLoading,
        showErrorModal,
        showNotFoundView,
        showSummaryError,
        updateCharges
    };
}
