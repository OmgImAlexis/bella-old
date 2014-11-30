var express = require('express');
var fs = require("fs"),
    http = require("http"),
    url = require("url"),
    path = require("path");
var jade = require("jade");

var app = express();

app.set('views', path.resolve(__dirname + '/views'));
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.render('index');
});

app.get('/movie/:id', function(req, res){
    if (req.headers.range) {
        var file = path.resolve(__dirname,"../1408.mkv");
        var range = req.headers.range;
        var positions = range.replace(/bytes=/, "").split("-");
        var start = parseInt(positions[0], 10);

        fs.stat(file, function(err, stats) {
          var total = stats.size;
          var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
          var chunksize = (end - start) + 1;

          res.writeHead(206, {
            "Content-Range": "bytes " + start + "-" + end + "/" + total,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": "video/mp4"
          });

          var stream = fs.createReadStream(file, { start: start, end: end })
            .on("open", function() {
              stream.pipe(res);
            }).on("error", function(err) {
              res.end(err);
            });
        });
    } else {
        res.status(404).send('Not found');
    }
});

app.listen(80);
