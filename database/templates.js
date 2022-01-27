'use strict';

class Templates {
    constructor(dbWrapper) {
        this.dbWrapper = dbWrapper;
    }

    Table = "template"

    getTemplateList(userId, func) {
        var self = this;
        this.dbWrapper.select_all(this.Table, { name: "ownerId", value: userId}, function (success, rows) {
            func(rows);
        })
    }

    addOrUpdateTemplate(userId, template, title, templateId, func) {
        var self = this;
        let version = 0;

        let updateFunc = function () {
            let values = [
                { name: "title", value: title },
                { name: "ownerId", value: userId },
                { name: "lastDate", value: Date.now() },
                { name: "version", value: version },
                { name: "data", value: template }
            ];
            if (templateId) {
                values.push({ name: "id", value: templateId });
            }
            self.dbWrapper.insert_or_replace(self.Table,
                values,
                function (success, dbSelf) {
                    func(success, templateId == null ? dbSelf.lastID : templateId);
                }
            );
        }

        if (templateId) {
            this.dbWrapper.select_one(this.Table,
                [{ name: "ownerId", value: userId }, { name: "id", value: templateId }],
                function (success, row) {
                    if (success) {
                        version = row.version + 1;
                        updateFunc();
                    } else {
                        func(success);
                    }
                }
            );
        } else {
            updateFunc();
        }
    }

    getTemplate(userId, templateId, func) {
        var self = this;

        this.dbWrapper.select_one(this.Table, [
                { name: "id",       value: templateId },
                { name: "ownerId",  value: userId }
            ], func);
    }

    getPublicTemplate(templateId, func) {
        var self = this;

        this.dbWrapper.select_one(this.Table, [
            { name: "id", value: templateId },
            { name: "shared", value: true }
        ], func);
    }

    removeTemplate(userId, templateId, func) {
        this.dbWrapper.delete(this.Table, [
            { name: "id",      value: templateId },
            { name: "ownerId", value: userId }
        ], func);
    }

    setTemplateShared(userId, templateId, shared, func) {
        let self = this;
        self.dbWrapper.update(self.Table,
            [{ name: "shared", value: shared}],
            [
                { name: "id", value: templateId },
                { name: "ownerId", value: userId }
            ],
            function (success) {
                func(success);
            }
        );
    }
}


module.exports = Templates