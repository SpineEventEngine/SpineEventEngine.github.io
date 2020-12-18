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

import io.spine.core.CommandContext;
import io.spine.site.home.Task;
import io.spine.site.home.TaskId;
import io.spine.site.home.command.AssignTask;
import io.spine.site.home.command.CompleteTask;
import io.spine.site.home.command.CreateTask;
import io.spine.site.home.event.TaskAssigned;
import io.spine.site.home.event.TaskCompleted;
import io.spine.site.home.event.TaskCreated;
import io.spine.server.aggregate.Aggregate;
import io.spine.server.aggregate.Apply;
import io.spine.server.command.Assign;

final class TaskAggregate extends Aggregate<TaskId, Task, Task.Builder> {

    @Assign
    TaskCreated handle(CreateTask cmd, CommandContext ctx) {
        return TaskCreated.newBuilder()
                    .setTask(cmd.getId())
                    .setName(cmd.getName())
                    .setDescription(cmd.getDescription())
                    .setOwner(ctx.getActorContext().getActor())
                    .vBuild(); // validate the event
    }

    @Apply
    private void event(TaskCreated e) {
        builder().setName(e.getName())
                 .setDescription(e.getDescription())
                 .setOwner(e.getOwner());
    }

    @Assign
    TaskCompleted handle(CompleteTask cmd) {
        return TaskCompleted.newBuilder()
                .setTask(cmd.getTask())
                .vBuild();
    }

    @Apply
    private void event(TaskCompleted e) {
        setArchived(true);
    }

    @Assign
    TaskAssigned handle(AssignTask cmd) {
        return TaskAssigned.newBuilder()
                .setAssignee(cmd.getAssignee())
                .vBuild();
    }

    @Apply
    private void event(TaskAssigned e) {
        builder().setAssignee(e.getAssignee());
    }
}
