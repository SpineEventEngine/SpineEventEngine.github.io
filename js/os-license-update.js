const fs = require('fs');
const http = require("https");

const base = fs.createWriteStream('os-licenses/licenses/base.md');
http.get("https://raw.githubusercontent.com/SpineEventEngine/base/master/license-report.md", response => {
    response.pipe(base);
});

const coreJava = fs.createWriteStream('os-licenses/licenses/core-java.md');
http.get("https://raw.githubusercontent.com/SpineEventEngine/core-java/master/license-report.md", response => {
    response.pipe(coreJava);
});
