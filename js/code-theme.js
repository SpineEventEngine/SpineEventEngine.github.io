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
        const $codeContainer = $('div.highlight');
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
                container: 'body'
            });
        }

        /**
         * Changes code color theme by clicking on the `code-theme-switcher` icon.
         *
         * <p>On page load, the color will be set based on the cookie value.
         * If the cookie value is `null`, the default color will be set.
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
         * Sets the default `dart` color to the cookie.
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
         * Loads theme style sheets to highlight the code.
         *
         * <p>`<style>` tag with the `#code-highlight-styles` ID will be created in the
         * `head` of the document. If the tag is already exist it will be updated depending
         * on the selected theme color.
         *
         * <p>Style files are located in the `/libs/rouge/skins/` folder.
         *
         * @param {string} stylesHref `href` that leads to the `css` file
         */
        function loadCodeStyles(stylesHref) {
            const $codeStyles = $('#code-highlight-styles');

            if ($codeStyles.length) {
                $codeStyles.attr('href', stylesHref);
            } else {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.id = 'code-highlight-styles';
                link.type = 'text/css';
                link.href = stylesHref;
                head.appendChild(link);
            }
        }

        /**
         * Adds a selected color class to the switcher and sets a new value to the `cookie`.
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
