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

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const {buildChargeRequest} = await importSource(
    '../assets/js/pages/checkout/charge-request.js'
);
const {
    focusOpenCountrySearchField,
    populateCountrySelect
} = await importSource(
    '../assets/js/pages/checkout/countries.js'
);
const {
    checkoutNavigationMode,
    getCheckoutNavigationMode
} = await importSource(
    '../assets/js/pages/checkout/navigation.js'
);
const {isEuCountry} = await importSource(
    '../assets/js/pages/checkout/vat-countries.js'
);
const {normalizeIntlPhoneNumber} = await importSource(
    '../assets/js/modules/forms/phone-number.js'
);
const {createCheckoutFormController} = await importFormController();
const {createCheckoutView} = await importSource(
    '../assets/js/pages/checkout/view-controller.js'
);
const {createChargeController} = await importChargeController();

test('keep checkout libraries aligned with pinned npm distributions', () => {
    assert.deepEqual(
        readFile('../assets/libs/country-select/select2.js'),
        readFile('../node_modules/select2/dist/js/select2.min.js')
    );
    assert.deepEqual(
        readFile('../assets/scss/libs/country-select/_select2.scss'),
        readFile('../node_modules/select2/dist/css/select2.min.css')
    );
    assert.deepEqual(
        readFile('../assets/libs/intl-tel-input/intlTelInput.js'),
        readFile('../node_modules/intl-tel-input/build/js/intlTelInput.min.js')
    );
    assert.deepEqual(
        readFile('../assets/libs/intl-tel-input/utils.js'),
        readFile('../node_modules/intl-tel-input/build/js/utils.js')
    );

    const expectedPhoneCss = readText(
        '../node_modules/intl-tel-input/build/css/intlTelInput.min.css'
    ).replace(
        'url(../img/flags.png?1)',
        'url("../../images/flags/flags.png?1")'
    ).replace(
        'url(../img/flags@2x.png?1)',
        'url("../../images/flags/flags@2x.png?1")'
    );
    assert.equal(
        readText('../assets/scss/libs/intl-tel-input/_intl-tel-input.scss'),
        expectedPhoneCss
    );
    assert.deepEqual(
        readFile('../static/images/flags/flags.png'),
        readFile('../node_modules/intl-tel-input/build/img/flags.png')
    );
    assert.deepEqual(
        readFile('../static/images/flags/flags@2x.png'),
        readFile('../node_modules/intl-tel-input/build/img/flags@2x.png')
    );
});

test('calculate charges without requiring a VAT ID', () => {
    assert.deepEqual(
        buildChargeRequest('order-1', 'US', ''),
        {orderId: 'order-1', buyerCountryCode: 'US'}
    );
    assert.deepEqual(
        buildChargeRequest('order-1', 'EE', 'EE123456789'),
        {
            orderId: 'order-1',
            buyerCountryCode: 'EE',
            vatId: 'EE123456789'
        }
    );
    assert.equal(buildChargeRequest('', 'US', ''), null);
    assert.equal(buildChargeRequest('order-1', '', ''), null);
});

test('offer the complete ISO billing-country list', () => {
    const OriginalOption = globalThis.Option;
    globalThis.Option = class {
        constructor(text, value) {
            this.text = text;
            this.value = value;
        }
    };

    try {
        const select = {
            options: [{text: 'Select country', value: ''}],
            add(option) {
                this.options.push(option);
            }
        };

        populateCountrySelect(select);

        assert.ok(select.options.length > 240);
        for (const countryCode of ['AU', 'BR', 'CA', 'CN', 'EE', 'GB', 'JP', 'US', 'ZA']) {
            assert.ok(select.options.some(option => option.value === countryCode));
        }
    } finally {
        globalThis.Option = OriginalOption;
    }
});

test('focus the country search input when its dropdown opens', () => {
    let focused = false;
    let requestedSelector = '';
    const root = {
        querySelector(selector) {
            requestedSelector = selector;
            return {focus: () => focused = true};
        }
    };

    focusOpenCountrySearchField(root);

    assert.equal(
        requestedSelector,
        '.select2-container--open .select2-search__field'
    );
    assert.equal(focused, true);
});

test('restore checkout fields only for browser history navigation', () => {
    assert.equal(
        getCheckoutNavigationMode('back_forward'),
        checkoutNavigationMode.restore
    );
    assert.equal(
        getCheckoutNavigationMode('navigate', true),
        checkoutNavigationMode.restore
    );
    assert.equal(
        getCheckoutNavigationMode('reload'),
        checkoutNavigationMode.reset
    );
    assert.equal(
        getCheckoutNavigationMode('reload', true),
        checkoutNavigationMode.restore
    );
    assert.equal(
        getCheckoutNavigationMode('navigate'),
        checkoutNavigationMode.none
    );
});

test('show VAT ID only for EU billing countries', () => {
    assert.equal(isEuCountry('EE'), true);
    assert.equal(isEuCountry('DE'), true);
    assert.equal(isEuCountry('GB'), false);
    assert.equal(isEuCountry('US'), false);
});

