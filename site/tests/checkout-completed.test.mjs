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
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

// The page-state harness injects module dependencies and browser APIs. A Hugo
// consumer build separately verifies production import resolution and output.
const completedSource = fs.readFileSync(
    new URL('../assets/js/pages/checkout/completed.js', import.meta.url),
    'utf8'
).replace(/^import .*;\n/gm, '');
assert.doesNotMatch(
    completedSource,
    /^\s*import\b/m,
    'completed-page harness did not strip every import'
);
const completedPageUrlSource = fs.readFileSync(
    new URL('../assets/js/pages/checkout/completed-page-url.js', import.meta.url),
    'utf8'
);
const {getCheckoutPageUrl, getCompletedPageUrl} = await import(
    `data:text/javascript,${encodeURIComponent(completedPageUrlSource)}`
);
const completionOrderIdSource = fs.readFileSync(
    new URL('../assets/js/pages/checkout/completion-order-id.js', import.meta.url),
    'utf8'
);
const {getCompletionOrderId} = await import(
    `data:text/javascript,${encodeURIComponent(completionOrderIdSource)}`
);
const viewIds = [
    'payment-in-progress',
    'payment-completed',
    'payment-failed',
    'payment-refunded',
    'payment-charged-back',
    'payment-status-error',
    'payment-order-not-found',
    'payment-status-unknown'
];
const maxPollingDurationMs = 15 * 60 * 1000;


test('keep polling until a pending payment settles', async () => {
    const page = await render([
        {order: {paymentStatus: 'SENT_FOR_PROCESSING', completed: false}},
        {order: {paymentStatus: 'SETTLED', completed: true}}
    ]);

    assert.equal(page.isVisible('payment-in-progress'), true);
    assert.equal(page.scheduledPolls(), 1);
    assert.equal(page.nextPollDelay(), 3000);

    await page.runNextPoll();

    assert.equal(page.isVisible('payment-completed'), true);
    assert.equal(page.scheduledPolls(), 0);
});

test('back off pending polling to a 30-second interval', async () => {
    const pending = {order: {paymentStatus: 'SENT_FOR_PROCESSING', completed: false}};
    const page = await render([pending, pending, pending, pending, pending]);

    assert.equal(page.nextPollDelay(), 3000);
    await page.runNextPoll();
    assert.equal(page.nextPollDelay(), 5000);
    await page.runNextPoll();
    assert.equal(page.nextPollDelay(), 10000);
    await page.runNextPoll();
    assert.equal(page.nextPollDelay(), 30000);
    await page.runNextPoll();
    assert.equal(page.nextPollDelay(), 30000);
});

for (const [status, view] of [
    ['SETTLED', 'payment-completed'],
    ['ABANDONED', 'payment-failed'],
    ['FAILED', 'payment-failed'],
    ['VOIDED', 'payment-failed'],
    ['REFUNDED', 'payment-refunded'],
    ['CHARGED_BACK', 'payment-charged-back']
]) {
    test(`stop polling and show ${view} for ${status}`, async () => {
        const page = await render([{order: {paymentStatus: status, completed: false}}]);

        assert.equal(page.isVisible(view), true);
        assert.equal(page.scheduledPolls(), 0);
    });
}

test('fall back to the legacy completed flag when payment status is absent', async () => {
    const page = await render([{order: {completed: true}}]);

    assert.equal(page.isVisible('payment-completed'), true);
    assert.equal(page.scheduledPolls(), 0);
});

test('show an error after repeated failures and recover to in progress', async () => {
    const page = await render([
        {error: {status: 500, statusText: 'Unavailable'}},
        {error: {status: 500, statusText: 'Unavailable'}},
        {error: {status: 500, statusText: 'Unavailable'}},
        {order: {paymentStatus: 'AUTHORISED', completed: false}}
    ]);

    assert.equal(page.nextPollDelay(), 3000);
    await page.runNextPoll();
    assert.equal(page.nextPollDelay(), 5000);
    await page.runNextPoll();
    assert.equal(page.isVisible('payment-status-error'), true);
    assert.equal(page.nextPollDelay(), 10000);

    await page.runNextPoll();
    assert.equal(page.isVisible('payment-in-progress'), true);
    assert.equal(page.scheduledPolls(), 1);
    assert.equal(page.nextPollDelay(), 30000);
});

