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
