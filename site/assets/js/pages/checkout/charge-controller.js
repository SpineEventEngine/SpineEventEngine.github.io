'use strict';

/**
 * @typedef {import('../../modules/paygate/purchases').PaygatePurchaseClient} PaygatePurchaseClient
 * @typedef {import('./view-controller').CheckoutViewController} CheckoutViewController
 */

/**
 * Delay before sending the 'calculate-charges' request when VAT ID was changed.
 *
 * @type {number}
 */
const vatIdInputDelay = 1000;

/**
 * API exposed by the checkout charge controller.
 *
 * @typedef {Object} CheckoutChargeController
 * @property {function(): Promise<void>} flush
 *   cancels delayed VAT recalculation and requests charges immediately
 * @property {function(): boolean} hasCurrentCharges
 *   checks whether current country and VAT inputs have fresh charge data
 * @property {function(): boolean} hasScheduledRequest
 *   checks whether a delayed VAT recalculation is pending
 * @property {function(): void} invalidate
 *   clears charge state and ignores older in-flight responses
 * @property {function(): Promise<void>} requestIfReady
 *   recalculates charges when all required inputs are present
 * @property {function(): void} schedule
 *   debounces charge recalculation while typing VAT ID
 * @property {function(): void} updateSubmitState
 *   enables submit only when current charge data is ready
 */

/**
 * Creates the checkout charge-calculation controller.
 *
 * @param {Object} options charge controller options
 * @param {PaygatePurchaseClient} options.purchaseClient paygate purchase client
 * @param {CheckoutViewController} options.view checkout view controller
 * @param {function(): string|null} options.getOrderId returns the current Paygate order ID
 * @param {function(): string} options.getBuyerCountryCode returns the selected billing country
 * @param {function(): string} options.getVatId returns the current VAT ID value
 * @param {function(string): void} options.onVatIdError renders the VAT ID API validation error
 * @param {function(Object|Error): void} options.logApiError logs request failures
 * @return {CheckoutChargeController} charge lifecycle helpers for the checkout page
 */
export function createChargeController({
    purchaseClient,
    view,
    getOrderId,
    getBuyerCountryCode,
    getVatId,
    onVatIdError,
    logApiError
}) {
    let chargeRequestId = 0;
    let chargesRequestTimer = null;
    let pendingChargesKey = '';
    let pendingChargesPromise = null;
    let chargesReadyKey = '';

    /**
     * Recalculates charges when order, country, and VAT ID are available.
     *
     * @return {Promise<void>} resolves when charges are updated, skipped, or handled as an error
     */
    async function requestIfReady() {
        const requestKey = getRequestKey();

        if (!requestKey) {
            invalidate();
            return;
        }

        if (requestKey === chargesReadyKey) {
            return Promise.resolve();
        }

        if (requestKey === pendingChargesKey && pendingChargesPromise) {
            return pendingChargesPromise;
        }

        const requestId = ++chargeRequestId;
        const [orderId, buyerCountryCode, vatId] = requestKey.split(':');
        const payload = {
            orderId,
            buyerCountryCode,
            vatId
        };

        pendingChargesKey = requestKey;
        chargesReadyKey = '';
        updateSubmitState();
        pendingChargesPromise = purchaseClient.calculateCharges(payload)
            .then(response => {
                if (requestId !== chargeRequestId) {
                    return;
                }

                chargesReadyKey = requestKey;
                view.updateCharges(response);
                updateSubmitState();
            })
            .catch(error => {
                const isCurrentRequest = requestId === chargeRequestId;
                const isVatError = isVatErrorResponse(error);

                if (!isVatError) {
                    view.showErrorModal();
                }

                if (!isCurrentRequest) {
                    logApiError(error);
                    return;
                }

                chargesReadyKey = '';
                updateSubmitState();

                if (isVatError) {
                    onVatIdError(error.body.reason);
                }

                logApiError(error);
            })
            .finally(() => {
                if (requestId === chargeRequestId) {
                    pendingChargesKey = '';
                    pendingChargesPromise = null;
                }
            });

        return pendingChargesPromise;
    }

    /**
     * Cancels delayed VAT recalculation and requests charges immediately.
     *
     * @return {Promise<void>} resolves when the immediate request flow finishes
     */
    function flush() {
        clearScheduledRequest();
        return requestIfReady();
    }

    /**
     * Debounces charge recalculation while the user types a VAT ID.
     */
    function schedule() {
        clearScheduledRequest();
        chargesRequestTimer = window.setTimeout(() => {
            chargesRequestTimer = null;
            requestIfReady();
        }, vatIdInputDelay);
    }

    /**
     * Clears charge state and ignores older responses.
     */
    function invalidate() {
        clearScheduledRequest();
        chargeRequestId += 1;
        pendingChargesKey = '';
        pendingChargesPromise = null;
        chargesReadyKey = '';
        updateSubmitState();
    }

    /**
     * Checks whether a delayed VAT request is currently scheduled.
     *
     * @return {boolean} true when a delayed request timer is active
     */
    function hasScheduledRequest() {
        return Boolean(chargesRequestTimer);
    }

    /**
     * Checks whether charges are calculated for the form's current country and VAT ID.
     *
     * @return {boolean} true when the latest charges match the current form state
     */
    function hasCurrentCharges() {
        const requestKey = getRequestKey();
        return Boolean(requestKey) && requestKey === chargesReadyKey;
    }

    /**
     * Enables checkout submission only when the current charge calculation is ready.
     */
    function updateSubmitState() {
        view.setSubmitDisabled(view.isFormHidden() || !hasCurrentCharges());
    }

    /**
     * Builds the cache key for the current charge calculation inputs.
     *
     * @return {string} joined order/country/VAT key, or empty string when calculation cannot run
     *   yet
     */
    function getRequestKey() {
        const orderId = getOrderId();
        const buyerCountryCode = getBuyerCountryCode();
        const vatId = getVatId();

        return orderId && buyerCountryCode && vatId
            ? [orderId, buyerCountryCode, vatId].join(':')
            : '';
    }

    /**
     * Clears the delayed VAT recalculation timer when one is active.
     */
    function clearScheduledRequest() {
        if (!chargesRequestTimer) {
            return;
        }

        window.clearTimeout(chargesRequestTimer);
        chargesRequestTimer = null;
    }

    /**
     * Checks whether a Paygate error should be rendered on the VAT ID field.
     *
     * @param {Object} error error object thrown by the Paygate client
     * @return {boolean} true when the error contains a VAT ID validation reason
     */
    function isVatErrorResponse(error) {
        return error.status === 422 &&
            error.body &&
            /^VAT_ID_/.test(error.body.reason || '');
    }

    return {
        flush,
        hasCurrentCharges,
        hasScheduledRequest,
        invalidate,
        requestIfReady,
        schedule,
        updateSubmitState
    };
}
