'use strict';

var dbManager = {

    database_migration : [],

    create_database_script : "createDB_sqlite.sql",
                                        
    init: function (config, func = null) {
        this.dbWrapper = config.database_wrapper;
        let dbName     = config.database_name;
        if (!this.dbWrapper.exist(dbName)) {
            const fs = require('fs');
            const path = require('path');

            let createScript = fs.readFileSync(path.join(__dirname, this.create_database_script));

            this.dbWrapper.open(dbName);
            this.dbWrapper.runSqlFile(createScript.toString(), [], func);
        } else {
            //migrate database

            this.dbWrapper.open(dbName);
        }

        var Users      = require("./users");
        this.users     = new Users(this.dbWrapper);
        var Templates  = require("./templates");
        this.templates = new Templates(this.dbWrapper);
        var Links      = require("./links");
        this.links     = new Links(this.dbWrapper);
        var Tasks = require("./tasks");
        this.tasks = new Tasks(this.dbWrapper);        

        if (!func) {
            func();
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
    }
}

module.exports = dbManager