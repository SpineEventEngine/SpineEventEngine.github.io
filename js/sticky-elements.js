/**
 * This script contains helper functions that make any element with `.sticky-element` class sticky.
 */

'use strict';

const stickyElement = $('.sticky-element');
const stickyElementFixed = stickyElement.hasClass('initially-fixed');
const stickyElTopOffset = 32;
const startPointToFixElement = initialHeadHeight + stickyElTopOffset;
const initialMarginTop = 0;
const pricingHeader = $('#sticky-pricing-header');
const pricingHeaderTop = pricingHeader.offset().top - 68; // `68px` sticky header height

/**
 * Fix sticky element on page while scrolling.
 */
function fixStickyElement() {
    if (stickyElement.length && !stickyElementFixed) {
        if (window.pageYOffset > startPointToFixElement) {
            stickyElement.addClass('sticky');
            stickyElement.css('margin-top', -startPointToFixElement);
        }
        else {
            stickyElement.removeClass('sticky');
            stickyElement.css('margin-top', initialMarginTop);
        }
    }
}

/**
 * Sets max-height for the sticky element depends on the scroll position.
 */
function setStickyElMaxHeight() {
    if (stickyElement.length) {
        const elHeights = calcStickyElHeight();

        /**
         * Determines that the max-height value is less than browser window when the scroll
         * position at the top of the page.
         */
        if (elHeights.maxHeight < elHeights.initialHeight) {
            $(stickyElement).css('max-height', elHeights.maxHeight);
        } else {
            $(stickyElement).css('max-height', elHeights.initialHeight);
        }
    }
}

/**
 * Calculates a sticky element heights to make sure that it always fits on the page.
 *
 * @return {Object} an object with initial and calculated heights.
 * {number} initialHeight initial element max-height when the scroll at the top
 *          or at the middle of the page
 * {number} maxHeight max height that dynamically changes on scroll at the bottom of the page
 */
function calcStickyElHeight() {
    const windowHeight = $(window).height();
    const scrollPosition = $(window).scrollTop();
    const footerTopPoint = $('.footer').position().top;
    const cookieContainerHeight = $('#cookieChoiceInfo').innerHeight();
    const contentMarginBottom = 20;

    const initialHeight = windowHeight - startPointToFixElement - contentMarginBottom - cookieContainerHeight;
    const maxHeight = footerTopPoint - scrollPosition - startPointToFixElement - contentMarginBottom;

    return {initialHeight, maxHeight};
}

/**
 * Changes the height of the `.sticky-element` when changing the height of the window.
 */
function resizeStickyElHeightWithWindow() {
    if ($(window).height() > 600) {
        setStickyElMaxHeight();
    }
}

/**
 * Makes pricing header sticky on Getting Help page.
 */
function fixGettingHelpHeader() {
    if (window.pageYOffset >= pricingHeaderTop) {
        pricingHeader.addClass('sticky');
    } else {
        pricingHeader.removeClass('sticky');
    }
}