test('build Paygate phone data from the shared international input', () => {
    assert.deepEqual(
        normalizeIntlPhoneNumber('555 0100', '372', '+372 555 0100'),
        {countryCode: 372, number: '5550100'}
    );
    assert.deepEqual(
        normalizeIntlPhoneNumber('(512) 555-0199', '1', ''),
        {countryCode: 1, number: '5125550199'}
    );
    assert.equal(normalizeIntlPhoneNumber('', '372', ''), null);
    assert.equal(normalizeIntlPhoneNumber('5550100', '', ''), null);
});

test('allow an optional phone number while validation utilities are loading', () => {
    const originalWindow = globalThis.window;
    let validityMessage = '';
    const errorElement = {textContent: ''};
    const fieldContainer = {
        classList: {toggle() {}},
        querySelector: () => errorElement
    };
    const phoneField = {
        closest: () => fieldContainer,
        setCustomValidity: message => validityMessage = message
    };
    const phoneInput = {isValidNumber: () => false};
    globalThis.window = {
        intlTelInputGlobals: {getInstance: () => phoneInput}
    };

    try {
        const controller = createCheckoutFormController({
            dom: {
                $phoneNumber: {
                    get: () => phoneField,
                    val: () => '151 23456789'
                }
            }
        });

        assert.equal(controller.validatePhoneNumber(), true);
        assert.equal(validityMessage, '');

        globalThis.window.intlTelInputUtils = {};
        assert.equal(controller.validatePhoneNumber(), false);
        assert.equal(validityMessage, 'Enter a valid phone number.');
    } finally {
        globalThis.window = originalWindow;
    }
});

test('apply billing country to a typed phone unless its country was chosen manually', () => {
    const originalWindow = globalThis.window;
    const selectedCountries = [];
    const phoneField = {};
    globalThis.window = {
        intlTelInputGlobals: {
            getInstance: () => ({
                setCountry: countryCode => selectedCountries.push(countryCode)
            })
        },
        setTimeout: callback => callback()
    };

    try {
        const controller = createCheckoutFormController({
            dom: {
                $country: {val: () => 'DE'},
                $phoneNumber: {get: () => phoneField, val: () => '151 23456789'}
            }
        });

        controller.applyPhoneCountryFromBillingCountry(false);
        controller.applyPhoneCountryFromBillingCountry(true);

        assert.deepEqual(selectedCountries, ['de']);
        assert.equal(controller.applyBillingCountryFromPhoneCountry, undefined);
    } finally {
        globalThis.window = originalWindow;
    }
});

test('clear an earlier VAT validation error after the input changes', () => {
    const classes = new Set();
    const errorElement = {textContent: ''};
    const fieldContainer = {
        classList: {
            toggle(className, enabled) {
                if (enabled) {
                    classes.add(className);
                } else {
                    classes.delete(className);
                }
            }
        },
        querySelector() {
            return errorElement;
        }
    };
    const vatField = {
        closest() {
            return fieldContainer;
        }
    };
    const controller = createCheckoutFormController({
        dom: {
            $country: {val: () => 'EE'},
            $vatId: {get: () => vatField}
        }
    });

    controller.showVatIdError('NOT_ACTIVE');
    assert.equal(classes.has('field-error'), true);
    assert.equal(errorElement.textContent, 'This VAT ID is not active.');

    controller.clearVatIdError();
    assert.equal(classes.has('field-error'), false);
    assert.equal(errorElement.textContent, '');
});

test('defer a VAT validation error until the field loses focus', () => {
    const classes = new Set();
    const errorElement = {textContent: ''};
    const fieldContainer = {
        classList: {
            toggle(className, enabled) {
                if (enabled) {
                    classes.add(className);
                } else {
                    classes.delete(className);
                }
            }
        },
        querySelector: () => errorElement
    };
    const ownerDocument = {activeElement: null};
    const vatField = {
        ownerDocument,
        closest: () => fieldContainer
    };
    const controller = createCheckoutFormController({
        dom: {
            $country: {val: () => 'EE'},
            $vatId: {get: () => vatField}
        }
    });

    ownerDocument.activeElement = vatField;
    controller.showVatIdError('NOT_ACTIVE');
    assert.equal(classes.has('field-error'), false);
    assert.equal(errorElement.textContent, '');

    ownerDocument.activeElement = null;
    controller.showPendingVatIdError();
    assert.equal(classes.has('field-error'), true);
    assert.equal(errorElement.textContent, 'This VAT ID is not active.');
});

test('clear a required-field error while the user edits the field', () => {
    const classes = new Set();
    const errorElement = {textContent: ''};
    const fieldContainer = {
        classList: {
            toggle(className, enabled) {
                if (enabled) {
                    classes.add(className);
                } else {
                    classes.delete(className);
                }
            }
        },
        querySelector: () => errorElement
    };
    const field = {
        disabled: false,
        required: true,
        type: 'text',
        value: '',
        closest: selector => selector === '[hidden]' ? null : fieldContainer
    };
    const controller = createCheckoutFormController({dom: {}});

    assert.equal(controller.validateField(field), false);
    assert.equal(classes.has('field-error'), true);

    controller.clearFieldError(field);
    assert.equal(classes.has('field-error'), false);
    assert.equal(errorElement.textContent, '');
});

