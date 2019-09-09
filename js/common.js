'use strict';

const head = document['head'] || document.getElementsByTagName("head")[0] || root;
const header = $('#header');
const initialHeadHeight = header.innerHeight();
const tocNav = $('#toc');
const headerFixPosition = $('.nav-hero-container').innerHeight();
const stickyElement = $('.sticky-element');
const stickyElementPosition = headerFixPosition; // Sticky element top-offset (154px)
const goTopBtn = $('#go-top-btn');
const copyrightEl = $('.copyright');
const isFaqPage = $('body').is('.faq');
const topOffset = 12; // Offset from the `header` navigation
const scrollToOffset = initialHeadHeight + topOffset;

/** Code color variables */
const $selectorDark = $('.color.dark');
const $selectorLight = $('.color.light');
const colorDark = 'dark';
const colorLight = 'light';
const baseStylesUrl = '/libs/prettify/skins/';
const darkStylesUrl = baseStylesUrl + 'dark-theme-prettify.css?refresh';
const lightStylesUrl = baseStylesUrl + 'light-theme-prettify.css?refresh';

$(function() {
    changeCodeColor();
    initPrettyprint();
    openHeaderMenuOnMobile();
    addExternalClass();
    initTocTocify();
    showScrollTopBtn();
    fixStickyElement();

    if (isFaqPage) {
        expandItemOnHashChange();
        preventDefaultScroll();
    }
});

jQuery(window).on('load', function() {
    ifCookiesExist();
    setStickyElMaxHeight();
    scrollToAnchor();
});

window.onhashchange = function() {
    if (isFaqPage) {
        expandItemOnHashChange();
        scrollToAnchor();
    }
};

window.onscroll = function() {
    fixStickyElement();
    fixHead();
    setStickyElMaxHeight();
    showScrollTopBtn();
};

$(window).resize(function() {
    resizeStickyElHeightWithWindow();
    ifCookiesExist();
    fixHead();
});

function changeCodeColor() {
    const cookieValue = Cookies.get('colorPref');

    setDefaultCookieValue(cookieValue);

    colorDark === cookieValue
                  && loadPrettifyStyles(darkStylesUrl)
                  && makeSelectorActive($selectorDark, colorDark);

    colorLight === cookieValue
                   && loadPrettifyStyles(lightStylesUrl)
                   && makeSelectorActive($selectorLight, colorLight);

    $selectorDark.click(function() {
        loadPrettifyStyles(darkStylesUrl);
        makeSelectorActive($selectorDark, colorDark);
    });

    $selectorLight.click(function() {
        loadPrettifyStyles(lightStylesUrl);
        makeSelectorActive($selectorLight, colorLight);
    })
}

function setDefaultCookieValue(cookieValue) {
    if (cookieValue == null) {
        Cookies.set('colorPref', colorDark);
        makeSelectorActive($selectorDark, colorDark);
    }
}

function loadPrettifyStyles(stylesLink) {
    const $prettifyStyleSheets = $('#prettify-styles');

    if ($prettifyStyleSheets.length) {
        $prettifyStyleSheets.attr('href', stylesLink);
    } else {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.id = 'prettify-styles';
        link.type = 'text/css';
        link.href = stylesLink;
        head.appendChild(link);
    }
}

function makeSelectorActive(selector, color) {
    $('.color-selector a').removeClass('active');
    selector.addClass('active');
    Cookies.set('colorPref', color);
}

/**
 * Inits pretty-print scripts.
 *
 * @see {@link https://github.com/google/code-prettify/blob/master/docs/getting_started.md code-prettify}
 */
function initPrettyprint() {
    $('pre').addClass('prettyprint');
    $.getScript("/libs/prettify/run_prettify.js", function(){});
    $.getScript("/libs/prettify/lang-css.js", function(){});
    $.getScript("/libs/prettify/lang-go.js", function(){});
    $.getScript("/libs/prettify/lang-proto.js", function(){});
    $.getScript("/libs/prettify/lang-swift.js", function(){});
    $.getScript("/libs/prettify/lang-yaml.js", function(){});
}

/**
 * Opens header menu on mobile device.
 */
function openHeaderMenuOnMobile() {
    $('#nav-icon-menu').click(function(){
        $(this).toggleClass('open');
        $('body').toggleClass('navigation-opened');
    });
}

/**
 * Adds the `external` class to every outbound link on the site.
 *
 * <p>The css will add a small right arrow after the link.
 */
function addExternalClass() {
    $('a').filter(function() {
        return this.hostname && this.hostname !== location.hostname;
    }).addClass('external');
}

/**
 * Inits `toc` navigation if a page has more than 2 headers.
 *
 * @see {@link http://gregfranko.com/jquery.tocify.js/ Toc Tocify}
 */