test('stop a retry chain when a terminal status arrives', async () => {
    const page = await render([
        {error: {status: 503, statusText: 'Unavailable'}},
        {order: {paymentStatus: 'FAILED', completed: false}}
    ]);

    assert.equal(page.nextPollDelay(), 3000);
    await page.runNextPoll();

    assert.equal(page.requests(), 2);
    assert.equal(page.isVisible('payment-failed'), true);
    assert.equal(page.scheduledPolls(), 0);
    assert.equal(page.nextPollDelay(), undefined);
});

test('link a failed payment back to its checkout', async () => {
    const page = await render([
        {order: {paymentStatus: 'FAILED', completed: false}}
    ]);

    assert.equal(page.isVisible('payment-failed'), true);
    assert.equal(page.backToCheckoutHidden(), false);
    assert.equal(
        page.backToCheckoutHref(),
        'https://example.com/checkout/?orderId=current-order'
    );
});

test('retry one not-found response before recovering', async () => {
    const page = await render([
        {error: {status: 404, statusText: 'Not Found'}},
        {order: {paymentStatus: 'SETTLED', completed: true}}
    ]);

    assert.equal(page.isVisible('payment-in-progress'), true);
    assert.equal(page.scheduledPolls(), 1);

    await page.runNextPoll();

    assert.equal(page.isVisible('payment-completed'), true);
    assert.equal(page.scheduledPolls(), 0);
});

test('stop polling after two consecutive not-found responses', async () => {
    const notFound = {error: {status: 404, statusText: 'Not Found'}};
    const page = await render([notFound, notFound]);

    assert.equal(page.isVisible('payment-in-progress'), true);
    assert.equal(page.scheduledPolls(), 1);

    await page.runNextPoll();

    assert.equal(page.isVisible('payment-order-not-found'), true);
    assert.equal(page.scheduledPolls(), 0);
});

test('reset the not-found count after another response', async () => {
    const notFound = {error: {status: 404, statusText: 'Not Found'}};
    const page = await render([
        notFound,
        {error: {status: 503, statusText: 'Unavailable'}},
        notFound,
        notFound
    ]);

    await page.runNextPoll();
    await page.runNextPoll();
    assert.equal(page.isVisible('payment-in-progress'), true);

    await page.runNextPoll();
    assert.equal(page.isVisible('payment-order-not-found'), true);
    assert.equal(page.requests(), 4);
});

test('stop polling after 15 minutes and show a neutral result', async () => {
    const pending = Array.from({length: 40}, () => ({
        order: {paymentStatus: 'SENT_FOR_PROCESSING', completed: false}
    }));
    const page = await render(pending);

    while (!page.isVisible('payment-status-unknown')) {
        await page.runNextTimer();
    }

    assert.equal(page.elapsedMs(), maxPollingDurationMs);
    assert.ok(page.requests() < 40);
    assert.equal(page.scheduledPolls(), 0);
    assert.equal(page.scheduledTimers(), 0);
});

test('apply the 15-minute deadline to a hanging request', async () => {
    const page = await render([{pending: true}]);

    assert.equal(page.isVisible('payment-in-progress'), true);
    assert.equal(page.scheduledPolls(), 0);
    assert.equal(page.nextTimerDelay(), maxPollingDurationMs);

    await page.runNextTimer();

    assert.equal(page.isVisible('payment-status-unknown'), true);
    assert.equal(page.scheduledTimers(), 0);
});

