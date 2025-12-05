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
 * Loads markdown content from the dependency report files
 * via Spine public repositories.
 *
 * The script requires the `https://github.com/showdownjs/showdown`
 * library to be loaded on the page.
 *
 * See `layouts/_partials/oss-licenses/licenses.html` for usage.
 */
$(
    function() {
        const converter = new showdown.Converter();
        const loadedAttr = 'loaded';
        const repoAttr = 'repo';
        const repoName = 'repo-name';

        // Spine repositories are migrated being migrated to listing their deps in this file.
        const reportFilePath = '/master/dependencies.md';

        // Previously used report file path, as a fallback for non-migrated repos.
        const legacyFilePath = '/master/license-report.md';

        /**
         * Loads the dependency report file from the repository.
         *
         * <p>There may be one of two report files present in the repo:
         * `license-report.md` or `dependencies.md`.
         * The latter is a newer version of the report, so it is loaded
         * as a priority. In case it is missing, `license-report.md` is loaded, as a fallback.
         * Eventually, all Spine repositories will migrate to having `dependencies.md`.
         *
         * <p>The report sections describing the terms of use for dual-licensed dependencies,
         * and another one with the credits paid to the author of Gradle plugin
         * we use for reporting, are removed from DOM, as they are now moved
         * to the static part of the page (see `/oss-licenses.index.html`).
         *
         * <p>Executes by clicking on the corresponding link. The destination `div` element
         * should have the `id` like `md-destination-REPO_NAME`.
         */
        $('.collapsible-panel-title').click(function () {
            const clickedElement = $(this);
            const clickedElRepoName = clickedElement.attr(repoName);
            const mdDestinationEl = $('#md-destination-' + clickedElRepoName);
            const loaded = clickedElement.attr(loadedAttr);

            if (loaded === 'false') {
                const repositoryUrl = clickedElement.attr(repoAttr);
                let processLoadedContent = function (data) {
                    const html = converter.makeHtml(data);
                    mdDestinationEl.html(html);
                    clickedElement.attr(loadedAttr, 'true');
                    makeCollapsibleTitle(mdDestinationEl, clickedElRepoName);
                };

                let reportUrl = repositoryUrl + reportFilePath;
                let legacyReportUrl = repositoryUrl + legacyFilePath;
                
                $.get(reportUrl, processLoadedContent)
                    .fail(function () {
                        $.get(legacyReportUrl, processLoadedContent)
                    });
            }
        });

        /**
         * Makes the report content collapsible.
         *
         * @param mdDestinationEl `div` with the markdown content
         * @param clickedElRepoName repository name from the link attribute
         */
        function makeCollapsibleTitle(mdDestinationEl, clickedElRepoName) {
            const h1Elements = mdDestinationEl.find('h1');
            const h2Elements = mdDestinationEl.find('h2');
            const linkElements = mdDestinationEl.find('a');

            h1Elements.addClass('dependencies-title');

            /**
             * Removes `Dependencies of` words from the title.
             */
            h1Elements.each(function() {
                const text = $(this).text();
                $(this).text(text.replace('Dependencies of', ''));
            });

            /**
             * Removes `dependencies:` from the titles inside the Spine Web repository.
             */
            h2Elements.each(function () {
               const text = $(this).text();
                $(this).text(text.replace('dependencies:', ''));
            });

            /**
             * Makes all Markdown links external.
             */
            linkElements.addClass('external');
            linkElements.attr('target', '_blank');

            /**
             * Adds required classes and attributes to make titles and content collapsible.
             */
            h2Elements.each(function(index, element) {
                // `-md` makes the destination ID different from the collapsible title ID
                const titleID =  clickedElRepoName + '-' + this.id + '-md';
                const collapsibleContent = $(element).next('ol');
                const reportInfoContent = collapsibleContent.next('p');
                const whenGeneratedContent = reportInfoContent.next('p');

                $(element).addClass('collapse-link collapsed');
                $(element).attr('href', '#' + titleID);
                $(element).attr('data-bs-toggle', 'collapse');

                collapsibleContent.addClass('dependencies-container collapse');
                collapsibleContent.attr('id', titleID);

                reportInfoContent.remove();
                whenGeneratedContent.remove();
            });
        }
    }
);
