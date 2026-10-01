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
 * Scrolls the content to the top of the page on the “Go to top” button click.
 *
 * <p>The button will be shown if the content will be too long.
 */
$(function () {
    const $goTopButton = $('#go-top-button');
    if (!$goTopButton || !$goTopButton.length) return;

    /**
     * Shows the button when the user scrolls down more than 300 pixels.
     */
    $(window).on('scroll', function() {
        if ($(this).scrollTop() > 300) {
            $goTopButton.fadeIn();
        } else {
            $goTopButton.fadeOut();
        }
    });

    /**
     * Scrolls the content to top with the animation effect on the button click.
     */
    $goTopButton.on('click', function() {
        $('html, body').animate({
            scrollTop: 0
        }, 300);
        return false;
    });
});