test('show a neutral result without polling when the order ID is absent', async () => {
    const page = await render([], '');

    assert.equal(page.isVisible('payment-status-unknown'), true);
    for (const view of viewIds.filter(view => view !== 'payment-status-unknown')) {
        assert.equal(page.isVisible(view), false);
    }
    assert.equal(page.requests(), 0);
    assert.equal(page.scheduledPolls(), 0);
    assert.equal(page.backToCheckoutHidden(), true);
});

test('keep the neutral result when payment configuration is absent', async () => {
    const page = await render([], '?orderId=current-order', {params: {}});

    assert.equal(page.isVisible('payment-status-unknown'), true);
    assert.equal(page.clientCreations(), 0);
    assert.equal(page.requests(), 0);
    assert.equal(page.scheduledTimers(), 0);
});

test('keep the neutral result when the payment client cannot initialize', async () => {
    const page = await render([], '?orderId=current-order', {
        clientError: new Error('Client initialization failed')
    });

    assert.equal(page.isVisible('payment-status-unknown'), true);
    assert.equal(page.clientCreations(), 1);
    assert.equal(page.requests(), 0);
    assert.equal(page.scheduledTimers(), 0);
});

test('keep the order ID in the visible URL', () => {
    const initialUrl = 'https://example.com/checkout-completed/' +
        '?campaign=sale&orderId=current-order&orderId=ignored#result';
    const browser = createBrowserState(initialUrl);

    const orderId = getCompletionOrderId(browser.location);

    assert.equal(orderId, 'current-order');
    assert.equal(browser.location.href, initialUrl);
});

test('carry only the order ID to a directory completion URL', () => {
    const actual = getCompletedPageUrl(
        'https://example.com/checkout/?orderId=current-order&campaign=sale#form',
        'current-order'
    );

    assert.equal(
        actual,
        'https://example.com/checkout-completed/?orderId=current-order'
    );
});

test('carry only the order ID back to a directory checkout URL', () => {
    const actual = getCheckoutPageUrl(
        'https://example.com/checkout-completed/?campaign=sale#result',
        'current-order'
    );

    assert.equal(
        actual,
        'https://example.com/checkout/?orderId=current-order'
    );
});

test('reject a non-completion URL as a checkout-link source', () => {
    assert.equal(
        getCheckoutPageUrl(
            'https://example.com/payment-result/?orderId=current-order',
            'current-order'
        ),
        ''
    );
});

/**
 * Runs the completion page against predefined order API results.
 *
 * @param {Array<Object>} responses order responses or request errors
 * @param {string} [search] completion-page query string
 * @param {Object} [options] harness overrides
 * @return {Promise<Object>} page-state test harness
 */
