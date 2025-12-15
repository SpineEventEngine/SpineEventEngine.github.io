/**
 * Adds vendor prefixes to CSS.
 *
 * See the `.browserslistrc` file in the root for the actual list of browsers,
 * where `> 0.5%` means all browsers that are used by more than 0.5%
 * of users worldwide. See https://github.com/browserslist/browserslist#queries.
 */
const autoprefixer = require('autoprefixer');

/**
 * Discards comments from the CSS.
 *
 * See https://www.npmjs.com/package/postcss-discard-comments.
 */
const discardComments = require('postcss-discard-comments');

module.exports = {
    plugins: [
        autoprefixer,
        discardComments({removeAllButFirst: true})
    ]
}
