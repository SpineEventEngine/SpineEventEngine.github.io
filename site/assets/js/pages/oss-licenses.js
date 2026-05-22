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
        const converter = new showdown.Converter({ sanitize: true });
        const loadedAttr = 'loaded';
        const repoAttr = 'repo';
        const repoName = 'repo-name';

        // Spine repositories are being migrated to keeping their dependency reports under `docs/dependencies/`.
        const reportFilePath = '/master/docs/dependencies/dependencies.md';

        // Previous location of the report, kept as a fallback for repos still in migration.
        const rootReportFilePath = '/master/dependencies.md';

        // The oldest report file name, used by non-migrated repos.
        const legacyFilePath = '/master/license-report.md';

        /**
         * Loads the dependency report file from the repository.
         *
         * <p>There may be one of three report files present in the repo, tried in this order:
         * `docs/dependencies/dependencies.md` (new location), `dependencies.md` at the repo root
         * (previous location), and `license-report.md` at the repo root (oldest).
         * Eventually, all Spine repositories will migrate to the new location.
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
                const processLoadedContent = function (data) {
                    const html = converter.makeHtml(data);
                    mdDestinationEl.html(html);
                    clickedElement.attr(loadedAttr, 'true');
                    makeCollapsibleTitle(mdDestinationEl, clickedElRepoName);
                };

                const candidateUrls = [
                    repositoryUrl + reportFilePath,
                    repositoryUrl + rootReportFilePath,
                    repositoryUrl + legacyFilePath
                ];

                const tryNext = function (index) {
                    if (index >= candidateUrls.length) {
                        mdDestinationEl.html('<p>Could not load dependency report.</p>');
                        // Mark as resolved to avoid re-firing all requests on the next click.
                        clickedElement.attr(loadedAttr, 'error');
                        return;
                    }
                    $.get(candidateUrls[index], processLoadedContent)
                        .fail(function () { tryNext(index + 1); });
                };
                tryNext(0);
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
            linkElements.attr('rel', 'noopener noreferrer');
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
