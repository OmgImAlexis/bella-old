var mongoose = require('mongoose');

var showSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    imdbID: {
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
    network: {
        type: String,
        require: true
    },
    quality: {
        type: String,
        require: true
    },
    downloadsDone: {
        type: Number
    },
    downloadsPending: {
        type: Number
    },
    episodes: {
        type: Number
    },
    seasons: {
        type: Number
    },
    active: {
        type: Boolean
    },
    status: {
        type: String
    }
});

module.exports = mongoose.model('Show', showSchema);
