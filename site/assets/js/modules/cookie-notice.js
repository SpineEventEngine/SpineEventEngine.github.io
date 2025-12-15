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
 * This script contains helper functions that display a cookie notice
 * and manage cookies if the user clicked the consent button.
 *
 * Also, adds extra spaces to elements when a cookie notice
 * is shown so they don't overlap.
 */
$(function() {
    const cookieName = 'cookieConsent';
    const $cookieContainer = $('#cookie-notice');
    const $cookieConsentBtn = $('#cookie-consent-btn');
    const $copyright = $('footer .copyright');
    const copyrightPaddingBottom = 24;
    const cookieActiveClass = 'active';

    initCookieNotice();
    adjustLayout();

    $(window).on('resize', function() {
        addSpaceForCookies();
        adjustLayout();
    });

    /**
     * Shows a cookie notice in the user interface if the user has not yet consented
     * to the collection of cookies.
     */
    function initCookieNotice() {
        if (!Cookies.get(cookieName)) {
            $cookieContainer.addClass(cookieActiveClass);
            addSpaceForCookies();
        }
    }

    /**
     * Adds additional bottom space if the cookie notice is shown on the page.
     */
    function addSpaceForCookies() {
        const cookieContainerHeight = $cookieContainer.innerHeight();
        if ($cookieContainer.length && $cookieContainer.hasClass(cookieActiveClass)) {
            $copyright.css('padding-bottom', cookieContainerHeight + copyrightPaddingBottom);
        }
    }

    /**
     * On the consent button click hides the cookie notice, removes additional paddings,
     * and makes the corresponding entry inside `Cookies`.
     */
    $cookieConsentBtn.click(function() {
        $cookieContainer.removeClass(cookieActiveClass);
        Cookies.set(cookieName, 'Yes');
        setInitialElementPosition();
        adjustLayout();
    });

    /**
     * Sets the initial element position
     * as if there is no cookie notice element.
     */
    function setInitialElementPosition() {
        $copyright.css('padding-bottom', copyrightPaddingBottom);
    }

    /**
     * Adjusts the position of elements that depend on the cookie notification.
     */
    function adjustLayout() {
        const $goTopButton = $('#go-top-button');
        const goTopButtonOffset = 10;

        if ($cookieContainer.hasClass(cookieActiveClass)) {
            const cookieHeight = $cookieContainer.innerHeight();
            $goTopButton.css('bottom', cookieHeight + goTopButtonOffset);
        } else {
            $goTopButton.css('bottom', goTopButtonOffset);
        }
    }
});
