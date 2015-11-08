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
    facebook: 'facebook',
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

        .state('categories', {
            url: '/categories',
            templateUrl: 'templates/categories.html',
            controller: 'CategoriesCtrl'
        })

        // setup an abstract state for the tabs directive
        .state('tab', {
            url: '/tab',
            abstract: true,
            templateUrl: 'templates/tabs.html'
        })

        .state('tab.malls', {
            cache: false,
            url: '/malls',
            views: {
                'tab-malls': {
                    templateUrl: 'templates/tab-malls.html',
                    controller: 'MallsCtrl'
                }
            }
        })

        .state('tab.mall-sales', {
            url: '/malls/:mallId',
            views: {
                'tab-malls': {
                    templateUrl: 'templates/tab-mall-sales.html',
                    controller: 'MallSalesCtrl'
                }
            }
        })

        .state('tab.sales', {
            cache: false,
            url: '/sales',
            views: {
                'tab-sales': {
                    templateUrl: 'templates/tab-sales.html',
                    controller: 'SalesCtrl'
                }
            }
        })

        .state('tab.sale-detail', {
            url: '/sales/:saleId',
            views: {
                'tab-sales': {
                    templateUrl: 'templates/tab-sale-details.html',
                    controller: 'SaleDetailsCtrl'
                }
            }
        })


        .state('tab.my-sales', {
            cache: false,
            url: '/my-sales',
            views: {
                'tab-my-sales': {
                    templateUrl: 'templates/tab-my-sales.html',
                    controller: 'MySalesCtrl'
                }
            }
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
});

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push(function ($q) {
        return {
            'request': function (config) {
                var url = config.url;

                //enter only if url doesn't contain '.html'
                if (url.indexOf('.html') == -1) {
                    var server = 'https://shopper-app.herokuapp.com';
                    config.url = server + config.url;

                    /*                    var localhost = 'http://localhost:8000';
                     config.url = localhost + config.url;*/
                }

                return config || $q.when(config);
            }
        }
    });
});

app.run(function ($ionicPlatform, $window, GeoAlert) {

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

        // Facebook SDK
        $window.fbAsyncInit = function () {
            // Executed when the SDK is loaded

            FB.init({
                appId: '421262201393188',
                channelUrl: 'www/channel.html',
                status: true,
                cookie: true,
                xfbml: true
            });
        };

        (function (d) {
            // load the Facebook javascript SDK

            var js,
                id = 'facebook-jssdk',
                ref = d.getElementsByTagName('script')[0];

            if (d.getElementById(id)) {
                return;
            }

            js = d.createElement('script');
            js.id = id;
            js.async = true;
            js.src = "https://connect.facebook.net/en_US/all.js";

            ref.parentNode.insertBefore(js, ref);

        }(document));

        //Begin the service
        //hard coded 'target'
        //herzeliah shopping center lat and long
        var lat = 32.164984;
        var long = 34.823771;

        function onConfirm(idx) {
            console.log('button ' + idx + ' pressed');
        }

        GeoAlert.begin(lat, long, function () {

            GeoAlert.end();
            /*        navigator.notification.confirm(
             'You are near a target!',
             onConfirm,
             'Target!',
             ['Cancel','View']
             );*/

        });
    });
});

app.run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
    $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {

        /*if ('data' in next && 'authorizedRoles' in next.data) {
         var authorizedRoles = next.data.authorizedRoles;
         if (!AuthService.isAuthorized(authorizedRoles)) {
         next.preventDefault();
         $state.go($state.current, {}, {reload: true});
         $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
         }
         }
         */
        if (!AuthService.isAuthenticated()) {
            if (next.name !== 'login' && next.name !== 'register') {
                event.preventDefault();
                $state.go('login');
            }
        }
    })
});
