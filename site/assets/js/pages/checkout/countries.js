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

'use strict';

const countryCodes = `AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`
    .split(' ');

export const checkoutNavigationMode = Object.freeze({
    none: 'none',
    reset: 'reset',
    restore: 'restore'
});

/** Chooses whether checkout state should be restored or reset for a navigation. */
export function getCheckoutNavigationMode(navigationType, pagePersisted = false) {
    if (navigationType === 'reload') {
        return checkoutNavigationMode.reset;
    }
    if (pagePersisted || navigationType === 'back_forward') {
        return checkoutNavigationMode.restore;
    }
    return checkoutNavigationMode.none;
}

/**
 * Populates a billing-country select with ISO 3166-1 countries.
 *
 * Region names come from the browser locale API. The country code remains a
 * usable fallback in browsers that do not implement `Intl.DisplayNames`.
 *
 * @param {HTMLSelectElement} select country select to populate
 */
export function populateCountrySelect(select) {
    if (!select || select.options.length > 1) {
        return;
    }

    const displayNames = typeof Intl.DisplayNames === 'function'
        ? new Intl.DisplayNames(['en'], {type: 'region'})
        : null;
    const countries = countryCodes.map(code => ({
        code,
        name: displayNames ? displayNames.of(code) : code
    })).sort((first, second) => first.name.localeCompare(second.name));

    countries.forEach(country => {
        select.add(new Option(country.name, country.code));
    });
}

/**
 * Initializes the shared Select2 country control with flag sprites.
 *
 * @param {HTMLSelectElement} select country select to initialize
 */
export function initializeCountrySelector(select) {
    populateCountrySelect(select);

    if (!select || !window.jQuery || typeof window.jQuery.fn.select2 !== 'function') {
        return;
    }

    const $select = window.jQuery(select);
    $select.select2({
        placeholder: select.dataset.placeholder || '',
        templateResult: formatCountry,
        templateSelection: formatCountry,
        width: '100%'
    });
    $select.on('select2:open', () => {
        focusOpenCountrySearchField();
    });
}

/**
 * Focuses the search input belonging to the currently open country dropdown.
 *
 * @param {Document|HTMLElement} [root=document] root used to find the open dropdown
 */
export function focusOpenCountrySearchField(root = document) {
    const searchField = root.querySelector(
        '.select2-container--open .select2-search__field'
    );

    if (searchField) {
        searchField.focus();
    }
}

/**
 * Renders one Select2 country option using the shared flag sprite.
 *
 * @param {Object} country Select2 option data
 * @return {string|JQuery<HTMLElement>} rendered country option
 */
function formatCountry(country) {
    if (!country.id) {
        return country.text;
    }

    const normalizedCode = String(country.id).toLowerCase();
    const $flag = window.jQuery('<span></span>')
        .addClass(`iti__flag iti__${normalizedCode}`)
        .attr('aria-hidden', 'true');
    const $label = window.jQuery('<span></span>')
        .addClass('country-selector__text')
        .text(country.text);

    return window.jQuery('<span></span>')
        .addClass('country-selector__option')
        .append($flag)
        .append($label);
}
