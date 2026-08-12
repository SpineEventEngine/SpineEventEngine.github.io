/*
 * Copyright 2026, TeamDev. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const {buildChargeRequest} = await importSource(
    '../assets/js/pages/checkout/charge-request.js'
);
const {populateCountrySelect} = await importSource(
    '../assets/js/pages/checkout/countries.js'
);
const {isEuCountry} = await importSource(
    '../assets/js/pages/checkout/phone-codes.js'
);

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

test('show VAT ID only for EU billing countries', () => {
    assert.equal(isEuCountry('EE'), true);
    assert.equal(isEuCountry('DE'), true);
    assert.equal(isEuCountry('GB'), false);
    assert.equal(isEuCountry('US'), false);
});

async function importSource(relativePath) {
    const source = fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');
    return import(`data:text/javascript,${encodeURIComponent(source)}`);
}
