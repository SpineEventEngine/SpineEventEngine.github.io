'use strict';

/**
 * Creates the checkout view controller.
 *
 * @param {Object} dom - Checkout DOM references.
 * @return {Object} View update helpers for the checkout page.
 */
export function createCheckoutView(dom) {
    let currency = '';

    /**
     * Enables or disables the checkout submit button.
     *
     * @param {boolean} isDisabled - Whether submit should be disabled.
     */
    function setSubmitDisabled(isDisabled) {
        dom.$submitButton.prop('disabled', isDisabled);
    }

    /**
     * Checks whether the checkout form is currently hidden.
     *
     * @return {boolean} True when the form is hidden.
     */
    function isFormHidden() {
        return dom.$form.prop('hidden');
    }

    /**
     * Fills the order summary with product details returned by Paygate.
     *
     * @param {Object} product - Paygate product data for the current order.
     */
    function hydrateProductSummary(product) {
        if (!product) {
            return;
        }

        currency = product.currency || currency;
        dom.$productName.text(product.name || 'Unnamed product').prop('hidden', false);

        if (product.description) {
            dom.$productDescription.text(product.description).prop('hidden', false);
        } else {
            dom.$productDescription.text('').prop('hidden', true);
        }

        dom.$subtotalValue.text(formatMoney(product.netPrice, currency));
        dom.$vatLabel.text('VAT');
        dom.$vatValue.text(formatMoney(0, currency));
        dom.$totalValue.text(formatMoney(product.netPrice, currency));
    }

    /**
     * Updates the order summary from the Paygate charge calculation response.
     *
     * @param {Object} response - Paygate charge calculation response.
     */
    function updateCharges(response) {
        const vatRatePercent = Number(response.vatRate) * 100;

        currency = response.currency || currency;
        dom.$vatLabel.text(`VAT (${String(vatRatePercent)}%)`);
        dom.$subtotalValue.text(formatMoney(response.netPrice, currency));
        dom.$vatValue.text(formatMoney(response.vatAmount, currency));
        dom.$totalValue.text(formatMoney(response.total, currency));
    }

    /**
     * Shows or hides the order-summary loading state.
     *
     * @param {boolean} isLoading - Whether the summary should show the loading state.
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
     * Formats an amount with its currency suffix when currency is known.
     *
     * @param {number|string} amount - Amount value returned by Paygate.
     * @param {string} valueCurrency - Currency code to append.
     * @return {string} Formatted money value with optional currency suffix.
     */
    function formatMoney(amount, valueCurrency) {
        const numericAmount = Number(amount);
        const formattedAmount = Number.isNaN(numericAmount) ? amount : numericAmount.toFixed(2);
        return valueCurrency ? `${formattedAmount} ${valueCurrency}` : formattedAmount;
    }

    return {
        closeErrorModal,
        hydrateProductSummary,
        isFormHidden,
        setSubmitDisabled,
        setSummaryLoading,
        showErrorModal,
        showNotFoundView,
        showSummaryError,
        updateCharges
    };
}
