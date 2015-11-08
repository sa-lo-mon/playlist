var appServices = angular.module('starter.services', []);

appServices.factory('Categories', function ($http, $q) {
    return {
        all: function () {
            var dfd = $q.defer();
            $http.get('/categories')
                .success(function (categories) {
                    dfd.resolve(categories.data);
                })
                .error(function (err) {
                    dfd.reject(err);
                });

            return dfd.promise;
        }
    };
});

appServices.factory('Malls', function ($http, $q, AuthService) {

    var malls = [];

    var all = function () {
        if (malls.length > 0) {
            console.log("malls: " ,malls);
            return $q.resolve(malls);
        } else {
            return $q(function (resolve, reject) {
                $http.get('/malls').then(function (data, err) {
                    if (err) {
                        reject(err);
                    } else {
                        malls = data.data.data;
                        resolve(malls);
                    }
                });
            });
        }
    };

    var get = function (mallId) {

        return $q(function (resolve, reject) {
            for (var i = 0; i < malls.length; i++) {
                if (malls[i].Id == mallId) {
                    resolve(malls[i]);
                }
            }

            // if we didn't get to resolve,
            // reject the query
            reject('malls is empty');
        });
    };

    var getMallSales = function (mallId) {
        var userCats = AuthService.getUserModel().categories;
        return $http.get('/mallSales/' + mallId + '/' + userCats);
    };

    return {
        all: all,
        get: get,
        getMallSales: getMallSales
    };
});

appServices.factory('Sales', function ($http, $q, AuthService) {
    var _self = this;
    var sales = [];

    var all = function () {
        if (sales.length > 0) {
            return $q.resolve(sales);
        } else {
            return $q(function (resolve, reject) {
                var userCats = AuthService.getUserModel().categories;
                $http.get('/sales/all/' + userCats).then(function (data, err) {
                    if (err) {
                        reject(err);
                    } else {
                        sales = data.data.data;
                        resolve(sales);
                    }
                });
            });
        }
    };

    var get = function (saleId) {
        return $q(function (resolve, reject) {
            all().then(function (data, err) {
                if (err) {
                    reject(err);
                } else {
                    var id = parseInt(saleId);
                    for (var i = 0; i < sales.length; i++) {
                        if (sales[i].id == id) {
                            resolve(sales[i]);
                        }
                    }
                    reject('sales is empty');
                }
            });
        })
    };

    var getSalesByIds = function (salesIds) {
        return $http.get('/sales/my/' + salesIds);
    };

    return {
        all: all,
        get: get,
        getSalesByIds: getSalesByIds
    };
});

appServices.factory('MySales', function ($http, $q, Sales, AuthService) {

    var userDetails = AuthService.getUserModel();

    var add = function (sale) {
        var mySales = userDetails.sales;

        AuthService.addSale(sale.id);

        return $q(function (resolve, reject) {
            var detailsJson = {
                "email": userDetails.email,
                "saleDetails": sale.id
            };

            $http.post('/addToMySales', detailsJson).then(function (data, err) {
                if (data) {
                    resolve(data);
                } else {
                    reject("rejected");
                }
            });
        });
    };

    var remove = function (sale) {
        AuthService.removeSale(sale.id);

        var userModel = AuthService.getUserModel();
        var salesArray = userModel.sales.split(',');
        userModel.sales = salesArray.map(function (saleId) {
            return parseInt(saleId);
        });

        return $q(function (resolve, reject) {
            $http.post('/removeFromMySales', userModel).then(function (data, err) {
                if (data) {
                    resolve(data);
                } else {
                    reject(err);
                }
            });
        });
    };

    var getMySales = function () {
        userDetails = AuthService.getUserModel();
        return Sales.getSalesByIds(userDetails.sales);
    };


    return {
        all: getMySales,
        remove: remove,
        add: add
    };
});

appServices.factory('Categories', function ($http, $q) {
    var all = function () {
        var dfd = $q.defer();
        $http.get('/categories')
            .success(function (categories) {
                dfd.resolve(categories.data);
            })
            .error(function (err) {
                dfd.reject(err);
            });

        return dfd.promise;
    };

    return {
        all: all
    };
});

appServices.factory('GeoAlert', function ($q, $ionicPopup) {
    var interval;
    var duration = 6000;
    var long, lat;
    var processing = false;
    var callback;
    var minDistance = 10;

    // Credit: http://stackoverflow.com/a/27943/52160
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);  // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180)
    }

    function hb() {

        if (processing) return;
        processing = true;

        navigator.geolocation.getCurrentPosition(function (pos) {
            processing = false;
            var dist = getDistanceFromLatLonInKm(lat, long, pos.coords.latitude, pos.coords.longitude);

            if (dist <= minDistance) callback(pos);
        }, onError, {enableHighAccuracy: false});
    }

    function onError(error) {
        processing = false;
        $ionicPopup.alert({
            title: 'Geoloaction Error!',
            template: 'code: ' + error.code + '\n' + 'message: ' + error.message + '\n'
        });
    };

    function sortDistance(malls) {
        return $q(function (resolve, reject) {

            //TODO: check if gps is open
            navigator.geolocation.getCurrentPosition(function (position) {
                if (position == -1) {
                    reject('Invalid Distance!');
                }
                currentLat = position.coords.latitude;
                currentLong = position.coords.longitude;
                var length = malls.length;
                for (var i = 0; i < length; i++) {
                    var distInKM = getDistanceFromLatLonInKm(currentLat, currentLong, malls[i].lat, malls[i].long);
                    malls[i].distance = Math.round(distInKM * 100) / 100;
                }

                for (var i = 0; i < length; i++) {
                    var tmp = malls[i]; //Copy of the current element.

                    /*
                     Check through the sorted part and compare with the
                     number in tmp. If large, shift the number
                     */
                    for (var j = i - 1; j >= 0 && (malls[j].distance > tmp.distance); j--) {

                        //Shift the number
                        malls[j + 1] = malls[j];
                    }

                    // Insert the copied number at the correct position
                    // in sorted part.
                    malls[j + 1] = tmp;
                }

                resolve(malls);
            });
        });
    };

    return {
        begin: function (lt, lg, cb) {
            long = lg;
            lat = lt;
            callback = cb;
            //interval = window.setInterval(hb, duration);
            //hb();
        },
        end: function () {
            window.clearInterval(interval);
        },
        setTarget: function (lg, lt) {
            long = lg;
            lat = lt;
        },
        getDistance: function (data) {
            return sortDistance(data);
        }
    };

});

