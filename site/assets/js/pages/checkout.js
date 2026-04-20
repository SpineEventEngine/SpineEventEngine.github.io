/*
 * Copyright 2026, TeamDev. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Redistribution and use in source and/or binary forms, with or without
 * modification, must retain the above copyright notice and the following
 * disclaimer.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

$(
    function () {
        const $form = $('#checkout-form');
        const $submitButton = $('#checkout-submit');

        if (!$form.length || !$submitButton.length) {
            return;
        }

        const form = $form.get(0);
        const requiredSelector = 'input[required], select[required], textarea[required]';
        $form.on('input change', requiredSelector, event => {
            validateField(event.target);
        });

        $form.on('submit', event => {
            event.preventDefault();

            const hasErrors = !validateRequiredFields();
            if (hasErrors) {
                form.reportValidity();
                return;
            }

            const payload = Object.fromEntries(new FormData(form).entries());
            const endpoint = $form.attr('action');

            if (!endpoint || endpoint === '#') {
                console.log('Checkout payload:', payload);
                return;
            }

            $.ajax(endpoint, {
                type: 'POST',
                data: JSON.stringify(payload),
                contentType: 'application/json',
                success: response => {
                    const redirectUrl = response.redirectUrl || response.url || response.link;

                    if (redirectUrl) {
                        window.location = redirectUrl;
                    } else {
                        console.log('Checkout response:', response);
                    }
                },
                error: jqXhr => {
                    console.error(`${jqXhr.status}: ${jqXhr.statusText}`);
                }
            });
        });

        function validateRequiredFields() {
            const requiredFields = Array.from(form.querySelectorAll(requiredSelector));
            let isValid = true;

            requiredFields.forEach(field => {
                const fieldValid = validateField(field);
                if (!fieldValid) {
                    isValid = false;
                }
            });

            return isValid;
        }

        function validateField(field) {
            if (!field) {
                return true;
            }

            const fieldContainer = field.closest('.checkout-form__field');
            if (!fieldContainer) {
                return true;
            }

            const errorElement = getOrCreateError(fieldContainer);
            const value = field.value ? field.value.trim() : '';
            let message = '';

            if (field.required && !value) {
                message = 'This field is required.';
            } else if (field.type === 'email' && value && !field.validity.valid) {
                message = 'Enter a valid email address.';
            }

            fieldContainer.classList.toggle('field-error', Boolean(message));
            errorElement.textContent = message;

            return !message;
        }

        function getOrCreateError(fieldContainer) {
            let errorElement = fieldContainer.querySelector('.error-message');

            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                fieldContainer.appendChild(errorElement);
            }

            return errorElement;
        }
    }
);
