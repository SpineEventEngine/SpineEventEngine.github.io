
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
