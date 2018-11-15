/*
 Copyright 2014 Google Inc. All rights reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

(function(window) {

    if (!!window.cookieChoices) {
        return window.cookieChoices;
    }

    var cookieChoices = (function() {

        var cookieName = 'displayCookieConsent';
        var cookieConsentId = 'cookieChoiceInfo';
        var dismissLinkId = 'cookieChoiceDismiss';
        var dismissTextId = 'cookieChoiceDismissText';
        var dismissTextMobId = 'cookieChoiceDismissTextMob';
        var contentTextId = 'contentText';

        function showCookieBar(data) {

            if (typeof data != 'undefined' && typeof data.linkHref != 'undefined') {

                data.position = data.position || "bottom";
                data.styles = data.styles || 'position:fixed; width:100%; background-color:rgba(238, 238, 238, 0.9); margin:0; left:0; ' + data.position + ':0; padding:4px; z-index:1000; text-align:center;';

                _showCookieConsent(data.cookieText, data.dismissText, data.dismissTextAlt, data.linkText, data.linkHref, data.styles, false);

            }

        }

        function _createHeaderElement(cookieText, dismissText, dismissTextAlt, linkText, linkHref, styles) {
            var butterBarStyles = styles;
            var cookieConsentElement = document.createElement('div');
            var wrapper = document.createElement('div');
            document.body.classList.add("cookieChoices");



            cookieConsentElement.id = cookieConsentId;
            cookieConsentElement.style.cssText = butterBarStyles;

            wrapper.appendChild(_createConsentText(cookieText, linkText, linkHref));
            wrapper.appendChild(_createDismissLink(dismissText, dismissTextAlt));

            cookieConsentElement.appendChild(wrapper);

            return cookieConsentElement;
        }

        function _createDialogElement(cookieText, dismissText, linkText, linkHref) {
            var glassStyle = 'position:fixed;width:100%;height:100%;z-index:999;' +
                'top:0;left:0;opacity:0.5;filter:alpha(opacity=50);' +
                'background-color:#ccc;';
            var dialogStyle = 'z-index:1000;position:fixed;left:50%;top:50%';
            var contentStyle = 'position:relative;left:-50%;margin-top:-25%;' +
                'background-color:#fff;padding:20px;box-shadow:4px 4px 25px #888;';

            var cookieConsentElement = document.createElement('div');
            cookieConsentElement.id = cookieConsentId;

            var glassPanel = document.createElement('div');
            glassPanel.style.cssText = glassStyle;

            var content = document.createElement('div');
            content.style.cssText = contentStyle;

            var dialog = document.createElement('div');
            dialog.style.cssText = dialogStyle;

            var dismissLink = _createDismissLink(dismissText);
            dismissLink.style.display = 'block';
            dismissLink.style.textAlign = 'right';
            dismissLink.style.marginTop = '8px';

            content.appendChild(_createConsentText(cookieText));
            if (!!linkText && !!linkHref) {
                content.appendChild(_createInformationLink(linkText, linkHref));
            }
            content.appendChild(dismissLink);
            dialog.appendChild(content);
            cookieConsentElement.appendChild(glassPanel);
            cookieConsentElement.appendChild(dialog);
            return cookieConsentElement;
        }

        function _setElementText(element, text) {
             element.innerHTML = text;
        }

        function _createConsentText(cookieText, linkText, linkHref) {
            var consentText = document.createElement('span');
            _setElementText(consentText, cookieText);
            consentText.id = contentTextId;
            if (!!linkText && !!linkHref) {
                consentText.appendChild(_createInformationLink(linkText, linkHref));
            }

            return consentText;
        }

        function _createDismissLink(dismissText, dismissTextAlt) {
            var dismissLink = document.createElement('span');

            var dismissLinkWrapper = document.createElement('span');
            dismissLinkWrapper.appendChild(dismissLink);
            dismissLinkWrapper.id = dismissLinkId;

            var dismissLinkText = document.createElement('span');
            dismissLinkText.id = dismissTextId;
            var dismissLinkTextAlt = document.createElement('span');
            dismissLinkTextAlt.id = dismissTextMobId;

            _setElementText(dismissLinkText, dismissText);
            _setElementText(dismissLinkTextAlt, dismissTextAlt);

            dismissLinkWrapper.appendChild(dismissLinkText);
            dismissLinkWrapper.appendChild(dismissLinkTextAlt);

            return dismissLinkWrapper;
        }

        function _createInformationLink(linkText, linkHref) {
            var infoLink = document.createElement('a');
            _setElementText(infoLink, linkText);
            infoLink.id = 'external-page'
            infoLink.href = linkHref;
            infoLink.target = '_blank';
            infoLink.style.marginLeft = '4px';
            return infoLink;
        }

        function _dismissLinkClick() {
            _saveUserPreference();
            _removeCookieConsent();
            return false;
        }

        function _showCookieConsent(cookieText, dismissText, dismissTextAlt , linkText, linkHref, styles, isDialog) {
            if (_shouldDisplayConsent()) {
                _removeCookieConsent();
                var consentElement = (isDialog) ?
                    _createDialogElement(cookieText, dismissText, dismissTextAlt, linkText, linkHref) :
                    _createHeaderElement(cookieText, dismissText, dismissTextAlt, linkText, linkHref, styles);
                var fragment = document.createDocumentFragment();
                fragment.appendChild(consentElement);
                document.body.appendChild(fragment.cloneNode(true));
                document.getElementById(dismissLinkId).onclick = _dismissLinkClick;
            }
        }

        function showCookieConsentBar(cookieText, dismissText, dismissTextAlt, linkText, linkHref) {
            _showCookieConsent(cookieText, dismissText, dismissTextAlt, linkText, linkHref, false);
        }

        function showCookieConsentDialog(cookieText, dismissText, dismissTextAlt, linkText, linkHref) {
            _showCookieConsent(cookieText, dismissText, dismissTextAlt, linkText, linkHref, true);
        }

        function _removeCookieConsent() {
            var cookieChoiceElement = document.getElementById(cookieConsentId);
            if (cookieChoiceElement != null) {
                cookieChoiceElement.parentNode.removeChild(cookieChoiceElement);
                document.body.className = document.body.className.replace("cookieChoices","");
            }

        }

        function _saveUserPreference() {
            // Set the cookie expiry to one month after today.
            var expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1);
            document.cookie = cookieName + '=y;path=/; expires=' + expiryDate.toGMTString();
        }

        function _shouldDisplayConsent() {
            // Display the header only if the cookie has not been set.
            return !document.cookie.match(new RegExp(cookieName + '=([^;]+)'));
        }

        var exports = {};
        exports.showCookieBar = showCookieBar;
        exports.showCookieConsentBar = showCookieConsentBar;
        exports.showCookieConsentDialog = showCookieConsentDialog;
        return exports;
    })();

    window.cookieChoices = cookieChoices;
    return cookieChoices;
})(this);
