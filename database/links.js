'use strict';

class Links {
    constructor(dbWrapper) {
        this.dbWrapper = dbWrapper;
    }

    Table = "shareLink"

    LinkIdLength = 32

    getRandomId(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    getLinks(userId, func) {
        var self = this;
        this.dbWrapper.select_all(this.Table, { name: "ownerId", value: userId }, function (success, rows) {
            func(success, rows);
        })
    }

    addLink(userId, templateId, title, lifeTime, isExamMode, func) {
        let self = this;
        this.dbWrapper.select_one(this.Table, [{ name: "ownerId", value: userId }, { name: "id", value: templateId }],
            function (success, row) {
                if (success) {
                    // TODO: Check link dublications.
                    let linkId = self.getRandomId(self.LinkIdLength);
                    let values = [
                        { name: "title", value: title },
                        { name: "ownerId", value: userId },
                        { name: "title", value: title },
                        { name: "link", value: linkId },
                        { name: "templateId", value: templateId },
                        { name: "createDate", value: Date.now() },
                        { name: "deleteDate", value: Date.now() + lifeTime },
                        { name: "isExamMode", value: isExamMode}
                    ];
                    self.dbWrapper.insert_or_replace(self.Table,
                        values,
                        function (success, dbSelf) {
                            func(success, linkId);
                        }
                    );
                } else {
                    func(success)
                }
            })
    }

    getLinkData(linkId, func) {
        var self = this;
        this.dbWrapper.select_one(this.Table, { name: "link", value: linkId }, function (success, row) {
            func(success, row);
        })
    }

    updateTaskId(linkId, taskId, func) {
        let values = [
            { name: "taskId", value: taskId }
        ];
        let where = { name: "id", value: linkId };
        this.dbWrapper.update(this.Table,
            values,
            where,
            function (success) {
                func(success);
            }
        );
    }

    removeLink(userId, linkId, func) {
        // All related data will be delete by timer.
        this.dbWrapper.delete(this.Table, [
            { name: "id", value: linkId },
            { name: "ownerId", value: userId }
        ], func);
    }

    getExpiredLinks(func) {
        this.dbWrapper.select_all_raw("SELECT id FROM " + this.Table +
            " WHERE deleteDate<?",
            [new Date()], function (success, rows) {
                if (success) {
                    func(success, rows);
                }
            });
    }

    deleteLinks(ids, func) {
        let arrayOfIds = [];
        for (const row of ids) {
            arrayOfIds.push(row.id);
        }
        this.dbWrapper.delete_batch(this.Table,
            { name: "id", value: arrayOfIds }, func);
    }
}


module.exports = Links