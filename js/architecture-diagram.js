/**
 * This is a JavaScript file which backs the Spine architecture diagram.
 *
 * Please see `/docs/concepts/index.md` for usage.
 */

$(
    /**
     * This function is executed upon page load.
     *
     * Binds the handlers to the events in this HTML page.
     */
    function () {

        const endUserClass = "end-user";
        const boxCaptionClass = "box-caption";
        const arrowCaptionClass = "arrow-caption";
        const titleCaptionClass = "title-caption";

        /**
         * Changes opacity of the elements, not marked as "end-user".
         *
         * The opacity value is expected to be [0; 1] range.
         *
         * @param textOpacity the opacity to apply to text elements
         * @param elementOpacity the opacity to apply "rect" and "path" elements
         */
        function fade(textOpacity, elementOpacity) {
            var contents = $(".diagram-content").find("*");
            console.log("Total: " + contents.length);
            for (let index = 0; index < contents.length; index++) {
                const item = $(contents[index]);
                if (hasClass(item[0], endUserClass)) {
                    continue;
                }
                const elementName = item[0].nodeName.toLowerCase();
                if ("div" === elementName) {

                    if (item.hasClass(boxCaptionClass)
                        || item.hasClass(arrowCaptionClass)
                        || item.hasClass(titleCaptionClass)) {

                        item.css("opacity", textOpacity);
                    }
                }
                if ("rect" === elementName) {
                    item.attr("fill-opacity", elementOpacity);
                }
                if ("path" === elementName) {
                    item.attr("fill-opacity", elementOpacity);
                    item.attr("stroke-opacity", elementOpacity);
                }
            }
        }

        /**
         * A custom implementation of `jQuery.hasClass()` suitable for SVG elements.
         *
         * In the jQuery 1.11.2 currently used, SVG elements are not supported
         * by `jQuery.hasClass()`.
         *
         * @param element an element wrapped in jQuery.
         * @param className a class name to detect
         * @return `true` if such a class name is declared for this element, `false` otherwise.
         */
        function hasClass(element, className) {
            for(var classIndex = 0; classIndex < element.classList.length; classIndex++) {
                if(className === element.classList[classIndex]) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Displays the user-facing components and fades out the rest.
         *
         * Enables the tooltip mode.
         */
        function displayUserFacing() {
            fade("0.5", "0.3");

            // Enable a tooltip for `Aggregate`
            $(".aggregate")
                .css("cursor", "pointer")
                .attr("pointer-events", "all");
            $(document).tooltip({
                items: ".aggregate",
                content: "Aggregate description goes here."
            });
        }

        /**
         * Displays all the Spine components and removes the fading.
         *
         * Disables the tooltip mode.
         */
        function displayAll() {
            fade("1", "1");

            $(document).tooltip('disable');
        }

        $("#display-user-facing-components").click(function() {displayUserFacing()});
        $("#display-all-components").click(function() {displayAll()});
    }
);