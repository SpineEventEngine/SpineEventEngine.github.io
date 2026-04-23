'use strict';

/**
 * Collects the checkout page DOM references used by the page controllers.
 *
 * @return {Object|null} Checkout DOM references, or null when the page is not present.
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
