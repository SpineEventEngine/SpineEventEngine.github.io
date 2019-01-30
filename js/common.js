// Mobile navigation toggle
$('#nav-icon-menu').click(function(){
    $(this).toggleClass('open');
    $('body').toggleClass('navigation-opened');
});

// Mobile footer navitation
$('.toggle').click(function(){
    $(this).toggleClass('active');
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

// Collapsible navbar menu, using https://github.com/jordnkr/collapsible
$.getScript("/js/jquery.collapsible.js", function(){
  highlightActive();
  $('.submenu').collapsible();
});

// Remove class from the paren element when the child is active
$(function() {
    if ($('#doc-side-nav-inside a').hasClass('current')) {
        var element = document.getElementById('side-nav-parent-item');
        element.classList.remove('current');
    }
});

var InitialHeadHeight = $("#header").innerHeight();
var tocNav = $('#toc');
var initialFooterHeight = $(".footer").innerHeight();
var headerFixPosition = $(".nav-hero-container").innerHeight();
var cookieContainerHeight = $("#cookieChoiceInfo").innerHeight();
var tocNavFixedPosition = 120; // Sticky TOC offset


$(function() {
// Calls the tocify method on your HTML nav.
// InitialHeadHeight + 12 (12px — small offset from the header navigation)
    tocNav.tocify({selectors:"h2, h3, h4", showAndHide: false, scrollTo: InitialHeadHeight+12, extendPage: false});
});

window.onscroll = function() {
    FixToc();
    FixHead();
    TocHeight();
};

// Fix TOC navigation on page while scrolling
function FixToc() {
    if (tocNav.length > 0) {
        if (window.pageYOffset > tocNavFixedPosition) {
            tocNav.addClass("sticky");
        }
        else {
            tocNav.removeClass("sticky");
        }
    }
}

//Animation header on scroll
function FixHead() {
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
        if (window.pageYOffset < InitialHeadHeight) {
            header.removeClass("not-top");
            header.removeClass("unpinned");
        }
    }
}

function TocHeight() {
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
$( window ).resize(function() {
    if ($(window).height() > 600) {
        TocHeight();
    }
});
