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
 * @property {JQuery<HTMLElement>} $summaryError generic checkout summary-error
 *   panel
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
