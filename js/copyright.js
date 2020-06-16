/**
 * Displays the current year automatically.
 */
function copyrightYear() {
    var d = new Date();
    var y = d.getFullYear();
    document.getElementById("copyright").innerHTML = '&copy; 2015 – ' + y;
}

copyrightYear();
