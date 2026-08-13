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

const countryCodes = [
    'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI',
    'BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN',
    'CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK',
    'FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM',
    'HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN',
    'KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK',
    'ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP',
    'NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW',
    'SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF',
    'TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI',
    'VN VU WF WS YE YT ZA ZM ZW'
].join(' ').split(' ');

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
