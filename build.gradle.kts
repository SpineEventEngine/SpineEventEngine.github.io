/*
 * Copyright 2026 CodeMatters, Lda.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

tasks.register<Exec>("runSite") {
    description = "Builds and runs the site locally." +
            " The server is available at http://localhost:1313/ or other port."
    commandLine("./_script/hugo-serve")
}

tasks.register<Exec>("buildSite") {
    description = "Builds the site without starting the server." +
            " The generated files are located in the `public` directory."
    commandLine("./_script/hugo-build")
}

tasks.register<Exec>("checkLinks") {
    description = "Verifies that the external links used by the site are available."
    commandLine("./_script/proof-links")
}
