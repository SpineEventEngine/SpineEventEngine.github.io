/*
 * Copyright 2025, TeamDev. All rights reserved.
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
