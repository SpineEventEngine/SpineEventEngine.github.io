/*
 * Copyright 2020, TeamDev. All rights reserved.
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

package io.spine.site.home.server;

import io.spine.core.EventContext;
import io.spine.core.Subscribe;
import io.spine.core.UserId;
import io.spine.site.home.TaskId;
import io.spine.site.home.TaskItem;
import io.spine.site.home.event.TaskAssigned;
import io.spine.site.home.event.TaskCompleted;
import io.spine.site.home.event.TaskCreated;
import io.spine.server.projection.Projection;

final class TaskProjection extends Projection<TaskId, TaskItem, TaskItem.Builder> {

    @Subscribe
    void on(TaskCreated e) {
        builder().setName(e.getName())
                 .setDescription(e.getDescription())
                 .setOwner(toPersonName(e.getOwner()));
    }

    @Subscribe
    void on(TaskAssigned e) {
        builder().setAssignee(toPersonName(e.getAssignee()));
    }

    @Subscribe
    void on(TaskCompleted e, EventContext ctx) {
        builder().setWhenDone(ctx.getTimestamp());
    }

    /**
     * Returns always the same mock name because this code is not going to be shown
     * at the site pages.
     */
    private static String toPersonName(@SuppressWarnings("unused") UserId user) {
        return "John Doe";
    }
}
