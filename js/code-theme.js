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

/**
 * This script contains helper functions for switching code theme colors
 * and displaying the theme switcher icon near each code block.
 *
 * The selected theme will be stored in cookies so that the user can
 * navigate between pages.
 *
 * The CSS styles are located in `_sass/base/_code-theme-switcher.scss`.
 */

'use strict';

$(
    function() {
        const $switcherContainer = $('div.highlight');
        const $htmlSwitcherContainer = $('figure.highlight');
        const switcherClass = 'code-theme-switcher';
        const colorDark = 'dark';
        const colorLight = 'light';
        const defaultColor = colorDark;
        const cookieColorName = 'themeColor';
        const codeStylePath = '/libs/rouge/skins/';
        const darkStylesUrl = codeStylePath + 'dark-theme.css';
        const lightStylesUrl = codeStylePath + 'light-theme.css';

        prepareContainer();
        initSwitcherTooltip();
        changeCodeColorTheme();

        /**
         * Creates the switcher icon inside the markdown or HTML code container
         * if they exist on the page.
         */
        function prepareContainer() {
            if ($switcherContainer.length) {
                createSwitcherIcon($switcherContainer);
            }

            if ($htmlSwitcherContainer.length) {
                createSwitcherIcon($htmlSwitcherContainer);
            }
        }

        /**
         * Creates the switcher icon in the DOM inside the provided `container`.
         *
         * @param container a container for the icon.
         */
        function createSwitcherIcon(container) {
            container.each(function() {
                const icon = $(`<a class="${switcherClass}" 
                                   data-toggle="tooltip"
                                   data-placement="top"
                                   title="Change code theme"></a>`)
                $(this).append(icon);
            })
        }

        /**
         * Inits the Bootstrap tooltip for the dynamically created icon.
         */
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
         * Sets the default `dark` color to the cookie.
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
            updateSwitcher(colorDark);
        }

        /**
         * Sets light theme color.
         */
        function setLightTheme() {
            loadCodeStyles(lightStylesUrl);
            $pre.css('opacity', '1');
            updateSwitcher(colorLight);
        }

        /**
         * Loads theme style sheets to highlight the code.
         *
         * <p>`<style>` tag with the `#code-highlight-styles` ID will be created in the
         * `head` of the document. If the tag is already exist it will be updated depending
         * on the selected theme color.
         *
         * <p>Files with themes are located in the `/libs/rouge/skins/` folder.
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
         * Updates switcher depending on the `color` value.
         *
         * <p>Adds a selected color class to the switcher and sets a new value to the `cookie`.
         *
         * @param {string} color selected color value
         */
        function updateSwitcher(color) {
            const $switcher = $('.' + switcherClass);
            $switcher.attr('class', switcherClass);
            $switcher.addClass(color);
            Cookies.set(cookieColorName, color);
        }
    }
);