function initTocTocify() {
    const docsContainer = $('.docs-content-text');
    const headersQuantity = docsContainer.find('h2, h3, h4');

    if (headersQuantity.length >= 3) {
        tocNav.tocify({
            context: docsContainer,
            selectors: 'h2, h3, h4',
            showAndHide: false,
            scrollTo: scrollToOffset,
            extendPage: false,
            hashGenerator: 'pretty',
            smoothScroll: false
        });
    }
}

/**
 * Fix sticky element on page while scrolling.
 */
function fixStickyElement() {
    if (stickyElement.length) {
        if (window.pageYOffset > stickyElementPosition) {
            stickyElement.addClass('sticky');
        }
        else {
            stickyElement.removeClass('sticky');
        }
    }
}

/**
 * Makes header navigation sticky on scroll.
 *
 * <p>The header will not be sticky if the `header` has `hide-sticky-header` class. But it
 * still working on mobile devices. Used for all `docs` pages.
 */
function fixHead() {
    const stickyHeaderHidden = header.hasClass('hide-sticky-header');
    const mobileSize = 640;
    const mobileWindow = $(window).width() <= mobileSize;
    const desktopWindow = $(window).width() > mobileSize;
    const headerExistAndNotHidden = header.length && !stickyHeaderHidden;
    const headerOnMobile = header.length && mobileWindow;
    const headerHiddedAndNotMobile = header.length && stickyHeaderHidden && desktopWindow;

    if (headerExistAndNotHidden || headerOnMobile) {
        if (window.pageYOffset > headerFixPosition) {
            header.addClass('not-top'); // When the navigation below offset
            header.addClass('pinned'); // When the navigation below hero section
            header.removeClass('unpinned');
        } else {
            header.removeClass('pinned');
            header.addClass('unpinned');
        }
        /** Determines the header at the top of the page. */
        if (window.pageYOffset < initialHeadHeight) {
            returnToInitialState();
        }
    }

    if (headerHiddedAndNotMobile) {
        returnToInitialState();
    }
}

/**
 * Returns header classes to the initial state.
 */
function returnToInitialState() {
    header.removeClass('not-top');
    header.removeClass('unpinned');
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
    /**
     * The distance from the element to the footer top point.
     * The value is the same as `docs-content-text` has.
     */
    const contentMarginBottom = 32;

    const initialHeight = windowHeight - stickyElementPosition + contentMarginBottom - cookieContainerHeight;
    const maxHeight = footerTopPoint - scrollPosition - stickyElementPosition + contentMarginBottom;

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
 * Expands FAQ item on hash change.
 */
function expandItemOnHashChange() {
    if ('onhashchange' in window) {
        $(location.hash).collapse('show');
    }
}

/**
 * Prevents default scroll behavior and prevents double click on the same hash for the FAQ page.
 */
function preventDefaultScroll() {
    $('.anchor-link').click(function(event) {
        const anchor = $(this).attr('href');
        const x = window.pageXOffset;
        const y = window.pageYOffset;
        event.preventDefault();
        window.location.hash = anchor;
        window.scrollTo(x, y);
    });
}

/**
 * Scrolls to the anchor.
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
 * Adds additional padding values if the `cookieChoiceInfo` exist on the page.
 */
function ifCookiesExist() {
    const cookieInfo = $('#cookieChoiceInfo');
    const cookieAgreeBtn = $('#cookieChoiceDismiss');
    const cookieContainerHeight = cookieInfo.innerHeight();
    const marginBottom = 10; // A bottom margin for the `Go to Top` button
    const copyrightPaddingBottom = 24; // A bottom padding for the `Copyright` div element

    if(cookieInfo.length){
        $(goTopBtn).css('bottom', cookieContainerHeight + marginBottom);
        $(copyrightEl).css('padding-bottom', cookieContainerHeight + copyrightPaddingBottom);

        /**
         * Removes additional padding values on the `Agree` button click.
         */
        $(cookieAgreeBtn).click(function(){
            $(goTopBtn).css('bottom', marginBottom);
            $(copyrightEl).css('padding-bottom', copyrightPaddingBottom);
        });
    } else {
        $(goTopBtn).css('bottom', marginBottom);
        $(copyrightEl).css('padding-bottom', copyrightPaddingBottom);
    }
}

/**
 * Shows `Go to Top` button when the scroll position is 1500px.
 */
function showScrollTopBtn() {
    if ($(this).scrollTop() > 1500 ) {
        $(goTopBtn).show();

    } else {
        $(goTopBtn).hide();
    }
}

/**
 * Scrolls to the top of the page.
 */
function topFunction() {
    $('html, body').stop().animate({scrollTop: 0}, 500, 'swing');
    return false;
}
