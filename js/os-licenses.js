/**
 * This is a JavaScript file which loads `license-report` md-files from the external repositories.
 *
 * Please see `/os-licenses/index.html` for usage.
 */

$(
    function() {
        var converter = new showdown.Converter();
        const loadedAttr = "loaded";
        const repoAttr = "repo";

        /**
         * Loads `license-report` file from the `SpineEventEngine/base` repository.
         *
         * <p>Executes by clicking on the corresponding link.
         */
        $("#load-md-btn-base").click(function () {
            var clickedElement = $(this);
            var mdDestinationID = $("#md-destination-base");
            var loaded = clickedElement.attr(loadedAttr);

            if (loaded === "false") {
                var repositoryUrl = clickedElement.attr(repoAttr);
                $.get(
                    repositoryUrl + "/master/license-report.md",
                    function (data) {
                        var html = converter.makeHtml(data);
                        mdDestinationID.html(html);
                        clickedElement.attr(loadedAttr, "true");
                        makeCollapsibleTitle(mdDestinationID);
                    }
                );
            }
        });

        /**
         * Makes a `license-report` content collapsible.
         *
         * @param mdDestinationID id of the `div` with a markdown content
         */
        function makeCollapsibleTitle(mdDestinationID) {
            var h1Elements = mdDestinationID.find("h1");
            var h2Elements = mdDestinationID.find("h2");
            var linkElements = mdDestinationID.find("a");

            h1Elements.addClass("dependencies-title");

            /**
             * Removes `Dependencies of` words from the title.
             */
            h1Elements.each(function() {
                var text = $(this).text();
                $(this).text(text.replace('Dependencies of', ''));
            });

            /**
             * Makes all markdown links external.
             */
            linkElements.addClass("external");
            linkElements.attr("target", "_blank");

            /**
             * Adds required classes and attributes to make titles and content collapsible.
             */
            h2Elements.each(function(index, element) {
                const titleID = this.id + "_1";
                const collapsibleContent = $(element).next("ol");
                const reportInfoContent = collapsibleContent.next("p");

                $(element).addClass("collapse-link collapsed");
                $(element).attr("href", "#" + titleID);
                $(element).attr("data-toggle", "collapse");

                collapsibleContent.addClass("dependencies-container collapse");
                collapsibleContent.attr("id", titleID);

                reportInfoContent.addClass("report-info collapse");
                reportInfoContent.attr("id", titleID + "_p");
            });

            /**
             * Inserts a new collapsible title for the paragraph with the report information.
             */
            $("<h2 class='report-info-title collapse-link collapsed'>Report info</h2>").insertBefore(".report-info");
            makeReportInfoCollapsible(mdDestinationID);
        }

        /**
         * Makes report information content collapsible.
         * @param mdDestinationID id of the `div` with a markdown content
         */
        function makeReportInfoCollapsible(mdDestinationID) {
            var reportInfoContent = mdDestinationID.find(".report-info");

            reportInfoContent.each(function (index, element) {
                const reportInfoID = this.id;
                const reportInfoTitle = $(element).prev(".report-info-title");

                reportInfoTitle.attr("href", "#" + reportInfoID);
                reportInfoTitle.attr("data-toggle", "collapse");
            });
        }
    }
);
