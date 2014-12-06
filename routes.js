var fs = require("fs"),
    http = require("http"),
    url = require("url"),
    path = require("path");

module.exports = function (app) {
    function recursiveRoutes(folderName) {
        fs.readdirSync(folderName).forEach(function(file) {

            var fullName = path.join(folderName, file);
            var stat = fs.lstatSync(fullName);

            if (stat.isDirectory()) {
                recursiveRoutes(fullName);
            } else if (file.toLowerCase().indexOf('.js')) {
                require('./' + fullName)(app);
            }
        });
    }
    recursiveRoutes('routes'); // Initialize it
};
