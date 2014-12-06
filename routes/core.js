var fs = require("fs"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    Show = require('../models/Show'),
    Episode = require('../models/Episode'),
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

    app.get('/show/:seriesId', function(req, res){
        Show.find({seriesId: req.params.seriesId}).exec(function(err, show) {
            Episode.find({seriesId: req.params.seriesId}).exec(function(err, episodes) {
                res.render('show', {
                    show: show,
                    episodes: episodes
                });
            });
        });
    });

    app.get('/addShow', function(req, res){
        res.render('addShow');
    });

    app.get('/addShow/:seriesId', function(req, res) {
        tvDB(key).getSeriesAllById(req.params.seriesId, function(err, data){
            var show = data.Data.Series;
            var episode = data.Data.Episode;

            Show.update({
                seriesId: show.id
            }, {
                $set: {
                    seriesId: show.id,
                    language: show.Language,
                    overview: show.Overview,
                    title: show.SeriesName,
                    imdbId: show.IMDB_ID,
                    bannerImg: show.banner,
                    posterImg: show.poster,
                    network: show.Network
                }
            }, {
                upsert: true
            }, function(error) {
                if (error) {
                    res.status(500).json({
                        error: error // status 500
                    });
                } else {
                    for (i = 0; i < Object.keys(episode).length; i++) {
                        Episode.update({
                            episodeId: episode[i].id
                        }, {
                            $set: {
                                episodeId: episode[i].id,
                                seriesId: episode[i].seriesid,
                                language: episode[i].Language,
                                overview: episode[i].Overview,
                                title: episode[i].EpisodeName,
                                imdbId: episode[i].IMDB_ID,
                                episodeNumber: episode[i].EpisodeNumber,
                                seasonNumber: episode[i].SeasonNumber,
                                seasonId: episode[i].seasonid
                            }
                        }, {
                            upsert: true
                        }, function(error) {
                            if (error) {
                                res.status(500).json({
                                    error: error // status 500
                                });
                            }
                        });
                    }
                    res.status(200).end();
                }
            });
        });
    });

    app.get('/t/:seriesId', function(req, res){
        tvDB(key).getSeriesAllById(req.params.seriesId, function(err, data){
            res.send(data.Data);
        });
    });

    app.get('/showBanner/:seriesId', function(req, res){
        Show.find({seriesId: req.params.seriesId}, function(err, data){
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
