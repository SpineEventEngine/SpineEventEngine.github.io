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
        const baseOffset = heroHeight || navbarHeight || 68;

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
