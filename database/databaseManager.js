'use strict';

var dbManager = {

    database_migration : [],

    create_database_script : "createDB_sqlite.sql",

    meta_version: 1,
                                        
    meta_table: "meta",

    migrate_database_postfix: "_migrate_sqlite.sql",

    init: function (config, func) {
        let self = this;

        let initTables = function () {
            var Users = require("./users");
            self.users = new Users(self.dbWrapper);
            var Templates = require("./templates");
            self.templates = new Templates(self.dbWrapper);
            var Links = require("./links");
            self.links = new Links(self.dbWrapper);
            var Tasks = require("./tasks");
            self.tasks = new Tasks(self.dbWrapper);

            if (func) {
                func();
            }
        };

        this.dbWrapper = config.database_wrapper;
        let dbName     = config.database_name;
        if (!this.dbWrapper.exist(dbName)) {
            const fs = require('fs');
            const path = require('path');

            let createScript = fs.readFileSync(path.join(__dirname, this.create_database_script));

            this.dbWrapper.open(dbName);
            this.dbWrapper.runSqlFile(createScript.toString(), func);

            initTables();
        } else {
            this.dbWrapper.open(dbName);

            this.getCurrentMetaVersion(function (version) {
                if (version < self.meta_version) {
                    // Need migrate
                    self.dbWrapper.backup(version + "");
                    const path = require('path');
                    const fs = require('fs');

                    for (let i = version; i < self.meta_version; i++) {
                        let migrateScriptName = path.join(__dirname, i + self.migrate_database_postfix);
                        let migrateScript     = fs.readFileSync(migrateScriptName);
                        self.dbWrapper.runSqlFile(migrateScript.toString(), function (err) {
                                if (err) throw err;

                                initTables();
                                self.setCurrentMetaVersion(i + 1);
                            });
                    }          
                } else {
                    initTables();
                }
            });
        }
    },

    dbExists(config) {
        let dbName = config.database_name;
        return config.database_wrapper.exist(dbName);
    },

    getUsers() {
        return this.users;
    },

    getTemplates() {
        return this.templates;
    },

    getLinks() {
        return this.links;
    },

    getTasks() {
        return this.tasks;
    },

    removeDB() {
        this.dbWrapper.remove();
    },

    getCurrentMetaVersion(func) {
        this.dbWrapper.select_one(this.meta_table, null, function (err, row) {
            func(row != undefined ? row.version : 0);
        });
    },

    setCurrentMetaVersion(version) {
        let self = this;
        this.dbWrapper.runSqlFile("DELETE FROM " + this.meta_table, function (err) {
            if (err) throw err;

            self.dbWrapper.insert(self.meta_table, [{ name: "version", value: version }]);
        });
    }
}

module.exports = dbManager