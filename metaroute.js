'use strict';

class MetaRoute {
    constructor() {
    }

    getMetaRoute(express) {
        var path   = require('path');
        var router = express.Router();
        var dbManager = require("./database/databaseManager");
        var users = dbManager.getUsers();
        var tasks = dbManager.getTasks();
        var links = dbManager.getLinks();
        var templates = dbManager.getTemplates();
        var categories = dbManager.getCategories();

        var staticPath = path.join(__dirname, '/dist/');
        router.use(express.static(staticPath));


        // Simple return html
        router.get('/catalog/:catalogId', function (req, res, next) {
            res.sendFile(path.join(staticPath, "index.html"));
        });

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
        router.post('/remove_cleanup_rows', function (req, res, next) {
            let deletedNumber = 0;
            links.getExpiredLinks(function (success, rows) {
                if (success) {
                    links.deleteLinks(rows, function (success) {
                        deletedNumber += success ? rows.length : 0;
                        tasks.getTasksWithoutLinks(links, function (success, rows) {
                            if (success) {
                                tasks.deleteTasks(rows, function (success) {
                                    deletedNumber += success ? rows.length : 0;
                                    tasks.getVersionWithoutTasks(function (success, rows) {
                                        if (success) {
                                            tasks.deleteVersions(rows, function (success) {
                                                deletedNumber += success ? rows.length : 0;
                                                res.send({ success: success, deleteNumber: deletedNumber });
                                            });
                                        } else {
                                            res.send({ success: success });
                                        }
                                    });
                                });
                            } else {
                                res.send({ success: success });
                            }
                        });
                    });

                } else {
                    res.send({ success: success });
                }
            });
        });

        router.get('/get_public_category_templates', function (req, res, next) {
            categories.getTemplatesInPublicCategory(req.query.id, templates,
                function (success, templates) {
                    res.send({ success: success, templates: templates });
                });
        });

        router.get('/get_children_public_categories', function (req, res, next) {
            categories.getChildrenPublicCategories(req.query.id,
                function (success, categories) {
                    res.send({ success: success, categories: categories });
                });
        });

        router.get('/get_public_category_info', function (req, res, next) {
            categories.getTemplatePublicCategory(req.query.id,
                function (success, category) {
                    res.send({ success: success, info: category });
                });
        });        

        return router;
    }

    setDBManager(dbManager) {
        this.dbManager = dbManager;
    }
}


module.exports = MetaRoute