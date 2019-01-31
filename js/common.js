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


var initialHeadHeight = $("#header").innerHeight();
var tocNav = $('#toc');
var initialFooterHeight = $(".footer").innerHeight();
var headerFixPosition = $(".nav-hero-container").innerHeight();
var cookieContainerHeight = $("#cookieChoiceInfo").innerHeight();
var tocNavFixedPosition = 120; // Sticky TOC offset


$(function() {
    switchDocSideNavItems();
    expandItemOnHashChange();
    preventDefaultScroll();
    tocTocifySettings();
    showScrollTopBtn();
});

jQuery(window).on('load', function() {
    scrollToAnchor();
    ifCookiesExist();
});

// Make functions works immediately on hash change
window.onhashchange = function() {
    expandItemOnHashChange();
    scrollToAnchor();
};

window.onscroll = function() {
    fixToc();
    fixHead();
    tocHeight();
    showScrollTopBtn();
};

$(window).resize(function() {
    resizeTocHeightWithWindow();
    ifCookiesExist();
});

// Remove class from the parent element when the child is active
function switchDocSideNavItems() {
    if ($('#doc-side-nav-inside a').hasClass('current')) {
        var element = document.getElementById('side-nav-parent-item');
        element.classList.remove('current');
    }
}

function tocTocifySettings() {
    // Calls the tocify method on your HTML nav.
    // InitialHeadHeight + 12 (12px — small offset from the header navigation)
    tocNav.tocify({selectors:"h2, h3, h4", showAndHide: false, scrollTo: initialHeadHeight+12, extendPage: false});
}

// Fix TOC navigation on page while scrolling
function fixToc() {
    if (tocNav.length > 0) {
        if (window.pageYOffset > tocNavFixedPosition) {
            tocNav.addClass("sticky");
        }
        else {
            tocNav.removeClass("sticky");
        }
    }
}

// Animation header on scroll
function fixHead() {
    var header = $('#header');
    if (header.length > 0) {
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
    if (tocNav.length > 0) {

        var scrollHeight = $(document).height();
        var windowHeight = $(window).height();
        var scrollPosition = windowHeight + $(window).scrollTop();
        // The variable when position of the footer div begins
        var footerPosition = scrollHeight - initialFooterHeight - cookieContainerHeight;

        // Scroll at the bottom near the footer
        if (scrollPosition > footerPosition) {
            $(tocNav).css('max-height', windowHeight - initialFooterHeight - cookieContainerHeight - 2*tocNavFixedPosition);
        }

        // Scroll at the middle
        else {
            $(tocNav).css('max-height', windowHeight - headerFixPosition - tocNavFixedPosition - cookieContainerHeight);
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

// If the cookieChoiceInfo panel exist show “Go to Top” button above this panel
function ifCookiesExist() {
    var cookieInfo = $("#cookieChoiceInfo"); // Not working in global variables
    var cookieAgreeBtn = $("#cookieChoiceDismiss");
    var cookieContainerHeight = cookieInfo.innerHeight();
    var marginBottom = 10; // Bottom margin for the “Go to Top” button

    if(cookieInfo!=null){
        $(goTopBtn).css('bottom', cookieContainerHeight + marginBottom);

        // If the cookie panel hides on the `Agree` button click leave only initial bottom margin
        $(cookieAgreeBtn).click(function(){
            $(goTopBtn).css('bottom', marginBottom);
        });
    }

    else {
        $(goTopBtn).css('bottom', marginBottom);
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
