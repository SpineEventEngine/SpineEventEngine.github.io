# Checkout libraries

The checkout uses locally hosted copies of these browser libraries:

- [Select2 4.1.0-rc.0](https://github.com/select2/select2/releases/tag/4.1.0-rc.0)
  (`country-select/select2.js`), under the MIT license.
- [intl-tel-input 18.2.1](https://github.com/jackocnr/intl-tel-input/releases/tag/v18.2.1)
  (`intl-tel-input/intlTelInput.js` and `utils.js`), under the MIT license.

Their CSS distributions live under `site/assets/scss/libs/`. Hugo compiles the CSS
into the site stylesheet and fingerprints the JavaScript resources in production.
The generated script tags include Subresource Integrity metadata. The original
library license notices remain in the distributed files.

Library version changes require a dedicated dependency update and checkout UI
regression testing.
