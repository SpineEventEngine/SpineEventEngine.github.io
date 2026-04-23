'use strict';

/**
 * Delay before sending the 'calculate-charges' request when VAT ID was changed.
 *
 * @type {number}
 */
const vatIdInputDelay = 1000;

/**
 * Creates the checkout charge-calculation controller.
 *
 * @param {Object} options - Charge controller options.
 * @param {Object} options.purchaseClient - Paygate purchase client.
 * @param {Object} options.view - Checkout view controller.
 * @param {function(): string|null} options.getOrderId - Returns the current Paygate order ID.
 * @param {function(): string} options.getBuyerCountryCode - Returns the selected billing country.
 * @param {function(): string} options.getVatId - Returns the current VAT ID value.
 * @param {function(string): void} options.onVatIdError - Renders the VAT ID API validation error.
 * @param {function(Object|Error): void} options.logApiError - Logs request failures.
 * @return {Object} Charge lifecycle helpers for the checkout page.
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
     * @return {Promise<void>} Resolves when charges are updated, skipped, or handled as an error.
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
     * @return {Promise<void>} Resolves when the immediate request flow finishes.
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
     * @return {boolean} True when a delayed request timer is active.
     */
    function hasScheduledRequest() {
        return Boolean(chargesRequestTimer);
    }

    /**
     * Checks whether charges are calculated for the form's current country and VAT ID.
     *
     * @return {boolean} True when the latest charges match the current form state.
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
     * @return {string} Joined order/country/VAT key, or empty string when calculation cannot run yet.
     */
    function getRequestKey() {
        const orderId = getOrderId();
        const buyerCountryCode = getBuyerCountryCode();
        const vatId = getVatId();

        return orderId && buyerCountryCode && vatId ? [orderId, buyerCountryCode, vatId].join(':') : '';
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
     * @param {Object} error - Error object thrown by the Paygate client.
     * @return {boolean} True when the error contains a VAT ID validation reason.
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
