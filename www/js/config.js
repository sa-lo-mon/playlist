var config = {};

// should end with '/'
config.rootUrl = process.env.ROOT_URL || 'http://localhost:8000/';
config.mongoUrl = 'mongodb://shopper:idc2015@ds053300.mongolab.com:53300/shopperdb';
config.facebook = {
    appId: process.env.FACEBOOK_APPID || '421262201393188',
    appSecret: process.env.FACEBOOK_APPSECRET || 'aadbb381266068cee2d9489336062032',
    appNamespace: process.env.FACEBOOK_APPNAMESPACE || 'nodeshopper',
    redirectUri: process.env.FACEBOOK_REDIRECTURI || config.rootUrl + 'login/callback'
};

module.exports = config;
