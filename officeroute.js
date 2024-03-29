'use strict';

class OfficeRoute {
    constructor() {
    }

    getOfficeRoute(express) {
        var path = require('path');
        var router = express.Router();
        var staticPath = path.join(__dirname, '/dist/');

        // Simple return html
        router.get('/', function (req, res, next) {
            res.sendFile(path.join(staticPath, "office/_index.html"));
        });
        router.get('/task', function (req, res, next) {
            res.sendFile(path.join(staticPath, "office/_index.html"));
        });
        router.get('/task/:templateId', function (req, res, next) {
            res.sendFile(path.join(staticPath, "office/_index.html"));
        });
        router.get('/link/:linkId', function (req, res, next) {
            res.sendFile(path.join(staticPath, "office/_index.html"));
        });
        router.get('/links', function (req, res, next) {
            res.sendFile(path.join(staticPath, "office/_index.html"));
        });
        router.get('/new_task', function (req, res, next) {
            res.sendFile(path.join(staticPath, "office/_index.html"));
        });
        router.get('/test_template/:templateId', function (req, res, next) {
            res.sendFile(path.join(staticPath, "office/_index.html"));
        });

        // Disable all invalid users.
        router.use(function (req, res, next) {
            var session = req.session;
            if (session.userInfo && session.userInfo.isActivated) {
                next()
            } else {
                res.send({ error: "You are not valid user", needLogin: true });
            }
        });

        var dbManager = require("./database/databaseManager");
        var templates = dbManager.getTemplates();
        var links      = dbManager.getLinks();
        var categories = dbManager.getCategories();

        router.get('/get_templates', function (req, res, next) {
            var session = req.session;
            templates.getTemplateList(session.userInfo.id, function (list) {
                res.send({ templates: list });
            });
        });

        router.post('/save_template', function (req, res, next) {
            var session = req.session;

            templates.addOrUpdateTemplate(session.userInfo.id,
                req.body.template,
                req.body.title,
                "templateId" in req.body ? req.body.templateId : null,
                function (success, id) {
                        res.send({ success: success, templateId: id });
                    });
        });

        router.get('/get_template', function (req, res, next) {
            var session = req.session;

            templates.getTemplate(session.userInfo.id,
                req.query.templateId,
                function (success, templateData) {
                    if (success)
                        res.send({ success: success, data: templateData });
                    else
                        res.send({ success: success });
                });
        });

        router.post('/delete_template', function (req, res, next) {
            var session = req.session;

            templates.removeTemplate(session.userInfo.id,
                req.body.templateId,
                function (success) {
                    res.send({ success: success});
                });
        });

        router.get('/get_shared_links', function (req, res, next) {
            var session = req.session;

            links.getLinks(session.userInfo.id,
                function (success, linksData) {
                    if (success)
                        res.send({ success: success, links: linksData });
                    else
                        res.send({ success: success });
                });
        });

        router.post('/add_sharelink', function (req, res, next) {
            var session = req.session;

            links.addLink(session.userInfo.id, req.body.templateId, req.body.title, req.body.lifeTime, req.body.isExamMode,
                function (success, linkId) {
                    if (success)
                        res.send({ success: success, linkId: linkId });
                    else
                        res.send({ success: success });
                });
        });

        router.post('/delete_link', function (req, res, next) {
            var session = req.session;

            links.removeLink(session.userInfo.id,
                req.body.linkId,
                function (success) {
                    res.send({ success: success });
                });
        });

        router.post('/set_template_public_category', function (req, res, next) {
            var session = req.session;

            templates.getTemplate(session.userInfo.id, req.body.id, function (success, templateData) {
                if (success) {
                    categories.setTemplateCategories(req.body.id, req.body.categories, function (success) {
                        templates.setTemplateShared(session.userInfo.id, req.body.id, req.body.categories.length > 0, function (success) {
                            res.send({ success: success });
                        });
                    });
                }
            });
        });

        router.get('/get_template_public_categories', function (req, res, next) {
            var session = req.session;

            templates.getTemplate(session.userInfo.id, req.query.id, function (success, templateData) {
                if (success) {
                    categories.getTemplateCategories(req.query.id, function (success, categories) {
                        res.send({ success: success, categories: categories });
                    });
                }
            });
        });

        return router;
    }

    setDBManager(dbManager) {
        this.dbManager = dbManager;
    }
}


module.exports = OfficeRoute