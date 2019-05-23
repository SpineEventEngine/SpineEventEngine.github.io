$(
    function() {
        var converter = new showdown.Converter();
        const loadedAttr = "loaded";
        const repoAttr = "repo";

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

        function makeCollapsibleTitle(mdDestinationID) {
            var h1Elements = mdDestinationID.find("h1");
            var h2Elements = mdDestinationID.find("h2");
            var linkElements = mdDestinationID.find("a");

            h1Elements.addClass("dependencies-title");

            linkElements.addClass("external");
            linkElements.attr("target", "_blank");

            h2Elements.each(function(index, element) {
                const titleID = this.id + "_1";
                $(element).addClass("collapse-link collapsed");
                $(element).attr("href", "#" + titleID);
                $(element).attr("data-toggle", "collapse");
                $(element).next("ol").addClass("dependencies-container collapse");
                $(element).next("ol").attr("id", titleID);

                $(element).next("ol").next("p").addClass("report-info collapse");
                $(element).next("ol").next("p").attr("id", titleID + "_p");
            });

            $("<h2 class='report-info-title collapse-link collapsed'>Report info</h2>").insertBefore(".report-info");
            makeReportInfoCollapsible(mdDestinationID);
        }

        function makeReportInfoCollapsible(mdDestinationID) {
            var reportInfoContent = mdDestinationID.find(".report-info");

            reportInfoContent.each(function (index, element) {
                const reportInfoID = this.id;
                $(element).prev(".report-info-title").attr("href", "#" + reportInfoID);
                $(element).prev(".report-info-title").attr("data-toggle", "collapse");
            });
        }
    }
);
