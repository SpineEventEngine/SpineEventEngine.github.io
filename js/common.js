// Mobile navigation toggle
$('#nav-icon-menu').click(function(){
    $(this).toggleClass('open');
    $('body').toggleClass('navigation-opened');
});


// Add the 'external' class to every outbound link on the site.
// The css will add a small right arrow after the link.
$('a').filter(function() {
   return this.hostname && this.hostname !== location.hostname;
}).addClass("external");

// Remove external mark on Octocat icons, that already look external enough.
$("i.fa-github-alt").parent().removeClass("external");


// Prettyprint
$('pre').addClass("prettyprint");
$.getScript("/libs/prettify/js/run_prettify.js", function(){});
$.getScript("/libs/prettify/js/lang-css.js", function(){});
$.getScript("/libs/prettify/js/lang-go.js", function(){});
$.getScript("/libs/prettify/js/lang-proto.js", function(){});
$.getScript("/libs/prettify/js/lang-swift.js", function(){});
$.getScript("/libs/prettify/js/lang-yaml.js", function(){});


const initialHeadHeight = $('#header').innerHeight();
const tocNav = $('#toc');
const headerFixPosition = $('.nav-hero-container').innerHeight();
const stickyElement = $('.sticky-element');
const stickyElementPosition = 120; // Sticky element top-offset

$(function() {
    expandItemOnHashChange();
    preventDefaultScroll();
    initTocTocify();
    showScrollTopBtn();
});

jQuery(window).on('load', function() {
    scrollToAnchor();
    ifCookiesExist();
    tocHeight();
});

// Make functions works immediately on hash change
window.onhashchange = function() {
    expandItemOnHashChange();
    scrollToAnchor();
};

window.onscroll = function() {
    fixStickyElement();
    fixHead();
    tocHeight();
    showScrollTopBtn();
};

$(window).resize(function() {
    resizeTocHeightWithWindow();
    ifCookiesExist();
});

/**
 * Inits `toc` navigation if a page has more than 2 headers.
 *
 * @see {@link http://gregfranko.com/jquery.tocify.js/ Toc Tocify}
 */
function initTocTocify() {
    const docsContainer = $(".docs-content");
    const headersQuantity = docsContainer.find("h2, h3, h4");
    const topOffset = 12; // Offset from the `header` navigation

    if (headersQuantity.length >= 3) {
        tocNav.tocify({
            selectors: "h2, h3, h4",
            showAndHide: false,
            scrollTo: initialHeadHeight + topOffset,
            extendPage: false
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

// Animation header on scroll
function fixHead() {
    var header = $('#header');
    if (header.length) {
        if (window.pageYOffset > headerFixPosition) {
            header.addClass("not-top"); // When navigation below offset
            header.addClass("pinned"); // When navigation below hero section
            header.removeClass("unpinned");
        }
        else {
            header.removeClass("pinned");
            header.addClass("unpinned");
        }

        // Return classes to the initial state when the navigation at the top of the page
        if (window.pageYOffset < initialHeadHeight) {
            header.removeClass("not-top");
            header.removeClass("unpinned");
        }
    }
}

function tocHeight() {
    if (tocNav.length) {
        var windowHeight = $(window).height();
        var scrollPosition = $(window).scrollTop();
        var footerTopPoint = $(".footer").position().top;
        var cookieContainerHeight = $("#cookieChoiceInfo").innerHeight();
        var contentMarginBottom = 60; /* The distance from the TOC to the bottom of the window. The value the same
        as a docs content. So the content and the TOC will be ended at the same line */

        /* Initial TOC max-height when the scroll at the top or middle of the page */
        var initialTocHeight = windowHeight - stickyElementPosition - contentMarginBottom - cookieContainerHeight;

        /* Dynamic value that changes on scroll. When the scroll at the bottom of the page, TOC height decreases. */
        var maxHeightValue = footerTopPoint - scrollPosition - stickyElementPosition - contentMarginBottom;


        /*The max-height value can be bigger than browser window if the scroll at the top of page.
        * So here is added the check*/
        if (maxHeightValue < initialTocHeight) {
            $(tocNav).css('max-height', maxHeightValue);
        }

        else {
            $(tocNav).css('max-height', initialTocHeight);
        }
    }
}

// Resize TOC height when window height is changing
function resizeTocHeightWithWindow() {
    if ($(window).height() > 600) {
        tocHeight();
    }
}

// Expand FAQ item on hash change
function expandItemOnHashChange() {
    if ("onhashchange" in window) {
        $(location.hash).collapse('show');
    }
}

// Prevent default scroll and double click on the same hash
function preventDefaultScroll() {
    $('.anchor-link').click(function(event) {
        var anchor = $(this).attr("href");
        var x = window.pageXOffset;
        var y = window.pageYOffset;
        event.preventDefault();
        window.location.hash = anchor;
        window.scrollTo(x, y);
    });
}

function scrollToAnchor() {
    var anchor = location.hash;
    var offset = -150; // Top offset for move header below fixed header

    if ($(anchor).length) {
        $(window).scrollTo($(anchor), 500, {offset: offset});
    }
}


var goTopBtn = $("#go-top-btn");
var copyrightEl = $(".copyright");

/**
 * Adds additional padding values if the `cookieChoiceInfo` exist on the page.
 */
function ifCookiesExist() {
    var cookieInfo = $("#cookieChoiceInfo");
    var cookieAgreeBtn = $("#cookieChoiceDismiss");
    var cookieContainerHeight = cookieInfo.innerHeight();
    var marginBottom = 10; // A bottom margin for the `Go to Top` button
    var copyrightPaddingBottom = 24; // A bottom padding for the `Copyright` div element

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
    }

    else {
        $(goTopBtn).css('bottom', marginBottom);
        $(copyrightEl).css('padding-bottom', copyrightPaddingBottom);
    }
}

// When the user scrolls down 1500px from the top of the document, show the button ”Go to Top“
function showScrollTopBtn() {
    if ($(this).scrollTop() > 1500 ) {
        $(goTopBtn).show();

    } else {
        $(goTopBtn).hide();
    }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    $("html, body").stop().animate({scrollTop: 0}, 500, 'swing'); return false;
}
