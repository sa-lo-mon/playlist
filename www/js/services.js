var appServices = angular.module('starter.services', []);

appServices.service('AuthService', function ($rootScope, $state, $q, $http, USER_ROLES, LOGIN_TYPE, AUTH_EVENTS) {
  var LOCAL_TOKEN_KEY = 'tokenKey';
  var LOCAL_PLAYLIST_KEY = 'playlistKey';
  var SEPARATOR_CHAR = ',';
  var userName = '';
  var isAuthenticated = false;
  var role = '';
  var authToken;

  function useCredentials(token) {
    userName = token.split(SEPARATOR_CHAR)[0];
    isAuthenticated = true;
    authToken = token.split(SEPARATOR_CHAR)[1];

    if (userName == 'admin') {
      role = USER_ROLES.admin;
    } else {

      role = USER_ROLES.public;
    }

    $http.defaults.headers.common['X-Auth-Token'] = authToken;

  };

  function loadUserCredentials() {
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    if (token) {
      useCredentials(token);
      loginRedirect();
    } else {
      $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
    }
  };

  function isValidUser(loginData) {
    return $q(function (resolve, reject) {
      if (loginData.email && loginData.password) {

        //Get user credentials from database
        $http.post('/api/login', loginData)
          .success(function (data) {
            resolve(data);
          })
          .error(function (err) {
            reject(err);
          });
      } else {
        reject('Invalid Login Details.');
      }
    });
  }

  function storeUserCredentials(userData) {
    if (!userData.data) {
      $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
      return;
    }
    var email = userData.data.email || userData.data.data.email;
    userName = userData.data.FirstName || userData.data.data.FirstName;
    var playlist = userData.data.Playlist || userData.data.data.Playlist;
    var token = userName + SEPARATOR_CHAR + email;

    window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
    window.localStorage.setItem(LOCAL_PLAYLIST_KEY, playlist);
    useCredentials(token);
  };

  function destroyCredentials() {
    userName = '';
    isAuthenticated = false;
    role = '';
    authToken = undefined;

    $http.defaults.headers.common['X-Auth-Token'] = undefined;

    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    window.localStorage.removeItem(LOCAL_PLAYLIST_KEY);
  }

  function loginRedirect() {
    var path = 'login';
    var token = localStorage[LOCAL_TOKEN_KEY];
    if (token) {

      //redirect to 'songs' page
      path = 'tab.songs';
    }

    $state.go(path);
  }

  var isAuthorized = function (authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }

    return (isAuthenticated && authorizedRoles.indexf(role) != -1);
  };

  var defaultLogin = function (loginData) {
    return isValidUser(loginData);
  };

  var loginHandler = function (loginData, loginType) {
    if (loginType == LOGIN_TYPE.default) {
      return defaultLogin(loginData);

    } else {
      return $q.reject('login error!');
    }
  };

  var login = function (loginData, loginType) {

    loginHandler(loginData, loginType).then(function (data, err) {
      if (err || data.data == null) {

        isAuthenticated = false;
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
      } else {

        isAuthenticated = true;
        storeUserCredentials(data);
        loginRedirect();
      }
    });
  };

  var logout = function () {
    destroyCredentials();
    loginRedirect();
  };

  var setUserModel = function (userModel) {
    window.localStorage.setItem(LOCAL_TOKEN_KEY, userModel.token);
    window.localStorage.setItem(LOCAL_PLAYLIST_KEY, userModel.playlist);
  };

  var getUserModel = function () {
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    var playlist = localStorage[LOCAL_PLAYLIST_KEY];

    if (playlist) {
      playlist = JSON.parse(playlist);
    } else {
      playlist = [];
    }

    if (!token) {
      return null;
    }

    var name = token.split(SEPARATOR_CHAR)[0];
    var email = token.split(SEPARATOR_CHAR)[1];

    return {
      name: name,
      email: email,
      playlist: playlist,
      token: token
    };
  };

  var addTrack = function (trackId) {

    var playlist = localStorage[LOCAL_PLAYLIST_KEY];
    if (playlist == null || playlist == '') {
      playlist = [];
    } else {
      playlist = JSON.parse(playlist);
    }

    playlist.push(trackId);

    localStorage[LOCAL_PLAYLIST_KEY] = JSON.stringify(playlist);
  };

  var removeTrack = function (trackId) {
    var playlist = localStorage[LOCAL_PLAYLIST_KEY];
    if (!playlist)
      return;

    playlist = JSON.parse(playlist);
    var indexOfSale = playlist.indexOf(trackId);
    playlist.splice(indexOfSale, 1);
    localStorage[LOCAL_PLAYLIST_KEY] = JSON.stringify(playlist);
  };

// this will occur every time
// that user will open the application
  loadUserCredentials();

  return {
    login: login,
    logout: logout,
    isAuthorized: isAuthorized,
    getUserModel: getUserModel,
    setUserModel: setUserModel,
    addTrack: addTrack,
    removeTrack: removeTrack,
    isAuthenticated: function () {
      return isAuthenticated;
    },
    userName: function () {
      return userName;
    },
    role: function () {
      return role;
    }
  };
});

appServices.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized
      }[response.status], response);
      return $q.reject(response);
    }
  };
});

appServices.factory('FMAService', function ($http) {

  var root = this;
  var FMA = root.FMA = {
    host: 'freemusicarchive.org',
    api_key: 'P9BKQ2V2DPKOCB7D',
    per_page: 20
  };

  function requestData(domain, params, callback, page, per_page) {
    params.api_key = FMA.api_key;
    params.page = page || 1;
    params.limit = per_page || FMA.per_page;

    var url = 'http://' + FMA.host + '/api/get/' + domain + '.json';
    return $http.get(url, {params: params});
  };

  FMA.getCurators = function getCurators(params, callbackFunc, page, per_page) {
    return requestData('curators', params, callbackFunc, page, per_page);
  };

  FMA.getGenres = function getGenres(params, callbackFunc, page, per_page) {
    return requestData('genres', params, callbackFunc, page, per_page);
  };

  FMA.getArtists = function getArtists(params, callbackFunc, page, per_page) {
    return requestData('artists', params, callbackFunc, page, per_page);
  };

  FMA.getAlbums = function getAlbums(params, callbackFunc, page, per_page) {
    return requestData('albums', params, callbackFunc, page, per_page);
  };

  FMA.getTracks = function getTracks(params, callbackFunc, page, per_page) {
    return requestData('tracks', params, callbackFunc, page, per_page);
  };

  return FMA;
});

appServices.config(function ($httpProvider, $sceProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
  $sceProvider.enabled(false);
});