async function render(
    responses,
    search = '?orderId=current-order',
    options = {}
) {
    const views = Object.fromEntries(
        viewIds.map(id => [id, {hidden: id !== 'payment-status-unknown'}])
    );
    const backToCheckoutLink = {hidden: true, href: ''};
    const scheduled = new Map();
    const queuedResponses = [...responses];
    let currentTimeMs = 0;
    let nextTimerId = 1;
    let deadlineTimerId;
    let clientCreations = 0;
    let requests = 0;
    const browser = createBrowserState(
        `https://example.com/checkout-completed/${search}`,
        options.historyState || null
    );
    const context = {
        params: Object.hasOwn(options, 'params') ? options.params : {
            payment: {paygateurl: 'https://paygate.example'}
        },
        createPurchaseClient: () => {
            clientCreations += 1;
            if (options.clientError) {
                throw options.clientError;
            }
            return {
                async getOrder() {
                    requests += 1;
                    const response = queuedResponses.shift();
                    assert.ok(response, 'unexpected payment-status request');
                    if (response.pending) {
                        return new Promise(() => {});
                    }
                    if (response.error) {
                        throw response.error;
                    }
                    return response.order;
                }
            };
        },
        getCheckoutPageUrl,
        getCompletionOrderId,
        document: {
            querySelector: selector => {
                if (selector === '[data-payment-status-page]') {
                    return {};
                }
                if (selector === '#payment-failed [data-back-to-checkout]') {
                    return backToCheckoutLink;
                }
                return null;
            },
            getElementById: id => views[id]
        },
        window: {
            location: browser.location,
            history: browser.history,
            setTimeout(callback, delay) {
                const timerId = nextTimerId;
                nextTimerId += 1;
                if (delay === maxPollingDurationMs) {
                    assert.equal(
                        deadlineTimerId,
                        undefined,
                        'expected only one polling deadline timer'
                    );
                    deadlineTimerId = timerId;
                }
                scheduled.set(timerId, {
                    callback,
                    dueAt: currentTimeMs + delay,
                    timerId
                });
                return timerId;
            },
            clearTimeout: timerId => scheduled.delete(timerId)
        },
        Date: {now: () => currentTimeMs},
        console: {error: () => {}},
    };

    vm.runInNewContext(completedSource, context);
    await settleAsyncWork();

    return {
        isVisible: id => views[id].hidden === false,
        backToCheckoutHidden: () => backToCheckoutLink.hidden,
        backToCheckoutHref: () => backToCheckoutLink.href,
        clientCreations: () => clientCreations,
        requests: () => requests,
        elapsedMs: () => currentTimeMs,
        scheduledPolls: () =>
            getScheduledPolls(scheduled, deadlineTimerId).length,
        scheduledTimers: () => scheduled.size,
        nextPollDelay: () => {
            const nextPoll = getScheduledPolls(
                scheduled,
                deadlineTimerId
            )[0];
            return nextPoll ? nextPoll.dueAt - currentTimeMs : undefined;
        },
        nextTimerDelay: () => {
            const nextTimer = getScheduledTimers(scheduled)[0];
            return nextTimer ? nextTimer.dueAt - currentTimeMs : undefined;
        },
        async runNextPoll() {
            const poll = getScheduledPolls(scheduled, deadlineTimerId)[0];
            assert.ok(poll, 'expected another polling attempt');
            await runTimer(poll);
        },
        async runNextTimer() {
            const timer = getScheduledTimers(scheduled)[0];
            assert.ok(timer, 'expected another scheduled timer');
            await runTimer(timer);
        }
    };

    /**
     * Runs one browser timer and lets its promise continuations settle.
     *
     * @param {Object} timer scheduled timer
     * @return {Promise<void>} resolves after asynchronous page work settles
     */
    async function runTimer(timer) {
        scheduled.delete(timer.timerId);
        currentTimeMs = timer.dueAt;
        timer.callback();
        await settleAsyncWork();
    }
}

/**
 * Returns scheduled timers in browser execution order.
 *
 * @param {Map<number, Object>} scheduled timers by ID
 * @return {Array<Object>} ordered timers
 */
function getScheduledTimers(scheduled) {
    return [...scheduled.values()].sort((left, right) =>
        left.dueAt - right.dueAt || left.timerId - right.timerId
    );
}

/**
 * Returns only timers that trigger another status request.
 *
 * @param {Map<number, Object>} scheduled timers by ID
 * @param {number|undefined} deadlineTimerId polling deadline timer ID
 * @return {Array<Object>} ordered polling timers
 */
function getScheduledPolls(scheduled, deadlineTimerId) {
    return getScheduledTimers(scheduled).filter(
        timer => timer.timerId !== deadlineTimerId
    );
}

/**
 * Creates location and history fakes whose URLs stay in sync.
 *
 * @param {string} href initial browser URL
 * @param {Object|null} state initial history state
 * @return {{location: Object, history: Object}} browser state
 */
function createBrowserState(href, state = null) {
    const location = {href};
    const history = {state};
    return {location, history};
}

/**
 * Waits for promise continuations started by the page script.
 */
function settleAsyncWork() {
    return new Promise(resolve => setImmediate(resolve));
}
