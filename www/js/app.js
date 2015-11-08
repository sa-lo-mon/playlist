var app = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services']);

app.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
});

app.constant('USER_ROLES', {
  admin: 'role-admin',
  public: 'role-public'
});

app.constant('LOGIN_TYPE', {
  default: 'default'
});

app.config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    })

    .state('register', {
      cache: false,
      url: '/register',
      templateUrl: 'templates/register.html',
      controller: 'RegisterCtrl'
    })

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tabs.html'
    })

    .state('tab.now-playing', {
      url: '/now-playing',
      cache: false,
      views: {
        'tab-now-playing': {
          templateUrl: 'templates/tab-now-playing.html',
          controller: 'NowPlayingCtrl'
        }
      }
    })

    .state('tab.selected-songs', {
      url: '/selected-songs',
      views: {
        'tab-selected-songs': {
          templateUrl: 'templates/tab-selected-songs.html',
          controller: 'SelectedSongsCtrl'
        }
      }
    })

    .state('tab.songs', {
      url: '/songs',
      views: {
        'tab-songs': {
          templateUrl: 'templates/tab-songs.html',
          controller: 'SongsCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});

app.run(function ($ionicPlatform) {

  $ionicPlatform.ready(function () {

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
});

app.run(function ($rootScope, $state, AuthService) {
  $rootScope.$on('$stateChangeStart', function (event, next) {

    if (!AuthService.isAuthenticated()) {
      if (next.name !== 'login' && next.name !== 'register') {
        event.preventDefault();
        $state.go('login');
      }
    }
  })
});
