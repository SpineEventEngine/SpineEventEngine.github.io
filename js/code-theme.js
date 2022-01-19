/*
 * Copyright 2022, TeamDev. All rights reserved.
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

'use strict'

$(
    function() {
        const $codeContainer = $('pre');
        const switcherClass = 'code-theme-switcher';
        const colorDark = 'dark';
        const colorLight = 'light';
        const defaultColor = colorDark;
        const cookieColorName = 'themeColor';
        const codeStylePath = '/libs/rouge/skins/';
        const darkStylesUrl = codeStylePath + 'dark-theme.css';
        const lightStylesUrl = codeStylePath + 'light-theme.css';

        createSwitcherIcon();
        initSwitcherTooltip();
        changeCodeColorTheme();

        function createSwitcherIcon() {
            $codeContainer.each(function() {
                const icon = $(`<a class="${switcherClass}" 
                                   data-toggle="tooltip"
                                   data-placement="top"
                                   title="Change code theme"></a>`)
                $(this).append(icon);
            })
        }

        function initSwitcherTooltip() {
            $('body').tooltip({
                selector: `.${switcherClass}`,
                placement: 'top',
                delay: { "show": 500, "hide": 100 },
            });
        }

        /**
         * Changes code color theme by clicking on the `color-selector` icons.
         *
         * <p>On page load, the color will be set from the cookie value. If the cookie value is `null`
         * will be set default cookie value.
         */
        function changeCodeColorTheme() {
            const cookieValue = Cookies.get(cookieColorName);

            if (cookieValue == null) {
                setDefaultCookieValue();
            } else {
                colorDark === cookieValue && setDarkTheme();
                colorLight === cookieValue && setLightTheme();
            }

            $('.' + switcherClass).click(function() {
                if ($(this).hasClass(colorDark)) {
                    setLightTheme();
                } else {
                    setDarkTheme();
                }
            });
        }

        /**
         * Sets default cookie value for the `code` color as `dark`.
         */
        function setDefaultCookieValue() {
            Cookies.set(cookieColorName, defaultColor);
            setDarkTheme();
        }

        /**
         * Sets dark theme color.
         */
        function setDarkTheme() {
            loadCodeStyles(darkStylesUrl);
            $pre.css('opacity', '1');
            makeSwitcherActive(colorDark);
        }

        /**
         * Sets light theme color.
         */
        function setLightTheme() {
            loadCodeStyles(lightStylesUrl);
            $pre.css('opacity', '1');
            makeSwitcherActive(colorLight);
        }

        /**
         * Adds a selected color class to the switcher and sets the value to the `cookie`.
         *
         * @param {string} color selected color value
         */
        function makeSwitcherActive(color) {
            const $switcher = $('.' + switcherClass);
            $switcher.attr('class', switcherClass);
            $switcher.addClass(color);
            Cookies.set(cookieColorName, color);
        }
    }
);
