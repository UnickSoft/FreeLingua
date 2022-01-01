'use strict';

class ClassroomRoute {
    constructor() {
    }

    getClassroomRoute(express) {
        var path = require('path');
        var router = express.Router();
        var staticPath = path.join(__dirname, '/dist/');

        var dbManager = require("./database/databaseManager");
        var templates = dbManager.getTemplates();
        var links     = dbManager.getLinks();
        var tasks = dbManager.getTasks();

        // Redirects
        router.get('/link/:linkId', function (req, res, next) {
            res.sendFile(path.join(staticPath, "classroom/index.html"));
        });

        router.get('/get_task_by_link', function (req, res, next) {
            var session = req.session;

            let insertTaskAndReturn = function (linkData) {
                templates.getTemplate(linkData.ownerId, linkData.templateId, function (success, templateData) {
                    if (success && templateData) {
                        tasks.addTask(linkData.ownerId, templateData, linkData.isExamMode, null,  function (success, taskData) {
                            if (success) {
                                links.updateTaskId(linkData.id, taskData.id, function (success) {
                                    if (success) {
                                        // TODO: encode answers.
                                        taskData["template_data"] = templateData.data;
                                        res.send({ success: success, data: taskData });
                                    } else {
                                        res.send({ success: success });
                                    }
                                });
                            } else {
                                res.send({ success: success });
                            }
                        });
                    } else {
                        res.send({ success: false });
                    }
                });
            };

            links.getLinkData(req.query.linkId,
                function (success, linkData) {
                    if (success) {
                        if ("taskId" in linkData && linkData.taskId){
                            tasks.getTaskData(linkData.ownerId, linkData.taskId, null, function (success, taskData) {
                                if (success) {
                                    res.send({ success: success, data: taskData });
                                } else {
                                    insertTaskAndReturn(linkData);
                                }
                            });
                        } else {
                            insertTaskAndReturn(linkData);
                        }
                    } else {
                        res.send({ success: success });
                    }
                });
        });

        router.post('/save_task_result_by_link', function (req, res, next) {
            links.getLinkData(req.body.linkId,
                function (success, linkData) {
                    if (success) {
                        if ("taskId" in linkData && linkData.taskId) {
                            tasks.saveTaskResult(linkData.taskId, null, req.body.result, function (success, taskData) {
                                res.send({ success: success });
                            });
                        } else {
                            res.send({ success: success });
                        }
                    } else {
                        res.send({ success: success });
                    }
                });
        });        

        return router;
    }

    setDBManager(dbManager) {
        this.dbManager = dbManager;
    }
}


module.exports = ClassroomRoute