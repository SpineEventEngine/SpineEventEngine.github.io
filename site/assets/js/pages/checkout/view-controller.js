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
 * @property {function(): void} showSummaryLoading
 *   shows the summary loading state
 * @property {function(): void} showErrorModal
 *   opens the generic checkout error modal
 * @property {function(): void} showCheckoutView
 *   shows a resolved order summary and its billing form
 * @property {function(): void} showMissingOrderView
 *   shows the missing-order result panel
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
        dom.$submitButton
            .prop('disabled', isDisabled)
            .toggleClass('disabled', isDisabled);
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

        dom.$productTitle.text(order.productTitle || 'Untitled product').prop('hidden', false);

        if (order.productDescription) {
            dom.$productDescription.text(order.productDescription).prop('hidden', false);
        } else {
            dom.$productDescription.text('').prop('hidden', true);
        }

        const netAmount = order.netAmount || {};

        dom.$subtotalValue.text(formatMoney(netAmount));
        dom.$vatLabel.text('VAT');
        dom.$vatValue.text(formatMoney(zeroMoney(netAmount.currency)));
        dom.$totalValue.text(formatMoney(netAmount));
    }

    /**
     * Updates the order summary from the Paygate charge calculation response.
     *
     * @param {Object} response paygate charge calculation response
     */
    function updateCharges(response) {
        dom.$vatLabel.text(formatVatLabel(response && response.vatRate));
        dom.$subtotalValue.text(formatMoney(response.netAmount));
        dom.$vatValue.text(formatMoney(response.vatAmount));
        dom.$totalValue.text(formatMoney(response.totalAmount));
    }

    /**
     * Shows the order-summary loading state.
     */
    function showSummaryLoading() {
        setResultPageMode(false);
        dom.$summary.prop('hidden', true);
        dom.$loading.prop('hidden', false);
        dom.$form.prop('hidden', true);
        dom.$missingOrder.prop('hidden', true);
        dom.$notFound.prop('hidden', true);
        dom.$summaryError.prop('hidden', true);
    }

    /**
     * Shows the generic summary error panel inside the checkout page.
     */
    function showSummaryError() {
        setResultPageMode(true);
        dom.$loading.prop('hidden', true);
        dom.$summary.prop('hidden', true);
        dom.$form.prop('hidden', true);
        dom.$missingOrder.prop('hidden', true);
        dom.$notFound.prop('hidden', true);
        dom.$summaryError.prop('hidden', false);
    }

    /** Shows the resolved order summary and billing form. */
    function showCheckoutView() {
        setResultPageMode(false);
        closeErrorModal();
        dom.$loading.prop('hidden', true);
        dom.$summary.prop('hidden', false);
        dom.$form.prop('hidden', false);
        dom.$missingOrder.prop('hidden', true);
        dom.$notFound.prop('hidden', true);
        dom.$summaryError.prop('hidden', true);
    }

    /** Shows the missing-order result panel. */
    function showMissingOrderView() {
        setResultPageMode(true);
        closeErrorModal();
        dom.$loading.prop('hidden', true);
        dom.$summary.prop('hidden', true);
        dom.$form.prop('hidden', true);
        dom.$notFound.prop('hidden', true);
        dom.$summaryError.prop('hidden', true);
        dom.$missingOrder.prop('hidden', false);
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
        setResultPageMode(true);
        closeErrorModal();
        dom.$loading.prop('hidden', true);
        dom.$summary.prop('hidden', true);
        dom.$form.prop('hidden', true);
        dom.$missingOrder.prop('hidden', true);
        dom.$summaryError.prop('hidden', true);
        dom.$notFound.prop('hidden', false);
    }

    /** Matches checkout result-page height to the payment-result layout. */
    function setResultPageMode(isResultPage) {
        document.body.classList.toggle('checkout-result-page', isResultPage);
    }

    /**
     * Formats a money value with its currency symbol.
     *
     * @param {Object} amount money value returned by Paygate
     * @return {string} formatted money value
     */
    function formatMoney(amount) {
        const amountValue = amount && amount.value;
        const numericAmount = Number(amountValue);
        const formattedAmount = Number.isNaN(numericAmount)
            ? String(amountValue || '')
            : numericAmount.toFixed(2);
        const currency = amount && amount.currency;
        const currencySymbol = currency && currency.symbol || '';

        return `${currencySymbol}${formattedAmount}`;
    }

    /**
     * Formats a VAT-rate label without exposing invalid or imprecise numbers.
     *
     * @param {*} rawVatRate VAT rate returned by Paygate
     * @return {string} VAT label with an optional percentage
     */
    function formatVatLabel(rawVatRate) {
        const vatRate = Number(rawVatRate);

        if (rawVatRate === null || rawVatRate === undefined || rawVatRate === '' ||
            !Number.isFinite(vatRate)) {
            return 'VAT';
        }

        const percentage = Math.round(vatRate * 10000) / 100;
        return `VAT (${String(percentage)}%)`;
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
        showSummaryLoading,
        showCheckoutView,
        showErrorModal,
        showMissingOrderView,
        showNotFoundView,
        showSummaryError,
        updateCharges
    };
}
