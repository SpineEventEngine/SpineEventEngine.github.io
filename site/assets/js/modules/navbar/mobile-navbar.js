/*
 * Copyright 2026 CodeMatters, Lda.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

'use strict';

const $body = $('body');
const $navbarToggle = $('#nav-icon-menu');
const openedClass = 'open';
const navbarOpenedClass = 'navigation-opened';

/**
 * Toggles the mobile navbar.
 */
export function toggleMobileNavbar() {
    $navbarToggle.on('click', function () {
        toggleNavbar();
    });

    $(window).resize(function () {
        if (!isMobile()) hideNavbar();
    });
}

function toggleNavbar() {
    $navbarToggle.toggleClass(openedClass);
    $body.toggleClass(navbarOpenedClass);
}

function hideNavbar() {
    $navbarToggle.removeClass(openedClass);
    $body.removeClass(navbarOpenedClass);
}

/**
 * Checks whether the current window width matches the "mobile" layout.
 *
 * Uses the same breakpoint (800px) that is defined in the CSS
 * `assets/scss/modules/_navbar.scss`.
 *
 * @return {boolean}
 */
function isMobile() {
    const maxWidth = 800;
    return $(window).width() <= maxWidth;
}
