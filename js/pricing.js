/**
 * This script contains helper functions for the agreement checkboxes on `Getting Help` page.
 *
 * Please see `/getting-help/service-section.html` for usage.
 */
'use strict';

$(
    function () {
        const $confirmPersonalInformation = $('#confirm-personal-information');
        const $confirmDevelopmentAgreement = $('#confirm-development-agreement');
        const $disabledButton = $('#order-now-btn');

        $confirmPersonalInformation.change(function () {
            confirmAgreement(this, $disabledButton);
        });

        $confirmDevelopmentAgreement.change(function () {
            confirmAgreement(this, $disabledButton);
        });

        function confirmAgreement(element, disabledElement) {
            const isConfirmed = $confirmPersonalInformation.prop('checked') && $confirmDevelopmentAgreement.prop('checked');
            if (isConfirmed) {
                disabledElement.removeAttr('disabled');
                disabledElement.removeClass('disabled');
            } else {
                disabledElement.attr('disabled', true);
                disabledElement.addClass('disabled');
            }
        }
    }
);
