'use strict';

class Tasks {
    constructor(dbWrapper) {
        this.dbWrapper = dbWrapper;
    }

    Table         = "task"
    TableVersions = "templateVersion"

    addTask(ownerId, templateData, isExamMode, userId, func) {
        let self = this;

        let where = [
            { name: "templateId", value: templateData.id },
            { name: "version", value: templateData.version }
        ];
        let insertNewTask = function (templateId) {
            let taskData = [
                { name: "userId", value: userId },
                { name: "ownerId", value: ownerId },
                { name: "title", value: templateData.title },
                { name: "templateId", value: templateId },
                { name: "gradeValue", value: 0 },
                { name: "gradeMax", value: 0 },
                { name: "isFinished", value: false },
                { name: "isExamMode", value: isExamMode }
            ];

            self.dbWrapper.insert_or_replace(self.Table, taskData, function (success, dbSelf) {
                if (success) {
                    let task = {};
                    task["id"] = dbSelf.lastID;
                    taskData.forEach(element => task[element.name] = element.value);
                    func(success, task);
                } else {
                    func(success, null);
                }
            });
        };

        self.dbWrapper.select_one(self.TableVersions, where, function (success, row) {
            if (success && row) {
                insertNewTask(row.id);
            } else {
                let values = [
                    { name: "data", value: templateData.data },
                    ...where,
                ];
                self.dbWrapper.insert_or_replace(self.TableVersions,
                    values,
                    function (success, dbSelf) {
                        if (success) {
                            insertNewTask(dbSelf.lastID);
                        } else {
                            func(success, null);
                        }
                    }
                );
            }
        });
    }

    getTaskData(ownerId, taskId, userId, func) {
        let where = [
            { name: "ownerId", value: ownerId },
            { name: "id", value: taskId },
            { name: "userId", value: userId },
        ];

        let self = this;

        this.dbWrapper.select_one(this.Table, where, function (success, taskData) {
            if (success && taskData) {
                if (taskData.templateId) {
                    let whereVersion = {
                        name: "id", value: taskData.templateId
                    }
                    self.dbWrapper.select_one(self.TableVersions, whereVersion, function (success, versionData) {
                        if (success && versionData) {
                            taskData["template_data"] = versionData.data;
                            func(success, taskData);
                        } else {
                            func(false, null);
                        }
                    });
                } else {
                    func(false, null);
                }
            } else {
                func(false, null);
            }
        });
    }

    saveTaskResult(taskId, userId, result, func) {
        let values = [
            { name: "result", value: result },
        ];
        let where = [
            { name: "id", value: taskId },
            { name: "userId", value: userId },            
        ];
        this.dbWrapper.update(this.Table,
            values,
            where,
            function (success) {
                func(success);
            }
        );
    }

    getVersionWithoutTasks(func) {
        this.dbWrapper.select_all_raw("SELECT id FROM " + this.TableVersions +
            " WHERE id NOT IN (SELECT templateId FROM " + this.Table + ")",
            [], function (success, rows) {
            if (success) {
                func(success, rows);
            }
        });
    }

    getTasksWithoutLinks(links, func) {
        this.dbWrapper.select_all_raw("SELECT id FROM " + this.Table +
            " WHERE id NOT IN (SELECT taskId FROM " + links.Table + ")",
            [], function (success, rows) {
                if (success) {
                    func(success, rows);
                }
            });
    }

    deleteVersions(ids, func) {
        let arrayOfIds = [];
        for (const row of ids) {
            arrayOfIds.push(row.id);
        }
        this.dbWrapper.delete_batch(this.TableVersions,
            { name : "id", value: arrayOfIds }, func);
    }

    deleteTasks(ids, func) {
        let arrayOfIds = [];
        for (const row of ids) {
            arrayOfIds.push(row.id);
        }
        this.dbWrapper.delete_batch(this.Table,
            { name: "id", value: arrayOfIds }, func);
    }
}


module.exports = Tasks