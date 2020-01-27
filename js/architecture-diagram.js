/**
 * This is a JavaScript file which backs the Spine architecture diagram.
 *
 * Please see `/docs/introduction/architecture.md` for usage.
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
        const arrowClass = "arrow";
        const pathOnlyClass = "path-only";

        /**
         * CSS classes of the HTML elements on the page.
         * @type {string}
         */
        let architectureLinkClass = "architecture-link";
        let noSelectClass = "noselect";

        let useFacingLink = $("#display-user-facing-components");
        let allComponentLink = $("#display-all-components");
        let selectedElementColor = "#8d28e0";
        let selectedCaptionColor = "#fafafa";
        let selectedBodyBgColor = "#e7ecfa";
        let selectedBodyBgCaptionColor = "#505050";

        const originFillAttr = "origin-fill";
        const originStrokeAttr = "origin-stroke";

        const fillAttr = "fill";
        const strokeAttr = "stroke";
        const fillOpacityAttr = "fill-opacity";
        const strokeOpacityAttr = "stroke-opacity";
        const pointerEvents = "pointer-events";

        const textTag = "text";
        const rectTag = "rect";
        const pathTag = "path";

        function setupLookAndFeel() {

            // Back up the original fill color and color of elements to use in `mouseleave` later.
            let contents = $(".diagram-content").find("*");
            for (let index = 0; index < contents.length; index++) {
                const item = $(contents[index]);
                const elementName = item[0].nodeName.toLowerCase();
                if (textTag === elementName) {

                    if (hasClass(item, boxCaptionClass)
                        || hasClass(item, arrowCaptionClass)
                        || hasClass(item, titleCaptionClass)) {
                        item.attr(originFillAttr, item.attr(fillAttr));

                        // Make all TEXTs non-selectable.
                        item.addClass(noSelectClass);
                    }
                }
                if (rectTag === elementName || pathTag === elementName) {
                    item.attr(originFillAttr, item.attr(fillAttr));
                    item.attr(originStrokeAttr, item.attr(strokeAttr))
                }
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
                if (hasClass(item, endUserClass)) {
                    continue;
                }
                const elementName = item[0].nodeName.toLowerCase();

                if (textTag === elementName) {

                    if (hasClass(item, boxCaptionClass)
                        || hasClass(item, arrowCaptionClass)
                        || hasClass(item, titleCaptionClass)) {

                        item.attr(fillOpacityAttr, textOpacity);
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
            const firstChild = element[0];
            for (let classIndex = 0; classIndex < firstChild.classList.length; classIndex++) {
                if (className === firstChild.classList[classIndex]) {
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

                    for (let index = 0; index < matched.length; index++) {
                        const item = $(matched[index]);
                        const elementName = item[0].nodeName.toLowerCase();
                        if(textTag === elementName) {
                            item.attr(fillAttr, selectedCaptionColor);
                        }
                        if (rectTag === elementName || pathTag === elementName) {
                            item.attr(fillAttr, selectedElementColor);
                        }
                        if(hasClass(item, arrowClass)) {
                            item.attr(strokeAttr, selectedElementColor);
                        }
                        if(hasClass(item, pathOnlyClass)) {
                            item.attr(fillAttr, "none");
                        }
                    }
                })
                .mouseout(function () {
                    let matched = $(selector);
                    for (let index = 0; index < matched.length; index++) {
                        const item = $(matched[index]);
                        const elementName = item[0].nodeName.toLowerCase();
                        if (textTag === elementName
                            || rectTag === elementName
                            || pathTag === elementName) {
                            let originFillValue = item.attr(originFillAttr);
                            item.attr(fillAttr, originFillValue);
                        }

                        if(hasClass(item, arrowClass)) {
                            let originStrokeValue = item.attr(originStrokeAttr);
                            item.attr(strokeAttr, originStrokeValue);
                        }
                    }

                })
                .click(function () {
                    document.location.href = url;
                });

            $(".g-caption-bounded-context" + selector)
                .css("cursor", "pointer")
                .attr("pointer-events", "all")
                .mouseover(function () {
                    let matched = $(selector);

                    for (let index = 0; index < matched.length; index++) {
                        const item = $(matched[index]);
                        const elementName = item[0].nodeName.toLowerCase();
                        if(textTag === elementName) {
                            item.attr(fillAttr, selectedBodyBgCaptionColor);
                        }
                        if (rectTag === elementName || pathTag === elementName) {
                            item.attr(pointerEvents, "none");
                            item.attr(fillAttr, selectedBodyBgColor);
                        }
                        if(hasClass(item, arrowClass)) {
                            item.attr(strokeAttr, selectedBodyBgColor);
                        }
                    }
                })
                .mouseout(function () {
                    let matched = $(selector);
                    for (let index = 0; index < matched.length; index++) {
                        const item = $(matched[index]);
                        const elementName = item[0].nodeName.toLowerCase();
                        if (textTag === elementName
                            || rectTag === elementName
                            || pathTag === elementName) {
                            let originFillValue = item.attr(originFillAttr);
                            item.attr(fillAttr, originFillValue);
                        }

                        if(hasClass(item, arrowClass)) {
                            let originStrokeValue = item.attr(originStrokeAttr);
                            item.attr(strokeAttr, originStrokeValue);
                        }
                    }

                })
                .click(function () {
                    document.location.href = url;
                });


            $(".g-arrow" + selector)
                .css("cursor", "pointer")
                .attr("pointer-events", "all")
                .mouseover(function () {
                    let matched = $(selector);

                    for (let index = 0; index < matched.length; index++) {
                        const item = $(matched[index]);
                        const elementName = item[0].nodeName.toLowerCase();
                        if (textTag === elementName) {
                            item.attr(fillAttr, selectedElementColor);
                        }
                        if(hasClass(item, arrowClass)) {
                            item.attr(fillAttr, selectedElementColor);
                        }
                    }
                })
                .mouseout(function () {
                    let matched = $(selector);
                    for (let index = 0; index < matched.length; index++) {
                        const item = $(matched[index]);
                        const elementName = item[0].nodeName.toLowerCase();
                        if (textTag === elementName) {
                            let originFillValue = item.attr(originFillAttr);
                            item.attr(fillAttr, originFillValue);
                        }
                        if(hasClass(item, arrowClass)) {
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
            fade("0.65", "0.2");
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

        // Boxes:
        makeClickable(".aggregate", "/docs/introduction/concepts.html#aggregate");
        makeClickable(".bounded-context", "/docs/introduction/concepts.html#bounded-context");
        makeClickable(".pm", "/docs/introduction/concepts.html#process-manager");
        makeClickable(".projection", "/docs/introduction/concepts.html#projection");
        makeClickable(".aggregate-repo", "/docs/introduction/concepts.html#repository");
        makeClickable(".pm-repo", "/docs/introduction/concepts.html#repository");
        makeClickable(".projection-repo", "/docs/introduction/concepts.html#repository");
        makeClickable(".command-bus", "/docs/introduction/concepts.html#command-bus");
        makeClickable(".event-bus", "/docs/introduction/concepts.html#event-bus");
        makeClickable(".aggregate-mirror", "/docs/introduction/concepts.html#aggregate-mirror");
        makeClickable(".command-store", "/docs/introduction/concepts.html#command-store");
        makeClickable(".event-store", "/docs/introduction/concepts.html#event-store");
        makeClickable(".command-service", "/docs/introduction/concepts.html#command-service");
        makeClickable(".query-service", "/docs/introduction/concepts.html#query-service");
        makeClickable(".subscription-service", "/docs/introduction/concepts.html#subscription-service");
        makeClickable(".stand", "/docs/introduction/concepts.html#stand");

        // Arrows:

        makeClickable(".ui-command-service", "/docs/introduction/concepts.html#command");
        makeClickable(".command-service-ui", "/docs/introduction/concepts.html#acknowledgement");
        makeClickable(".event-bus-aggregate-repo", "/docs/introduction/concepts.html#event");
        makeClickable(".integration-events", "/docs/introduction/concepts.html#integration-event");
    }
);
