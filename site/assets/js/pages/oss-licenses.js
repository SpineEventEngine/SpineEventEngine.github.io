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
 * Loads markdown content from the dependency report files
 * via Spine public repositories.
 *
 * The script requires both the `https://github.com/showdownjs/showdown`
 * Markdown converter and the `https://github.com/cure53/DOMPurify`
 * sanitizer to be loaded on the page before this script runs.
 *
 * See `layouts/_partials/oss-licenses/licenses.html` for usage.
 */
$(
    function() {
        const converter = new showdown.Converter({ sanitize: true });
        const loadedAttr = 'data-loaded';
        const repoAttr = 'data-repo';
        const repoName = 'data-repo-name';

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
                clickedElement.attr(loadedAttr, 'loading');
                const processLoadedContent = function (data) {
                    const html = converter.makeHtml(data);
                    mdDestinationEl.html(DOMPurify.sanitize(html));
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
                        mdDestinationEl.html('<p>Could not load dependency report. Click to retry.</p>');
                        clickedElement.attr(loadedAttr, 'false');
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
