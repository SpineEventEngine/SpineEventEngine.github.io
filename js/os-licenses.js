$(
    function() {
        var converter = new showdown.Converter();
        const loadedAttr = "loaded";
        const repoAttr = "repo";
        $("#load-md-btn-base").click(function () {
            var clickedElement = $(this);
            var loaded = clickedElement.attr(loadedAttr);
            if (loaded === "false") {
                var repositoryUrl = clickedElement.attr(repoAttr);
                $.get(
                    repositoryUrl + "/master/license-report.md",
                    function (data) {
                        var html = converter.makeHtml(data);
                        $("#md-destination-base").html(html);
                        clickedElement.attr(loadedAttr, "true");
                    }
                );
            }
        });
    }
);
