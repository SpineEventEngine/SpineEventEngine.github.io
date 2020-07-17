
/**
 * Builds and runs the site locally.
 */
task<Exec>("runSite") {
    commandLine("./_script/jekyll-serve")
}

task<Exec>("buildSite") {
    commandLine("./_script/jekyll-build")
}
