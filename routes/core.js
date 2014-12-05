var fs = require("fs"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    Show = require('../models/Show'),
    tvDB = require("thetvdb-api"),
    key = "ACC8F24E58B1230C";

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

    app.get('/addShow/:id', function(req, res) {
        tvDB(key).getSeriesById(req.params.id, function(err, data) {
            var show = data.Data.Series;
            Show.update({
                imdbID: show.IMDB_ID
            }, {
                $set: {
                    title: show.SeriesName,
                    imdbID: show.IMDB_ID,
                    bannerImg: show.banner,
                    posterImg: show.poster,
                    network: show.Network
                }
            }, {
                upsert: true
            }, function(err, show) {
                if (err) res.json(500, {
                    error: err
                }); // status 500
                else res.json(show); // status 200
            });
        });
    });

    app.get('/showBanner/:imdbID', function(req, res){
        Show.find({imdbID: req.params.imdbID}, function(err, data){
            var banner = (data[0].bannerImg.split("/"));
            var bannerFileName = banner[1];
            res.sendFile(path.join(__dirname, '../_cache/images', bannerFileName));
        })
    });

    app.get('/api/tvDB/:showName', function(req, res){
        var download = function(url, dest, cb) {
            var file = fs.createWriteStream(dest);
            var request = http.get(url, function(response) {
                response.pipe(file);
                file.on('finish', function() {
                    file.close(cb);  // close() is async, call cb after close completes.
                });
            }).on('error', function(err) { // Handle errors
                fs.unlink(dest); // Delete the file async. (But we don't check the result)
                if (cb) cb(err.message);
            });
        };

        tvDB(key).getSeries(req.params.showName, function(err, data) {
            if (!err){
                if (data.Data.Series[0]) {
                    for (i = 0; i < Object.keys(data.Data.Series).length; i++) {
                        var banner = (data.Data.Series[i].banner.split("/"));
                        var bannerFileName = banner[1];
                        var bannerURL = 'http://thetvdb.com/banners/' + data.Data.Series[i].banner;
                        var bannerPath = path.resolve(__dirname + '/../_cache/images/' + bannerFileName);
                        if (fs.existsSync(bannerPath)) {
                            console.log('File exists.');
                        } else {
                            download(bannerURL, bannerPath, function(){
                                console.log('Done!');
                            });
                        }
                    }
                } else {
                    var banner = (data.Data.Series.banner.split("/"));
                    var bannerFileName = banner[1];
                    var bannerURL = 'http://thetvdb.com/banners/' + data.Data.Series.banner;
                    var bannerPath = path.resolve(__dirname + '/../_cache/images/' + bannerFileName);
                    if (fs.existsSync(bannerPath)) {
                        console.log('File exists.');
                    } else {
                        download(bannerURL, bannerPath, function(){
                            console.log('Done!');
                        });
                    }
                }
                res.send(data);
            } else {
                console.log('Bitch didn\'t give us any data. :sadface:');
                res.send('Bitch didn\'t give us any data. :sadface:');
            }
        });
    });
};
