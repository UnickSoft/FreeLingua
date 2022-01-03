'use strict';

class AdminRoute {
    constructor() {
    }

    getAdminRoute(express) {
        var path = require('path');
        var router = express.Router();

        router.get('/is_admin', function (req, res, next) {
            var session = req.session;
            if (session.userInfo && session.userInfo.isAdmin) {
                res.send({ success: true, login: session.userInfo.login});
            } else {
                res.send({ success: false });
            }
        });

        // Simple return html
        router.get('/users', function (req, res, next) {
            res.sendFile(path.join(staticPath, "admin/index.html"));
        });
        router.get('/add_user', function (req, res, next) {
            res.sendFile(path.join(staticPath, "admin/index.html"));
        });

        // Disable all other function for non admin
        router.use(function (req, res, next) {
            var session = req.session;
            if (session.userInfo && session.userInfo.isAdmin) {
                next()
            } else {
                res.send({ error: "You are not admin" });
            }
        });

        var dbManager = require("./database/databaseManager");
        var users = dbManager.getUsers();
        var tasks = dbManager.getTasks();
        var links = dbManager.getLinks();

        router.get('/get_users', function (req, res, next) {
            users.getUserList(function (list) {
                res.send({ users: list});
            });
        });

        router.post('/add_user', function (req, res, next) {
            users.registerUser(req.body.login, req.body.password, req.body.email, req.body.name, req.body.role == "teacher" ? 0 : 1,
                function () {
                    dbManager.getUsers().activateUser(req.body.login);
                    res.send({ success: true });
                }
            );
        });

        router.post('/ban_user', function (req, res, next) {
            users.banUser(req.body.login, true, function () {
                res.send({ success: true });
            });
        });

        router.post('/delete_user', function (req, res, next) {
            users.deleteUser(req.body.login, function () {
                res.send({ success: true });
            });
        });

        router.post('/get_cleanup_rows', function (req, res, next) {
            let data = [];
            tasks.getVersionWithoutTasks(function (success, rows) {
                if (success) {
                    data.push({ name: "no_need_versions", data: rows});
                    tasks.getTasksWithoutLinks(links, function (success, rows) {
                        if (success) {
                            data.push({ name: "no_need_tasks", data: rows });
                            links.getExpiredLinks(function (success, rows) {
                                if (success) {
                                    data.push({ name: "expired_links", data: rows });
                                    res.send({ success: success, data: data });
                                } else {
                                    res.send({ success: success });
                                }
                            });
                        } else {
                            res.send({ success: success });
                        }
                    });
                } else {
                    res.send({ success: success});
                }
            });
        });

        return router;
    }

    setDBManager(dbManager) {
        this.dbManager = dbManager;
    }
}


module.exports = AdminRoute