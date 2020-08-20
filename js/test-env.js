---
    # Do not remove`---` tags.These are the frontmatter tags for Jekyll variables.
---

$(
    function () {

        console.log("The Environment mode is: ", getEnvironmentMode());

        /**
         * Returns environment mode.
         *
         * @return {string} returns development or production mode based on jekyll environment
         */
        function getEnvironmentMode() {
            if ("{{jekyll.environment}}" === "development") {
                return "development";
            } else {
                return "production";
            }
        }
    }
);
