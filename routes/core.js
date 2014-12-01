var fs = require("fs"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    Show = require('../models/Show');

module.exports = function (app) {
    app.get('/', function(req, res){
        Show.find().exec(function(err, shows) {
            res.render('index', {
                shows: shows
            });
        });
    });

    app.get('/show/:imdbID', function(req, res){
        Show.find({imdbID: req.params.imdbID}).exec(function(err, shows) {
            res.render('index', {
                shows: shows
            });
        });
    });

    app.get('/addShow', function(req, res){
        res.render('addShow');
    });

    app.get('/api/tvDB/:showName', function(req, res){
        var tvDB = require("thetvdb-api"),
            key = "ACC8F24E58B1230C";

        tvDB(key).getSeries(req.params.showName, function(err, data) {
            if (!err){
                var banner = (data.Data.Series[0].banner.split("/"));
                var bannerFileName = banner[banner.length - 1];
                var bannerURL = 'http://thetvdb.com/banners/' + data.Data.Series[0].banner;
                var bannerPath = path.resolve(__dirname + '/../_cache/images/' + bannerFileName);
                if (fs.existsSync(bannerPath)) {
                    console.log('File exists.');
                } else {
                    var file = fs.createWriteStream(bannerPath);
                    var request = http.get(bannerURL, function(response) {
                        response.pipe(file);
                    });
                }
                res.send(data);
            }
        });
    });

    app.get('/addShow/:id', function(req, res){

    });
};