test('ignore an obsolete charge failure after newer charges succeed', async () => {
    const requests = [];
    const updatedCharges = [];
    const loggedErrors = [];
    let countryCode = 'EE';
    let modalOpenCount = 0;
    const controller = createChargeController({
        purchaseClient: {
            calculateCharges(payload) {
                return new Promise((resolve, reject) => {
                    requests.push({payload, resolve, reject});
                });
            }
        },
        view: {
            isFormHidden: () => false,
            setSubmitDisabled() {},
            showErrorModal: () => modalOpenCount += 1,
            updateCharges: charges => updatedCharges.push(charges)
        },
        ensureOrderId: () => Promise.resolve('order-1'),
        getBuyerCountryCode: () => countryCode,
        getVatId: () => '',
        onFieldValidationStateChange() {},
        onVatIdError() {},
        logApiError: error => loggedErrors.push(error)
    });

    const firstRequest = controller.flush();
    await waitUntil(() => requests.length === 1);

    countryCode = 'DE';
    controller.invalidate();
    const secondRequest = controller.flush();
    await waitUntil(() => requests.length === 2);

    const currentCharges = {vatRate: 0.19};
    requests[1].resolve(currentCharges);
    await secondRequest;
    const obsoleteError = {status: 500, statusText: 'Unavailable'};
    requests[0].reject(obsoleteError);
    await firstRequest;

    assert.deepEqual(updatedCharges, [currentCharges]);
    assert.equal(modalOpenCount, 0);
    assert.deepEqual(loggedErrors, [obsoleteError]);
});

test('render a safe rounded VAT label and tolerate missing order money', () => {
    const dom = createSummaryDom();
    const view = createCheckoutView(dom);

    assert.doesNotThrow(() => view.fillOrderSummary({productTitle: 'Support'}));
    assert.equal(dom.$vatLabel.value, 'VAT');
    assert.equal(dom.$subtotalValue.value, '');
    assert.equal(dom.$vatValue.value, '0.00');
    assert.equal(dom.$totalValue.value, '');

    const money = {value: 10, currency: {symbol: '€'}};
    view.updateCharges({
        vatRate: 0.07,
        netAmount: money,
        vatAmount: money,
        totalAmount: money
    });
    assert.equal(dom.$vatLabel.value, 'VAT (7%)');

    view.updateCharges({
        netAmount: money,
        vatAmount: money,
        totalAmount: money
    });
    assert.equal(dom.$vatLabel.value, 'VAT');
});

async function importSource(relativePath) {
    const source = fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');
    return import(`data:text/javascript,${encodeURIComponent(source)}`);
}

function readFile(relativePath) {
    return fs.readFileSync(new URL(relativePath, import.meta.url));
}

function readText(relativePath) {
    return fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

async function importChargeController() {
    const delayedRequestSource = readText(
        '../assets/js/pages/checkout/delayed-request-controller.js'
    ).replace('export function createDelayedRequestController',
        'function createDelayedRequestController');
    const chargeControllerSource = readText(
        '../assets/js/pages/checkout/charge-controller.js'
    ).replace(/^import .*;\n/gm, '');
    const dependencies = `
        const fieldValidationState = {idle: 'idle', loading: 'loading', success: 'success'};
        const buildChargeRequest = (orderId, buyerCountryCode, vatId) => {
            if (!orderId || !buyerCountryCode) return null;
            return vatId
                ? {orderId, buyerCountryCode, vatId}
                : {orderId, buyerCountryCode};
        };
    `;

    const source = [delayedRequestSource, dependencies, chargeControllerSource].join('\n');
    return import(`data:text/javascript,${encodeURIComponent(source)}`);
}

function createSummaryDom() {
    const element = () => ({
        hidden: false,
        value: '',
        prop(name, value) {
            if (value === undefined) {
                return this[name];
            }
            this[name] = value;
            return this;
        },
        text(value) {
            this.value = value;
            return this;
        }
    });

    return {
        $productTitle: element(),
        $productDescription: element(),
        $subtotalValue: element(),
        $vatLabel: element(),
        $vatValue: element(),
        $totalValue: element()
    };
}

async function waitUntil(predicate) {
    for (let attempt = 0; attempt < 20; attempt += 1) {
        if (predicate()) {
            return;
        }
        await Promise.resolve();
    }
    assert.fail('Timed out waiting for asynchronous checkout state.');
}

async function importFormController() {
    const source = fs.readFileSync(
        new URL('../assets/js/pages/checkout/form-controller.js', import.meta.url),
        'utf8'
    ).replace(
        "import {isEuCountry} from 'js/pages/checkout/vat-countries';",
        "const isEuCountry = countryCode => countryCode === 'EE';"
    ).replace(
        "import {normalizeIntlPhoneNumber} from 'js/modules/forms/phone-number';",
        'const normalizeIntlPhoneNumber = () => null;'
    );

    return import(`data:text/javascript,${encodeURIComponent(source)}`);
}
