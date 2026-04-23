'use strict';

export const requiredSelector = 'input[required], select[required], textarea[required]';
export const vatIdInputDelay = 1000;
export const countryPhoneCodes = {
    AT: '43',
    BE: '32',
    BG: '359',
    HR: '385',
    CY: '357',
    CZ: '420',
    DK: '45',
    EE: '372',
    FI: '358',
    FR: '33',
    DE: '49',
    GR: '30',
    HU: '36',
    IE: '353',
    IT: '39',
    LV: '371',
    LT: '370',
    LU: '352',
    MT: '356',
    NL: '31',
    PL: '48',
    PT: '351',
    RO: '40',
    SK: '421',
    SI: '386',
    ES: '34',
    SE: '46'
};

/**
 * Reads the product ID from the `product` query parameter.
 *
 * @return {string} Checkout product ID, or empty string when unavailable.
 */
export function getProductId() {
    return (new URLSearchParams(window.location.search).get('product') || '').trim();
}

/**
 * Checks whether a Paygate error means the requested product/order was not found.
 *
 * @param {Object} error - Error object thrown by the Paygate client.
 * @return {boolean} True when the error represents a not-found response.
 */
export function isNotFoundResponse(error) {
    return error.status === 404 || /not found/i.test(error.message || '');
}

/**
 * Checks whether a Paygate error should be rendered on the VAT ID field.
 *
 * @param {Object} error - Error object thrown by the Paygate client.
 * @return {boolean} True when the error contains a VAT ID validation reason.
 */
export function isVatIdErrorResponse(error) {
    return error.status === 422 &&
        error.body &&
        /^VAT_ID_/.test(error.body.reason || '');
}

/**
 * Checks whether a Paygate error should open the generic failure modal.
 *
 * @param {Object} error - Error object thrown by the Paygate client.
 * @return {boolean} True when the response status is a server error.
 */
export function isServerErrorResponse(error) {
    return error.status >= 500;
}

/**
 * Logs API failures in a compact and consistent format.
 *
 * @param {Object|Error} error - Request error to log.
 */
export function logApiError(error) {
    console.error(`${error.status || 'Network error'}: ${error.statusText || error.message || 'Request failed'}`);
}

/**
 * Joins non-empty address lines into the single street value expected by Paygate.
 *
 * @param {string} line1 - First street address line.
 * @param {string} line2 - Second street address line.
 * @return {string} Comma-separated street value.
 */
export function joinAddressLines(line1, line2) {
    return [line1, line2].map(value => (value || '').trim()).filter(Boolean).join(', ');
}

/**
 * Formats an amount with its currency suffix when currency is known.
 *
 * @param {number|string} amount - Amount value returned by Paygate.
 * @param {string} currency - Currency code to append.
 * @return {string} Formatted money value with optional currency suffix.
 */
export function formatMoney(amount, currency) {
    const numericAmount = Number(amount);
    const formattedAmount = Number.isNaN(numericAmount) ? amount : numericAmount.toFixed(2);
    return currency ? `${formattedAmount} ${currency}` : formattedAmount;
}
