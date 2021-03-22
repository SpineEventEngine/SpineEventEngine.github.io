/*
 * Copyright 2021, TeamDev. All rights reserved.
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
 * This script contains helper functions for switching between Java/Kotlin source code examples.
 *
 * The selected language will be saved in cookies so that the user can navigate between pages.
 *
 * To show tabs use the structure below.
 * Add corresponding `.java`, `.kotlin`, or any other language class for `div`s with content.
 * If no language is provided, the content will not be displayed.
 * ```
 * <div class="code-tabs">
 *     <div class="code-tab-content java">
 *          Any Java content here
 *     </div>
 *     <div class="code-tab-content kotlin">
 *          Any Kotlin content here
 *     </div>
 * </div>
 * ```
 *
 * In markdown, all tags should be left-aligned. This way, the blocks of code
 * will not be broken:
 * ```
 * <div class="code-tabs">
 * <div class="code-tab-content java">
 * Any Java content here
 * </div>
 * <div class="code-tab-content kotlin">
 * Any Kotlin content here
 * </div>
 * </div>
 * ```
 *
 * If you don't need to display the tabs, but only need to show a specific paragraph of text
 * or change the title depending on the language, just use this:
 * ```
 * <div class="code-tab-content java">
 * # Getting started with Spine in Java
 * </div>
 * <div class="code-tab-content kotlin">
 * # Getting started with Spine in Kotlin
 * </div>
 * ```
 *
 * To change only some of the words in a sentence, use the `<span>` tag with the `.inline` class:
 * ```
 * A minimal client-server application in
 * <span class="code-tab-content inline java">Java</span>
 * <span class="code-tab-content inline kotlin">Kotlin</span>
 * which handles one command to print some text...
 * ```
 */

'use strict';

$(
    function() {
        const cookieCodeLang = 'codeLang';
        const $codeTabs = $('.code-tabs');
        const $codeTabContent = $('.code-tab-content');

        addTabSwitcher();
        initCodeLangSwitcher();

        /**
         * Adds a tab switcher to the DOM.
         */
        function addTabSwitcher() {
            $codeTabs.each(function() {
                const tabBlock = $(this);
                createTab(tabBlock, createTabContainer(tabBlock));
            });
        }

        /**
         * Creates a container for tabs.
         *
         * @param tabBlock a block that contains tabs.
         * @return {jQuery|HTMLElement} tabContainer a container for tabs.
         */
        function createTabContainer(tabBlock) {
            const tabContainer = $('<div class="tabs"></div>');
            tabBlock.prepend(tabContainer);
            return tabContainer;
        }

        /**
         * Creates a tab inside the container for each `code-tab-content` element.
         *
         * @param tabBlock a block that contains tabs.
         * @param tabContainer a container for tabs.
         */
        function createTab(tabBlock, tabContainer) {
            const tabContent = tabBlock.find($codeTabContent);
            tabContent.each(function () {
                const tabName = $(this).attr('class').split(' ')[1];
                if (typeof tabName !== 'undefined') {
                    const item = $(`<div class="tab ${tabName}">${tabName}</div>`);
                    tabContainer.append(item);
                }
            });
        }

        /**
         * Inits a code language switcher.
         *
         * By default, sets the primary code language to the `cookie`.
         * On a tab click switches between code languages.
         */
        function initCodeLangSwitcher() {
            const primaryLang = 'java';
            const cookieValue = Cookies.get(cookieCodeLang);

            if (cookieValue == null) {
                setCodeLang(primaryLang);
            } else {
                setCodeLang(cookieValue);
            }

            $('.tab').click(function() {
                const lang = $(this).attr('class').split(' ')[1];
                if (typeof lang !== 'undefined') {
                    setCodeLang(lang);
                }
            });
        }

        /**
         * Sets the chosen code language to the `cookie` and adds corresponding
         * CSS classes to the selected tab and content element.
         *
         * The CSS file is located at `_sass/modules/_code-tabs.scss`.
         *
         * @param codeLang a selected code language.
         */
        function setCodeLang(codeLang) {
            Cookies.set(cookieCodeLang, codeLang);
            $('.tab').removeClass('selected');
            $('.tab.' + codeLang).addClass('selected');
            $codeTabContent.removeClass('show');
            $('.code-tab-content.' + codeLang).addClass('show');
        }
    }
);
