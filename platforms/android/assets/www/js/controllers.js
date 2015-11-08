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
        AuthService.redirectFromLogin();
    }

    $scope.login = function () {
        AuthService.login($scope.loginData, 'default');
    };

    $scope.fbLogin = function () {
        AuthService.login($scope.loginData, 'facebook');
    };
});

appControllers.controller('RegisterCtrl', function ($scope, $http, $state, $ionicPopup) {
    $scope.formData = {};

    $scope.sub = function () {

        $http.post('/register/complete', $scope.formData)
            .success(function (data) {

                //redirect to 'categories' page
                $state.go('login');
            })
            .error(function (err) {
                console.log(err);

                $ionicPopup.alert({
                    title: 'Registration Error!',
                    template: 'Error while trying to register'
                });
            });
    }
});

appControllers.controller('CategoriesCtrl', function ($scope, $http, $state, $ionicPopup, AuthService, Categories) {
    $scope.userModel = AuthService.getUserModel();

    Categories.all().then(function (data, err) {
        if (err) {
            $ionicPopup.alert({
                title: 'Categories failed!',
                template: err
            });
        } else {
            $scope.categories = data;
        }
    });

    $scope.getCategories = function () {
        return $scope.userModel.categories;
    };

    $scope.check = function (value, checked) {

        var idx = $scope.userModel.categories.indexOf(value);

        if (idx >= 0 && !checked) {
            $scope.userModel.categories.splice(idx, 1);
        }

        if (idx < 0 && checked) {
            $scope.userModel.categories.push(value);
        }
    };

    $scope.sub = function () {

        var params = {
            email: $scope.userModel.email,
            categories: $scope.userModel.categories
        };


        $http.post('/categories/complete', params)
            .success(function (data) {
                AuthService.setUserModel($scope.userModel);

                //redirect to 'sales' page
                $state.go('tab.sales');
            })
            .error(function (data) {
                $ionicPopup.alert({
                    title: 'Categories failed!',
                    template: 'Error in posting categories/complete'
                });
            });
    };
});

appControllers.controller('MallsCtrl', function ($scope, Malls, GeoAlert) {
    Malls.all().then(function (unorderedMalls, error) {
        GeoAlert.getDistance(unorderedMalls).then(function (data, err) {
            if (data) {
                $scope.malls = data;

            } else {
                $scope.malls = unorderedMalls;
            }
        });
    });

    $scope.remove = function (mall) {
        Malls.remove(mall);
    }
});

appControllers.controller('MySalesCtrl', function ($scope, MySales) {
    $scope.mysales = {};

    MySales.all().then(function (data, err) {
        if (err) {
            console.log('error: ', err);
        } else {
            $scope.mysales = data.data.data;
        }
    });

    $scope.remove = function (sale) {
        $scope.mysales.splice($scope.mysales.indexOf(sale), 1);
        MySales.remove(sale);
    }
});

appControllers.controller('SalesCtrl', function ($scope, $stateParams, Malls, Sales, MySales) {
    $scope.sales = {};

    Sales.all().then(function (data, err) {
        if (err || !data) {
            console.log('error: ', err);
        } else {
            $scope.sales = data;
        }
    });

    $scope.add = function (sale) {
        MySales.add(sale);
    };
});

appControllers.controller('MallSalesCtrl', function ($scope, $stateParams, Malls, MySales) {

    $scope.currentMallId = $stateParams.mallId;
    $scope.sales = {};

    Malls.getMallSales($stateParams.mallId).then(function (data, err) {
        if (err || !data) {
            console.log('error: ', err);
        } else {
            $scope.sales = data.data.data;
        }
    });

    $scope.add = function (sale) {
        MySales.add(sale);
    }
});

appControllers.controller('SaleDetailsCtrl', function ($scope, $stateParams, Sales) {
    $scope.sale = {};
    Sales.get($stateParams.saleId).then(function (data, err) {
        if (err || !data) {
            console.log('error: ', err);
        } else {
            $scope.sale = data;
        }
    });
});
