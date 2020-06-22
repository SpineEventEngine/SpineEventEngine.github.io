'use strict';

const head = document['head'] || document.getElementsByTagName("head")[0] || root;
const header = $('#header');
const $body = $('body');
const initialHeadHeight = header.innerHeight();
const tocNav = $('#toc');
const headerFixPosition = $('.nav-hero-container').innerHeight();
const goTopBtn = $('#go-top-btn');
const copyrightEl = $('.copyright');
const $pre = $('pre');
const topOffset = 12; // Offset from the `header` navigation
const scrollToOffset = initialHeadHeight + topOffset;
const mobileSearchOpenedClass = 'mobile-search-opened';

/** Pages */
const isFaqPage = $body.is('.faq');
const isDocsPage = $body.is('.docs');
const isPromoPage = $body.is('.promo-page');

/** Code color variables */
const $colorSelector = $('.color-selector');
const $colorSelectorLinks = $('.color-selector .color-link');
const $selectorDark = $('.color-link.dark');
const $selectorLight = $('.color-link.light');
const colorDark = 'dark';
const colorLight = 'light';
const cookieColorName = 'themeColor';
const codeStylePath = '/libs/rouge/skins/';
const darkStylesUrl = codeStylePath + 'dark-theme.css';
const lightStylesUrl = codeStylePath + 'light-theme.css';

/** Grid breakpoints */
const windowHeightMobile = 520;
const phoneMedium = 480;
const phoneXLarge = 640;
const tablet = 767;

/**
 * Screen size on which the mobile search will be shown.
 * The same value should be used in the `_nav-search.scss` file for the
 * `$mobile-search-max-size` variable.
 */
const mobileSearchScreenSize = tablet;

$(function() {
    fixHead();
    changeCodeColor();
    openHeaderMenuOnMobile();
    openSearchPanelOnMobile();
    closeSearchPanelOnMobile();
    addExternalClass();
    initTocTocify();
    showScrollTopBtn();
    fixStickyElement();
    showCodeColorSelector();
    initBootstrapTooltips();

    if (isFaqPage) {
        expandItemOnHashChange();
    }
});

jQuery(window).on('load', function() {
    ifCookiesExist();
    setStickyElMaxHeight();
    onDocHeadingAnchorClick();

    if (isFaqPage) {
        onFaqAnchorClick();
    }

    scrollToAnchor();
});

window.onhashchange = function() {
    scrollToAnchor();

    if (isFaqPage) {
        expandItemOnHashChange();
    }
};

window.onscroll = function() {
    fixStickyElement();
    fixHead();
    setStickyElMaxHeight();
    showScrollTopBtn();

    if (isPromoPage) {
        showCodeColorSelectorOnPromoPage();
    }
};

$(window).resize(function() {
    resizeStickyElHeightWithWindow();
    ifCookiesExist();
    fixHead();
    setColorSelectorTopPosition();
    removeMobileSearchPanelOnResize();

    if (isPromoPage) {
        showCodeColorSelectorOnPromoPage();
    }
});

/**
 * Adds anchor links to headings on `Docs` pages.
 */
document.addEventListener('DOMContentLoaded', function(event) {
    if (isDocsPage) {
        anchors.add();
    }
});

/**
 * Changes code color theme by clicking on the `color-selector` icons.
 *
 * <p>On page load, the color will be set from the cookie value. If the cookie value is `null`
 * will be set default cookie value.
 */
function changeCodeColor() {
    const cookieValue = Cookies.get(cookieColorName);

    if (cookieValue == null) {
        setDefaultCookieValue();
    } else {
        colorDark === cookieValue && setDarkTheme();
        colorLight === cookieValue && setLightTheme();
    }

    $selectorDark.click(function() {
        setDarkTheme();
    });

    $selectorLight.click(function() {
        setLightTheme();
    })
}

/**
 * Sets default cookie value for the `code` color as `dark`.
 */
function setDefaultCookieValue() {
    Cookies.set(cookieColorName, colorDark);
    setDarkTheme();
}

/**
 * Sets dark theme color.
 */
function setDarkTheme() {
    loadCodeStyles(darkStylesUrl);
    $pre.css('opacity', '1');
    makeSelectorActive($selectorDark, colorDark);
}

/**
 * Sets light theme color.
 */
function setLightTheme() {
    loadCodeStyles(lightStylesUrl);
    $pre.css('opacity', '1');
    makeSelectorActive($selectorLight, colorLight);
}

/**
 * Loads theme style sheets to highlight the code.
 *
 * <p>`<style>` tag with the `#code-highlight-styles` ID will be created in the `head` of the
 * document. If the tag is already exist it will be updated depending on the selected theme color.
 * Style files are located in the `/libs/rouge/skins/` folder.
 *
 * @param {string} stylesHref `href` to the `css` file
 */
function loadCodeStyles(stylesHref) {
    const $codeStyles = $('#code-highlight-styles');

    if ($codeStyles.length) {
        $codeStyles.attr('href', stylesHref);
    } else {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.id = 'code-highlight-styles';
        link.type = 'text/css';
        link.href = stylesHref;
        head.appendChild(link);
    }
}

/**
 * Makes color selector active and sets the value to the `cookie`.
 *
 * @param {Object} selector color selector DOM element
 * @param {string} color color value
 */
function makeSelectorActive(selector, color) {
    $colorSelectorLinks.removeClass('active');
    selector.addClass('active');
    Cookies.set(cookieColorName, color);
}

/**
 * Shows the code color selector if there is a `pre` tag on the page and the scroll position
 * under the header.
 */
