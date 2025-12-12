/*
 * Copyright 2025, TeamDev. All rights reserved.
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

/**
 * Builds and runs the site locally.
 */
task<Exec>("runSite") {
    commandLine("./_script/hugo-serve")
}

/**
 * Builds the site without starting the server.
 */
task<Exec>("buildSite") {
    commandLine("./_script/hugo-build")
}

/**
 * Embeds the code sames into pages of the site.
 */
task<Exec>("embedCode") {
    commandLine("./_script/embed-code")
}

/**
 * Verifies that the external links used by the site are available.
 */
task<Exec>("checkLinks") {
    commandLine("./_script/proof-links")
}

/**
 * Verifies that the source code samples embedded into the pages are up-to-date.
 */
task<Exec>("checkSamples") {
    commandLine("./_script/check-samples")
}

/**
 * Builds all included projects via depending on the top-level "buildAll" tasks
 * declared in these projects.
 *
 * @see https://discuss.gradle.org/t/defining-a-composite-build-only-to-build-all-subprojects/25070/6
 * @see https://github.com/AlexMAS/gradle-composite-build-example
 * @see https://docs.gradle.org/current/userguide/composite_builds.html
 */
tasks.register("buildAll")  {
    dependsOn(gradle.includedBuilds.map { it.task(":buildAll") })
}
