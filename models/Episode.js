var mongoose = require('mongoose');

var episodeSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    imdbId: {
        type: String
    },
    episodeNumber: {
        type: Number,
        require: true
    },
    seasonNumber: {
        type: Number,
        require: true
    },
    seriesId: {
        type: Number,
        require: true
    },
    seasonId: {
        type: Number,
        require: true
    },
    language: {
        type: String
    },
    overview: {
        type: String
    },
    nextEp: {
        type: Date
    },
    bannerImg: {
        type: String
    },
    posterImg: {
        type: String
    },
    quality: {
        type: String
    },
    downloaded: {
        type: Boolean
    },
    status: {
        type: String
    }
});

module.exports = mongoose.model('Episode', episodeSchema);
