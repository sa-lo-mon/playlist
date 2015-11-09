/**
 * Created by salomon on 09/11/2015.
 */
var https = require('https');

function FMA() {
  this.host = Object.create(null);
  this.api_key = Object.create(null);
  this.per_page = Object.create(null);
}

FMA.prototype.setup = function (host, api_key, pages) {
  FMA.host = host;
  FMA.api_key = api_key;
  FMA.per_page = pages;
};

function requestData(domain, params, callback, page, per_page) {

  params.api_key = FMA.api_key;
  params.page = page || 1;
  params.limit = per_page || FMA.per_page;

  var queryString = '?api_key=' + params.api_key + '&page=' + params.page + '&limit=' + params.limit;
  if (params.track_id) {
    queryString += '&track_id=' + params.track_id;
  }

  var pars = {};
  pars.hostname = FMA.host;
  pars.path = '/api/get/' + domain + '.json' + queryString;

  https.get(pars, function (res) {
    var body = '';
    res.on('data', function (data) {
      body += data;
    });

    res.on('end', function () {
      var parsedData = JSON.parse(body);
      callback(parsedData);
    });
  });
};

FMA.prototype.getCurators = function getCurators(params, callbackFunc, page, per_page) {
  return requestData('curators', params, callbackFunc, page, per_page);
};

FMA.prototype.getGenres = function getGenres(params, callbackFunc, page, per_page) {
  return requestData('genres', params, callbackFunc, page, per_page);
};

FMA.prototype.getArtists = function getArtists(params, callbackFunc, page, per_page) {
  return requestData('artists', params, callbackFunc, page, per_page);
};

FMA.prototype.getAlbums = function getAlbums(params, callbackFunc, page, per_page) {
  return requestData('albums', params, callbackFunc, page, per_page);
};

FMA.prototype.getTracks = function getTracks(params, callbackFunc, page, per_page) {
  return requestData('tracks', params, callbackFunc, page, per_page);
};

var fma = new FMA();
fma.setup('freemusicarchive.org', 'P9BKQ2V2DPKOCB7D', 20);
module.exports = fma;
