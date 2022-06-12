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
        var utils = require("./utils");
        var log = require("./log");

        var sitemap = null;
        var sitemapSaveTime = 0; // in seconds
        var sitemapTxt = null;
        var sitemapTxtSaveTime = 0; // in seconds

        var updateSiteMapPeriod = 24 * 3600 * 30; // One month

        var staticPath = path.join(__dirname, '/dist/');
        var prerenderPath = path.join(__dirname, '/static/');

        let activationUrl  = "/activate/";
        let newPasswordUrl = "/set_new_password/";

        // Simple return html
        router.get('/', function (req, res, next) {
            res.sendFile(utils.sendFileName(req, staticPath));
        });
        router.get('/catalog/:catalogId', function (req, res, next) {
            res.sendFile(utils.sendFileName(req, staticPath));
        });
        router.get('/teacher_registration', function (req, res, next) {
            res.sendFile(utils.sendFileName(req, staticPath));
        });
        router.get(activationUrl + ':activateId', function (req, res, next) {
            res.sendFile(utils.sendFileName(req, staticPath));
        });
        router.get('/forgot_password', function (req, res, next) {
            res.sendFile(utils.sendFileName(req, staticPath));
        });
        router.get('/set_new_password/:linkId', function (req, res, next) {
            res.sendFile(utils.sendFileName(req, staticPath));
        });

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
                    if (userInfo === undefined) {
                        res.send({ success: false, error: "wrong_login_or_password" });
                    } else if ("isActivated" in userInfo && !userInfo.isActivated) {
                        res.send({ success: false, error: "user_is_not_activated" });
                    }
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

        router.get('/get_public_category_by_tag', function (req, res, next) {
            categories.getPublicCategoryByTag(req.query.tag,
                function (success, category) {
                    res.send({ success: success, info: category });
                });
        });

        router.get('/sitemap.xml', function (req, res, next) {
            const { SitemapStream, streamToPromise } = require('sitemap')
            const { Readable } = require('stream')

            res.header('Content-Type', 'application/xml');
            // if we have a cached entry send it
            if (sitemap && Math.floor(Date.now() / 1000) - sitemapSaveTime < updateSiteMapPeriod) {
                res.send(sitemap);
                return;
            }

            try {
                const smStream = new SitemapStream({ hostname: "https://" + req.headers.host });
                const pipeline = smStream; //smStream.pipe()

                // Push categories && tasks
                categories.getPublicCategories(categoriesList => {
                    categoriesList.forEach(category => {
                        smStream.write({ url: '/catalog/' + category.id, changefreq: 'monthly' });
                        categories.getTemplatesInPublicCategory(category.id, templates, (success, tasks) => {
                            // Push tasks
                            tasks.forEach(task => {
                                smStream.write({
                                    url: '/classroom/catalog/' + category.id + "/task/" + task.id, changefreq: 'monthly'
                                });
                            });
                        });
                    });
                });

                // Push metapages
                smStream.write({ url: '/', changefreq: 'monthly' });
                smStream.write({ url: '/office', changefreq: 'monthly' });

                // Fix it: For now wait database requests and then return sitemap.
                setTimeout(function () {
                    try {
                        // cache the response
                        streamToPromise(pipeline).then(sm => sitemap = sm);
                        // make sure to attach a write stream such as streamToPromise before ending
                        smStream.end();
                        // stream write the response
                        pipeline.pipe(res).on('error', (e) => { throw e });
                    } catch (e) {
                        console.error(e);
                        res.status(500).end();
                    }
                }, 100);
                sitemapSaveTime = Math.floor(Date.now() / 1000);
            } catch (e) {
                console.error(e);
                res.status(500).end();
            }
        });

        router.get('/sitemap.txt', function (req, res, next) {
            res.header('Content-Type', 'text/plain');
            // if we have a cached entry send it
            if (sitemapTxt && Math.floor(Date.now() / 1000) - sitemapTxtSaveTime < updateSiteMapPeriod) {
                res.send(sitemapTxt);
                return;
            }

            try {
                sitemapTxt = "";
                // Push categories && tasks
                categories.getPublicCategories(categoriesList => {
                    categoriesList.forEach(category => {
                        sitemapTxt += "https://" + req.headers.host + '/catalog/' + category.id + "\n";
                        categories.getTemplatesInPublicCategory(category.id, templates, (success, tasks) => {
                            // Push tasks
                            tasks.forEach(task => {
                                sitemapTxt += "https://" + req.headers.host + '/classroom/catalog/' + category.id + "/task/" + task.id + "\n";
                            });
                        });
                    });
                });

                setTimeout(function () {
                    try {
                        res.send(sitemapTxt);
                    } catch (e) {
                        console.error(e);
                        res.status(500).end();
                    }
                }, 100);
                sitemapTxtSaveTime = Math.floor(Date.now() / 1000);
            } catch (e) {
                console.error(e);
                res.status(500).end();
            }
        });


        router.get('/get_public_categories', function (req, res, next) {
            categories.getPublicCategories(function (list) {
                res.send({ categories: list });
            });
        });

        router.post('/register_user', function (req, res, next) {
            var session = req.session;

            users.registerUser(req.body.login, req.body.password, req.body.email, req.body.name, req.body.role == "teacher" ? 0 : 1,
                function (success, linkId) {
                    if (!success) {
                        res.send({ success: success, error: "user_with_login_or_email_exist" });
                        return;
                    }

                    var sender = require("./common/mailsender");
                    let link = `${req.protocol}://${req.get('host')}` + activationUrl + linkId;
                    sender.sendActivationLetter(link, req.body.email, function (success) {
                        res.send({ success: success, error: "cannot_send_activation_email"  });
                    });
                });
            // send email.
        });

        router.get('/activate_user', function (req, res, next) {
            users.activateUser(req.query.id, function (success) {
                    res.send({ success: success });
                });
        });

        router.get('/activate_by_link', function (req, res, next) {
            users.activateUserByLink(req.query.link, function (success) {
                res.send({ success: success });
            });
        });

        router.post('/reset_password', function (req, res, next) {
            users.resetPassword(req.body.email, function (success, linkId) {
                if (!success) {
                    res.send({ success: success });
                    return;
                }

                var sender = require("./common/mailsender");
                log.info("Start link");
                try {
                    let link = `${req.protocol}://${req.get('host')}` + newPasswordUrl + linkId;
                    log.info("link " + link);

                    sender.sendResetPasswordLetter(link, req.body.email, function (success) {
                        res.send({ success: success });
                    });
                } catch (e) {
                    log.error(e);
                    res.send({ success: false });
                }
            });
        });

        router.post('/save_new_password', function (req, res, next) {
            users.setNewPassword(req.body.link, req.body.password, function (success) {
                res.send({ success: success, error: "cannot_set_new_password" });
            });
        });        

        return router;
    }

    setDBManager(dbManager) {
        this.dbManager = dbManager;
    }
}


module.exports = MetaRoute