appServices.service('AuthService', function ($rootScope, $state, $q, $http, USER_ROLES, LOGIN_TYPE, AUTH_EVENTS) {
    var LOCAL_TOKEN_KEY = 'tokenKey';
    var LOCAL_CATEGORIES_KEY = 'categoriesKey';
    var LOCAL_SALES_KEY = 'salesKey';
    var SEPARATOR = ',';
    var userName = '';
    var isAuthenticated = false;
    var role = '';
    var authToken;

    function useCredentials(token) {
        userName = token.split(SEPARATOR)[0];
        isAuthenticated = true;
        authToken = token.split(SEPARATOR)[1];

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
                $http.post('/login', loginData)
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
        var categories = userData.data.Categories || userData.data.data.Categories;
        var sales = userData.data.Sales || userData.data.data.Sales;
        var token = userName + SEPARATOR + email;

        window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
        window.localStorage.setItem(LOCAL_CATEGORIES_KEY, categories);
        window.localStorage.setItem(LOCAL_SALES_KEY, sales);
        useCredentials(token);
    };


    function destroyCredentials() {
        var userName = '';
        var isAuthenticated = false;
        var role = '';
        var authToken = undefined;
        $http.defaults.headers.common['X-Auth-Token'] = undefined;
        window.localStorage.removeItem(LOCAL_TOKEN_KEY);
        window.localStorage.removeItem(LOCAL_CATEGORIES_KEY);
        window.localStorage.removeItem(LOCAL_SALES_KEY);
    }


    function loginRedirect() {
        var path = 'login';
        var userCategories = window.localStorage.getItem(LOCAL_CATEGORIES_KEY);
        var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
        console.log(userCategories);
        console.log(token);

        if (token && (userCategories != 'undefined')) {

            //redirect to "sales" page!
            console.log('s');
            path = 'tab.sales';
        } else if (token) {

            //redirect to "categories" page!
            path = 'categories';
        }
        console.log(path);
        $state.go(path);
    }

    function redirectFromLogin() {
        var path = 'categories';
        var userCategories = window.localStorage.getItem(LOCAL_CATEGORIES_KEY);
        if ((userCategories != 'undefined')) {

            //redirect to "sales" page!
            path = 'tab.sales';
        }

        $state.go(path);
    }

    var isAuthorized = function (authorizedRoles) {
        if (!angular.isArray(authorizedRoles)) {
            authorizedRoles = [authorizedRoles];
        }

        return (isAuthenticated && authorizedRoles.indexf(role) != -1);
    };

    function getUserInfo(userID, token) {
        return $http.get('/user' + '/' + userID + '/' + token);
    }


    var facebookLogin = function () {
        return $q(function (resolve, reject) {
            FB.login(function (res) {
                if (res.authResponse) {
                    var userId = res.authResponse.userID;
                    var token = res.authResponse.accessToken;
                    getUserInfo(userId, token).then(function (data, err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data);
                        }
                    });
                } else {
                    reject('User cancelled login or did not fully authorize.');
                }
            }, {scope: 'email, public_profile'});
        });
    };

    var defaultLogin = function (loginData) {
        return isValidUser(loginData);
    };

    var loginHandler = function (loginData, loginType) {
        if (loginType == LOGIN_TYPE.facebook) {
            return facebookLogin();

        } else if (loginType == LOGIN_TYPE.default) {
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
        window.localStorage.setItem(LOCAL_CATEGORIES_KEY, userModel.categories);
        window.localStorage.setItem(LOCAL_SALES_KEY, userModel.sales);
    };

    var getUserModel = function () {
        var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
        var categories = window.localStorage.getItem(LOCAL_CATEGORIES_KEY);
        var sales = window.localStorage.getItem(LOCAL_SALES_KEY);
        if (!token) {
            return null;
        }

        var name = token.split(SEPARATOR)[0];
        var email = token.split(SEPARATOR)[1];

        if (categories == 'undefined') {
            categories = [];
        } else {
            categories = categories.split(',');
        }

        return {
            name: name,
            email: email,
            categories: categories,
            sales: sales,
            token: token
        };
    };

    var addSale = function (saleId) {
        var userSales = window.localStorage.getItem(LOCAL_SALES_KEY);
        userSales = userSales.concat(',' + saleId);
        window.localStorage.setItem(LOCAL_SALES_KEY, userSales);
    };

    var removeSale = function (saleId) {
        var userSales = window.localStorage.getItem(LOCAL_SALES_KEY);
        var userSalesArray = userSales.split(',');
        var indexOfSale = userSalesArray.indexOf(saleId.toString());
        userSalesArray.splice(indexOfSale, 1);
        window.localStorage.setItem(LOCAL_SALES_KEY, userSalesArray);
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
        addSale: addSale,
        removeSale: removeSale,
        redirectFromLogin: redirectFromLogin,
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

appServices.config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
});
