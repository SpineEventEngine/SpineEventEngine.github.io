/**
 * This script contains helper functions for the collapsible `doc-side-navigation`.
 */
'use strict';

$(
    /** This function is executed upon page load. */
    function() {

        const $body = $('body');
        const mobileSideNavigationOpenedBodyClass = 'docs-side-navigation-opened';
        const $mobileSideNavLink = $('#docs-side-nav-mobile-toggle');
        const $mobileSideNavCloseLink = $('.navigation-title-on-mobile a.close-btn');
        const $sideNavLinkExternal = $('.side-nav-link.external');

        addCollapseAttr();
        expandNavigation();
        openNavLinkInNewTab();

        /**
         * Adds a `data-toggle: collapse` attribute to the link, if a `<li>` element has a child `<ul>` sub-menu.
         *
         * <p>Also, adds `tree-title` and `collapsed` classes that is needed to style opened and collapsed states.
         * CSS styles are located in the `_sass/modules/_doc-side-nav.scss` file.
         */
        function addCollapseAttr() {
            const $collapsibleLink = $('ul.docs-side-nav li ul').siblings('a');
            $collapsibleLink.attr('data-toggle', 'collapse');
            $collapsibleLink.addClass('tree-title collapsed');
        }

        /**
         * Expands document side-navigation to show currently active page.
         *
         * <p>When the user clicks on the link in the side navigation, the page reloads and the navigation collapses.
         * To avoid this, the navigation will be expanded automatically when the page is reloaded.
         */
        function expandNavigation() {
            const $activeItemContainer = $('.sub-nav a.active').parents('.sub-nav');
            $activeItemContainer.addClass('show');
            $activeItemContainer.prev('.side-nav-link.collapsed').removeClass('collapsed');
        }

        /**
         * Opens a document side-navigation link in a new tab if it has an external `href`.
         */
        function openNavLinkInNewTab() {
            $sideNavLinkExternal.attr('target', '_blank');
        }

        /**
         * Adds the body class by clicking on the `Contents` button on mobile devices.
         *
         * <p>The CSS will open a document side navigation as a full page above the content.
         */
        $mobileSideNavLink.click(function(){
            $body.addClass(mobileSideNavigationOpenedBodyClass);
        });

        /**
         * Removes the body class.
         *
         * <p>By clicking on the `close-btn` the CSS will hide the document side navigation.
         */
        $mobileSideNavCloseLink.click(function(){
            $body.removeClass(mobileSideNavigationOpenedBodyClass);
        });
    }
);
