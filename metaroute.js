'use strict';

class MetaRoute {
    constructor() {
    }

    getMetaRoute(express) {
        var path   = require('path');
        var router = express.Router();
        var dbManager = require("./database/databaseManager");
        var users     = dbManager.getUsers();

        var staticPath = path.join(__dirname, '/dist/');
        router.use(express.static(staticPath));

        // Process user
        router.post('/user_enter', function (req, res, next) {
            var session = req.session;

            users.checkValidUser(req.body.login, req.body.password, function (userInfo) {
                if (userInfo !== undefined && "isActivated" in userInfo && userInfo.isActivated) {
                    session.userInfo = userInfo;
                    console.log("Login: " + session.userInfo.login + (session.userInfo.isAdmin ? " Admin" : ""));
                    res.send({ success: true });
                } else {
                    res.send({ success: false });
                }
            });
        });
        router.get('/user_exit', (req, res) => {
            console.log("Log out");
            req.session.destroy();
            res.send({ success: true });
        });
        router.get('/is_user_entered', function (req, res, next) {
            var session = req.session;
            res.send({ success: "userInfo" in session});
        });

        return router;
    }

    setDBManager(dbManager) {
        this.dbManager = dbManager;
    }
}


module.exports = MetaRoute