/*
 * Copyright 2026, TeamDev. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const historyStateKey = 'siteCommonsCompletionOrderId';

/**
 * Reads the order ID from the visible payment-result URL.
 *
 * @param {Location|URL} location browser location
 * @param {History} [history] browser history used by older completion URLs
 * @return {string} Paygate order ID, or an empty string when unavailable
 */
export function getCompletionOrderId(location, history) {
    const completionUrl = new URL(location.href);
    if (completionUrl.searchParams.has('orderId')) {
        return (completionUrl.searchParams.get('orderId') || '').trim();
    }

    const retainedOrderId = history && history.state && history.state[historyStateKey];
    return typeof retainedOrderId === 'string' ? retainedOrderId.trim() : '';
}
