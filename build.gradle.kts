
/**
 * Builds and runs the site locally.
 */
task<Exec>("runSite") {
    commandLine("./_script/jekyll-serve")
}

/**
 * Builds the site without starting the server.
 */
task<Exec>("buildSite") {
    commandLine("./_script/jekyll-build")
}

/**
 * Builds all included projects via depending on the top-level "buildAll" tasks
 * declared in these proejcts.
 *
 * @see https://discuss.gradle.org/t/defining-a-composite-build-only-to-build-all-subprojects/25070/6
 * @see https://github.com/AlexMAS/gradle-composite-build-example
 * @see https://docs.gradle.org/current/userguide/composite_builds.html
 */
tasks.register("buildAll")  {
    dependsOn(gradle.includedBuilds.map { it.task(":buildAll") })
}
