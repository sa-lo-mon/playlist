var appControllers = angular.module('starter.controllers', []);

appControllers.controller('AppCtrl', function ($window, $state, $rootScope, $scope, $ionicHistory, $ionicPopup, AuthService, AUTH_EVENTS) {
  $scope.username = AuthService.userName();

  $scope.$on(AUTH_EVENTS.notAuthorized, function (event) {
    var alertPopup = $ionicPopup.alert({
      title: 'Unauthorized',
      template: 'You are not allowed to access this resource'
    });
  });

  $scope.$on(AUTH_EVENTS.notAuthenticated, function (event) {
    AuthService.logout();
    $state.go('login');
    var alertPopup = $ionicPopup.alert({
      title: 'Session lost!',
      template: 'Please login again.'
    });
  });

  $scope.SetCurrentUsername = function (name) {
    $scope.username = name;
  };

  $scope.logout = function () {
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    AuthService.logout();
    $window.location.reload(true);
  };
});

appControllers.controller('LoginCtrl', function ($state, $scope, $http, $ionicPopup, AuthService) {

  $scope.loginData = {};

  if (AuthService.isAuthenticated()) {
    $state.go('tab.songs');
  }

  $scope.login = function () {
    AuthService.login($scope.loginData, 'default');
  };
});

appControllers.controller('RegisterCtrl', function ($scope, $http, $state, $ionicPopup) {
  $scope.formData = {};

  $scope.sub = function () {

    $http.post('/api/register/complete', $scope.formData)
      .success(function (data) {

        //redirect to 'login' page
        $state.go('login');
      })
      .error(function (err) {
        console.log(err);

        $ionicPopup.alert({
          title: 'Registration Faild!',
          template: 'Please try register later.'
        });
      });
  }
});

appControllers.controller('NowPlayingCtrl', function ($scope, $rootScope) {

});

appControllers.controller('SelectedSongsCtrl', function ($scope, $rootScope, $state, FMAService, AuthService) {
  var userModel = AuthService.getUserModel();

  $scope.songs = [];

  //get all thte details of each selected song
  userModel.playlist.forEach(function (trackId) {
    FMAService.getTrackById(trackId).success(function (data) {
      var track = data.dataset[0];
      FMAService.addDownload(track);
      $scope.songs.push(track);
    });
  });

  $scope.play = function (track) {

    // save selected track in root scope
    // so we can share data between views
    $rootScope.currentTrack = track;

    // redirect to 'now playing' tab
    $state.go('tab.now-playing');
  };

  $scope.remove = function (track) {

    //remove song from UI
    var trackIdx = $scope.songs.indexOf(track);
    $scope.songs.splice(trackIdx, 1);

    //remove song from playlist
    AuthService.removeTrack(track.track_id);
  };
});

appControllers.controller('SongsCtrl', function ($scope, $rootScope, $state, FMAService, AuthService) {
  $scope.songs = [];
  FMAService.getTracks({}).then(function (data, err) {
    if (data) {

      //modify 'track_url' field to include '/download' route
      // in order to download the media file form FMA

      var allTracks = data.data.dataset;
      allTracks.forEach(function (track) {
        FMAService.addDownload(track);
      });

      $scope.songs = allTracks;

    } else {
      console.log('error: ', err);
    }
  });

  $scope.add = function (track) {
    AuthService.addTrack(track.track_id);
  };

  $scope.play = function (track) {

    // save selected track in root scope
    // so we can share data between views
    $rootScope.currentTrack = track;

    // redirect to 'now playing' tab
    $state.go('tab.now-playing');
  };

})
;