function showCodeColorSelector() {
    const isPreElementExist = $pre.length;

    setColorSelectorTopPosition();

    if (isPreElementExist) {
        if (isPromoPage) {
            showCodeColorSelectorOnPromoPage();
        } else {
            $colorSelector.addClass('show');
        }
    } else {
        $colorSelector.removeClass('show');
    }
}

/**
 * Sets the top position of the `color-selector` depending on the screen size.
 */
function setColorSelectorTopPosition() {
    const inMiddleOnMobile = 42 + '%';
    const topOffset = 24;
    const docsTopPosition = headerFixPosition + topOffset;
    const isWindowHeightMobile = $(window).height() < windowHeightMobile;

    if (isDocsPage && !isWindowHeightMobile) {
        $colorSelector.css('top', docsTopPosition);
    } else {
        $colorSelector.css('top', inMiddleOnMobile);
    }
}

/**
 * Shows `color-selector` on promo page only if it doesn't overlap the `hero` section.
 *
 * <p>If it overlaps `hero` section it will be shown when scroll position below the `hero`.
 * It also works for the screens with small height.
 */
function showCodeColorSelectorOnPromoPage() {
    const phoneScreenWidth = phoneMedium;
    const phoneScreenHeight = windowHeightMobile;
    const isPhone = $(window).width() <= phoneScreenWidth;
    const isPhoneHorizontal = $(window).height() <= phoneScreenHeight;
    const scrollPositionUnderHero = window.pageYOffset > headerFixPosition;
    const isPhoneAndUnderHero = isPhone && scrollPositionUnderHero;
    const isPhoneHorizontalAndUnderHero = isPhoneHorizontal && scrollPositionUnderHero;

    if (isPromoPage) {
        if (isPhoneAndUnderHero || isPhoneHorizontalAndUnderHero || !isPhone && !isPhoneHorizontal) {
            $colorSelector.addClass('show');
        } else {
            $colorSelector.removeClass('show');
        }
    }
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
 * Adds the `mobileSearchOpened` body class by clicking on the `Search` icon
 * on mobile devices.
 *
 * <p>The CSS will open a search bar in the full width of the menu.
 * Also, the search field becomes in focus.
 */
function openSearchPanelOnMobile() {
    $('.mobile-search-panel').click(function() {
        $body.addClass(mobileSearchOpenedClass);
        $('#search-field').focus();
    });
}

/**
 * Removes the `mobileSearchOpened` body class by clicking on the close icon.
 *
 * <p>The CSS hides the open full-width search bar on mobile devices.
 */
function closeSearchPanelOnMobile() {
    $('#close-mobile-search-panel').click(function() {
        $body.removeClass(mobileSearchOpenedClass);
    });
}

/**
 * Removes the `mobileSearchOpened` body class on window resize.
 *
 * <p>It is needed for the correct search work if for some reason the body
 * class remains visible on desktop screen sizes.
 */
function removeMobileSearchPanelOnResize() {
    const mobileWindow = $(window).width() <= mobileSearchScreenSize;

    if (!mobileWindow) {
        $body.removeClass(mobileSearchOpenedClass);
    }
}

/**
 * Adds the `external` class to every outbound link on the site.
 * Also, adds `target="_blank"` attribute that opens markdown links in the new
 * browser tab.
 *
 * <p>The css will add a small right arrow after the link.
 */
function addExternalClass() {
    $('a').filter(function() {
        return this.hostname && this.hostname !== location.hostname;
    }).addClass('external').attr('target', '_blank');
}

/**
 * Inits `toc` navigation if a page has more than 2 headers.
 *
 * @see {@link http://gregfranko.com/jquery.tocify.js/ Toc Tocify}
 */
function initTocTocify() {
    const articleContainer = $('.article-container');
    const headersQuantity = articleContainer.find('h2, h3, h4');

    if (headersQuantity.length >= 3) {
        tocNav.tocify({
            context: articleContainer,
            selectors: 'h2, h3, h4',
            showAndHide: false,
            scrollTo: scrollToOffset,
            extendPage: false,
            smoothScroll: false,
            hashGenerator: function(text, element) {
                let hashValue = text.replace(/\s+/g, '-').toLowerCase();
                hashValue = hashValue.replace(/[.,\/#!$%\^&\*;:{}=\_`~()]/g,"");
                return hashValue;
            }
        });
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
    const mobileSize = phoneXLarge;
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
 * Expands collapsed item on hash change.
 */
function expandItemOnHashChange() {
    if ('onhashchange' in window) {
        $(location.hash).collapse('show');
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
    if ($(window).scrollTop() > 1500 ) {
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

/**
 * Inits Bootstrap tooltips.
 *
 * <p>Don't init tooltips if it is a touch device.
 */
function initBootstrapTooltips() {
    const options = {
        delay: { "show": 750, "hide": 100 },
        trigger: 'hover'
    };

    if(isTouchDevice() === false) {
        $('[data-toggle = "tooltip"]').tooltip(options);
    }
}

/**
 * Determines if it is a touch device.
 *
 * @return {boolean} true if it is a touch device, false otherwise
 */
function isTouchDevice() {
    return true === ('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch);
}

/**
 * Copies a text to the clipboard and shows the snackbar.
 *
 * @param {String} textToCopy text that will be copied to the clipboard
 */
function copyToClipboard(textToCopy) {
    const dummy = document.createElement('input');

    hideSnackbar();
    document.body.appendChild(dummy);
    dummy.value = textToCopy;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    showSnackbar('Copied to clipboard');
}
