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
