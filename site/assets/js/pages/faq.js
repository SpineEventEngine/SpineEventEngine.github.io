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

import {copyToClipboard} from "js/theme/copy-to-clipboard";

/**
 * Opens the collapsed FAQ item on hash change and handles the anchor icon click.
 */
$(function () {
    const isFaqPage = $('body').is('.faq');
    if (!isFaqPage) return;

    const $anchorIcon = $('.anchor-link-icon');
    const headerHeight = $('#header').innerHeight();

    openCollapseByHash();

    $(window).on('hashchange', function(e) {
        e.stopPropagation();
        e.preventDefault();
        openCollapseByHash();
    });

    /**
     * Opens the collapsible item using the Bootstrap method.
     */
    function openCollapseByHash() {
        const hash = window.location.hash;
        const $target = $(hash);

        if ($target.length && $target.hasClass('collapse')) {
            $target.collapse('show');
        }
    }

    /**
     * Copies the anchor to clipboard on the anchor icon click.
     */
    $anchorIcon.on('click', function() {
        const $icon = $(this);
        const $panel = $icon.parent('.faq-heading');
        const panelPosition = $panel.offset().top;
        const scrollPosition = panelPosition - headerHeight;
        const anchor = $icon.attr('data-href');

        scrollTop(scrollPosition);
        window.location.hash = anchor;
        copyToClipboard(window.location.href);
    });

    /**
     * Scrolls the body to the provided position.
     *
     * @param {number} scrollPosition
     */
    function scrollTop(scrollPosition) {
        $('html, body').animate({
            scrollTop: scrollPosition
        }, 300);
    }
});
