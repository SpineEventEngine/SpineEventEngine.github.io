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

/**
 * Makes the navbar sticky when the user scrolls the page.
 */
export function initStickyNavbar() {
    const $navbar = $('#header');
    const isFixedNavbar = $navbar.hasClass('fixed-navbar');

    if (!$navbar && isFixedNavbar) return;

    const navbarHeight = $navbar.innerHeight();
    const pinnedNavbarPosition = getPinnedNavbarPosition();

    // When scroll position not at the top of the page.
    const notTopClass = 'not-top';

    // When the navbar is pinned.
    const pinnedClass = 'pinned';

    // When the navbar is unpinned.
    const unpinnedClass = 'unpinned';

    configureNavbarClasses();

    $(window).on('scroll resize', function() {
        configureNavbarClasses();
    });

    /**
     * Configures the navbar classes depending on the scroll position.
     *
     * <li>If the scroll is at the top, no additional classes are added.</li>
     * <li>If the scroll is at the `pinnedNavbarPosition`, the navbar
     * will be pinned.</li>
     * <li>If it is not at the top and before the `pinnedNavbarPosition`,
     * the navbar will be unpinned.</li>
     *
     * <p>Classes are managed in the `assets/scss/modules/_navbar.scss` file.
     */
    function configureNavbarClasses() {
        const scrollPosition = window.scrollY;
        const isPinned = scrollPosition > pinnedNavbarPosition;
        const isAtTop = scrollPosition < navbarHeight;
        
        if (isAtTop) {
            resetNavbar();
        } else if (isPinned) {
            pinNavbar();
        } else {
            unpinNavbar();
        }
    }

    /**
     * Calculates the scroll position at which the navbar becomes pinned (sticky).
     */
    function getPinnedNavbarPosition() {
        const heroHeight = $('#hero').innerHeight();
        const baseOffset = heroHeight || navbarHeight || 64;

        return baseOffset;
    }

    /**
     * Adds corresponding classes that pins the navbar.
     */
    function pinNavbar() {
        $navbar.addClass(notTopClass);
        $navbar.addClass(pinnedClass);
        $navbar.removeClass(unpinnedClass);
    }

    /**
     * Adds corresponding classes that unpins the navbar.
     */
    function unpinNavbar() {
        $navbar.removeClass(pinnedClass);
        $navbar.addClass(unpinnedClass);
    }

    /**
     * Resets navbar classes to the initial state.
     */
    function resetNavbar() {
        $navbar.removeClass(notTopClass);
        $navbar.removeClass(unpinnedClass);
    }
}
