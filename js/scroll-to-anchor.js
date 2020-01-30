'use strict';

/**
 * This script contains helper functions that are responsible for scroll to anchor.
 */

/**
 * Scrolls to the anchor when the hash changes.
 */
function scrollToAnchor() {
    const anchor = location.hash;
    let offset = -scrollToOffset;

    if (isFaqPage) {
        offset = -150; // Top offset for the FAQ page target element
    }

    if ($(anchor).length) {
        $(window).scrollTo($(anchor), 500, {offset: offset});
    }
}

/**
 * Prevents default scrolling when clicking on the anchor icon on the FAQ page.
 *
 * <p>Also it doesn't collapse item on the `anchor-link` double-click.
 */
function onFaqAnchorClick() {
    $('.anchor-link').click(function(event) {
        const anchor = $(this).attr('href');
        preventDefaultScroll(event, anchor);
        preventBootstrapItemCollapse(event);
    });
}

/**
 * Prevents default scrolling when clicking on the anchor link icon on document pages.
 */
function onDocHeadingAnchorClick() {
    $('.anchorjs-link').click(function (event) {
        const anchor = $(this).attr('href');
        preventDefaultScroll(event, anchor);
    });
}

/**
 * Prevents default scrolling to the anchor.
 *
 * @param event received click event
 * @param anchor clicked element anchor value
 */
function preventDefaultScroll(event, anchor) {
    const x = window.pageXOffset;
    const y = window.pageYOffset;
    event.preventDefault();
    window.location.hash = anchor;
    window.scrollTo(x, y);
}

/**
 * Prevents Bootstrap element from collapsing.
 *
 * @param event received click event
 */
function preventBootstrapItemCollapse(event) {
    event.stopPropagation();
    $(location.hash).collapse('show');
}
