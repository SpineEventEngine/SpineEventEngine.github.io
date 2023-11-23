/**
 * This is a JavaScript file which loads `license-report` md-files from the external repositories.
 *
 * Please see `/oss-licenses/index.html` for usage.
 */
'use strict';

$(
    function() {
        const converter = new showdown.Converter();
        const loadedAttr = 'loaded';
        const repoAttr = 'repo';
        const repoName = 'repo-name';

        /**
         * Loads `license-report` file from the repository.
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
                $.get(
                    repositoryUrl + '/master/license-report.md',
                    function (data) {
                        const html = converter.makeHtml(data);
                        mdDestinationEl.html(html);
                        clickedElement.attr(loadedAttr, 'true');
                        makeCollapsibleTitle(mdDestinationEl, clickedElRepoName);
                    }
                );
            }
        });

        /**
         * Makes a `license-report` content collapsible.
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
                $(element).attr('data-toggle', 'collapse');

                collapsibleContent.addClass('dependencies-container collapse');
                collapsibleContent.attr('id', titleID);

                reportInfoContent.remove();
                whenGeneratedContent.remove();
            });
        }
    }
);
