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

        /**
         * CSS classes used as selectors to manipulate the elements of SVG diagram.
         */

        const endUserClass = "end-user";
        const boxCaptionClass = "box-caption";
        const arrowCaptionClass = "arrow-caption";
        const titleCaptionClass = "title-caption";

        /**
         * CSS classes of the HTML elements on the page.
         * @type {string}
         */
        let architectureLinkClass = "architecture-link";
        let noSelectClass = "noselect";

        let useFacingLink = $("#display-user-facing-components");
        let allComponentLink = $("#display-all-components");
        let selectedRectFill = "#8d28e0";
        let selectedCaptionColor = "#fafafa";

        const originColorAttr = "origin-color";
        const originFillAttr = "origin-fill";

        const colorProp = "color";
        const fillAttr = "fill";
        const opacityAttr = "opacity";
        const fillOpacityAttr = "fill-opacity";
        const strokeOpacityAttr = "stroke-opacity";

        const divTag = "div";
        const rectTag = "rect";
        const pathTag = "path";

        function setupLookAndFeel() {

            // Back up the original fill color and color of elements to use in `mouseleave` later.
            let contents = $(".diagram-content").find("*");
            for (let index = 0; index < contents.length; index++) {
                const item = $(contents[index]);
                const elementName = item[0].nodeName.toLowerCase();
                if (divTag === elementName) {

                    if (item.hasClass(boxCaptionClass)
                        || item.hasClass(arrowCaptionClass)
                        || item.hasClass(titleCaptionClass)) {
                        item.attr(originColorAttr, item.css(colorProp));

                        // Make all DIVs non-selectable.
                        item.addClass(noSelectClass);
                    }
                }
                if (rectTag === elementName || pathTag === elementName) {
                    item.attr(originFillAttr, item.attr(fillAttr));
                }

                item.mouseenter(function() {
                    console.log($(this)[0].nodeName);
                })
            }
        }


        /**
         * Changes opacity of the elements, not marked as "end-user".
         *
         * The opacity value is expected to be [0; 1] range.
         *
         * @param textOpacity the opacity to apply to text elements
         * @param elementOpacity the opacity to apply "rect" and "path" elements
         */
        function fade(textOpacity, elementOpacity) {
            let contents = $(".diagram-content").find("*");
            for (let index = 0; index < contents.length; index++) {
                const item = $(contents[index]);
                if (hasClass(item[0], endUserClass)) {
                    continue;
                }
                const elementName = item[0].nodeName.toLowerCase();

                if (divTag === elementName) {

                    if (item.hasClass(boxCaptionClass)
                        || item.hasClass(arrowCaptionClass)
                        || item.hasClass(titleCaptionClass)) {


                        item.css(opacityAttr, textOpacity);
                    }
                }
                if (rectTag === elementName) {
                    item.attr(fillOpacityAttr, elementOpacity);
                }
                if (pathTag === elementName) {
                    item.attr(fillOpacityAttr, elementOpacity);

                    item.attr(strokeOpacityAttr, elementOpacity);
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
            for (let classIndex = 0; classIndex < element.classList.length; classIndex++) {
                if (className === element.classList[classIndex]) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Adds a link behavior to an element.
         *
         * @param linkElement the jQuery object wrapping the DOM element
         * @param onClickCallback the callback to set upon 'click' event
         */
        function enableLink(linkElement, onClickCallback) {
            linkElement
                .addClass(architectureLinkClass)
                .click(function () {
                    onClickCallback()
                });
        }

        /**
         * Disables a link behaviour of an element.
         *
         * @param linkElement the jQuery object wrapping the DOM element
         */
        function disableLink(linkElement) {
            linkElement
                .removeClass(architectureLinkClass)
                .unbind("click");
        }

        function makeClickable(selector, url) {

            $(".g-caption" + selector)
                .css("cursor", "pointer")
                .attr("pointer-events", "all")
                .mouseover(function () {
                    let matched = $(selector);
                    matched.attr(fillAttr, selectedRectFill).css(colorProp, selectedCaptionColor)
                })
                .mouseout(function () {
                    let matched = $(selector);
                    for (let index = 0; index < matched.length; index++) {
                        const item = $(matched[index]);
                        const elementName = item[0].nodeName.toLowerCase();
                        if (divTag === elementName) {
                            let originColorValue = item.attr(originColorAttr);
                            item.css(colorProp, originColorValue);
                        }
                        if (rectTag === elementName || pathTag === elementName) {
                            let originFillValue = item.attr(originFillAttr);
                            item.attr(fillAttr, originFillValue);
                        }
                    }

                })
                .click(function () {
                    document.location.href = url;
                });
        }

        /**
         * Displays the user-facing components and fades out the rest.
         */
        function displayUserFacing() {
            fade("0.5", "0.3");
            enableLink(allComponentLink, displayAll);
            disableLink(useFacingLink);
        }

        /**
         * Displays all the Spine components and removes the fading.
         */
        function displayAll() {
            fade("1", "1");

            enableLink(useFacingLink, displayUserFacing);
            disableLink(allComponentLink);
        }

        setupLookAndFeel();
        displayAll();

        // Link items to the corresponding pages.
        makeClickable(".aggregate", "./aggregate.html");
        makeClickable(".bounded-context", "./bounded-context.html");
        makeClickable(".pm", "./process-manager.html");
        makeClickable(".projection", "./projection.html");
        makeClickable(".aggregate-repo", "./repository.html");
        makeClickable(".pm-repo", "./repository.html");
        makeClickable(".projection-repo", "./repository.html");
        makeClickable(".command-bus", "./command-bus.html");
        makeClickable(".event-bus", "./event-bus.html");
        makeClickable(".aggregate-mirror", "./aggregate-mirror.html");
        makeClickable(".command-store", "./command-store.html");
        makeClickable(".event-store", "./event-store.html");
        makeClickable(".command-service", "./command-service.html");
        makeClickable(".query-service", "./query-service.html");
        makeClickable(".subscription-service", "./subscription-service.html");
        makeClickable(".stand", "./stand.html");
    }
);
