'use strict';

/**
 * This script contains helper functions to show and hide the snackbar notification
 * at the left bottom corner.
 */
const $snackbar = $('.snackbar');
const $snackbarText = $('.snackbar span');
let snackbarTimeout;

/**
 * Shows the snackbar notification.
 *
 * The snackbar will be hidden automatically after 3 seconds.
 *
 * @param {String} textToShow text that will be shown in the snackbar.
 */
function showSnackbar(textToShow) {
    verifySnackbarPosition();

    $snackbarText.text(textToShow);
    $snackbar.addClass('show');

    snackbarTimeout = setTimeout(function() {
            hideSnackbar();
        }, 3000
    );
}

/**
 * Hides the snackbar forcibly.
 */
function hideSnackbar() {
    clearTimeout(snackbarTimeout);

    if ($snackbar.hasClass('show')) {
        $snackbar.removeClass('show');
    }
}

/**
 * Changes the snackbar bottom position if the cookie info panel exists on the page.
 */
function verifySnackbarPosition() {
    const cookieInfo = $('#cookieChoiceInfo');
    let root = document.documentElement;

    if (cookieInfo.length) {
        root.style.setProperty('--snackbar-bottom-position', '80px');
    } else {
        root.style.setProperty('--snackbar-bottom-position', '32px');
    }
}
