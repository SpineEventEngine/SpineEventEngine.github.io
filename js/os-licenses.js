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

            h1Elements.addClass("dependencies-title");

            h2Elements.each(function(index, element) {
                const titleID = this.id + "_1";
                $(element).addClass("collapse-link collapsed");
                $(element).attr("href", "#" + titleID);
                $(element).attr("data-toggle", "collapse");
                $(element).next("ol").addClass("dependencies-container collapse");
                $(element).next("ol").attr("id", titleID);
                $(element).next("ol").next("p").css("display", "none");
                $(element).next("ol").find("a").addClass("external");
                $(element).next("ol").find("a").attr("target", "_blank");
            });
        }
    }
);
