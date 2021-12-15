'use strict';

const sqlite3 = require('sqlite3').verbose();

var sqlWrapper = {

    // Directory where we save out database
    database_dir : "../data/",

    parseWhere: function (where) {
        let whereStr = "";
        let whereValue = []
        if (Array.isArray(where)) {
            for (const w of where) {
                let first = whereStr.length == 0;
                whereStr += (first ? "" : " AND ") + w.name + (w.value ? "=?" : " IS NULL");
                if (w.value) {
                    whereValue.push(w.value);
                }
            }
        } else {
            whereStr = where.name + '=?';
            whereValue.push(where.value);
        }

        return { str: whereStr, value: whereValue};
    },

    exist: function (dbName) {
        const fs = require('fs');
        return fs.existsSync(this.getFullPath(dbName));
    },

    open: function (filename) {
        this.db = new sqlite3.Database(this.getFullPath(filename));
        this.filename = filename;
    },
    // field -> {name, type}
    create_table: function (tableName, fields, func = null) {
        let fieldsStr = "";
        for (const field of fields) {
            let first = fieldsStr.length == 0;

            fieldsStr += (first ? "" : ",")+ field.name + " " + field.type;
        }

        this.run('CREATE TABLE ' + tableName + '(' + fieldsStr + ')', [], func);
    },
    // fields -> {name, value}
    insert: function (tableName, fields, func = null) {
        let fieldsStr = "";
        let fieldsQStr = "";
        let values = [];
        for (const field of fields) {
            let first = fieldsStr.length == 0;
            fieldsStr  += (first ? "" : ",") + field.name;
            fieldsQStr += (first ? "" : ",") + '?';
            values.push(field.value);
        }

        this.run('INSERT INTO ' + tableName + '(' + fieldsStr + ') VALUES(' + fieldsQStr + ')', values, func);
    },
    // field -> {name, value}
    // where -> {name, value}
    update: function (tableName, fields, where, func) {
        let fieldsStr = "";
        let values = [];
        for (const field of fields) {
            let first = fieldsStr.length == 0;
            fieldsStr += (first ? "" : ",") + field.name + "=?";
            values.push(field.value);
        }

        let whereRes = this.parseWhere(where);
        let whereStr = whereRes.str;
        values = values.concat(whereRes.value);

        this.run('UPDATE ' + tableName + ' SET ' + fieldsStr + ' WHERE ' + whereStr, values, func);
    },

    // where -> {field name, value}
    select_all: function (tableName, where, func) {
        // SELECT * FROM Book;

        let q = 'SELECT * FROM ' + tableName + (where != null ? ' WHERE ' + where.name + '=?' : '');
        this.db.all(q, where != null ? [where.value] : [], (err, rows) => {
            if (err) {
                console.log(err);
                func(!err, []);
                return;
            }
            func(!err, rows);
        });
    },

    // where -> {field name, value}
    select_one: function (tableName, where, func) {
        let whereStr = "";
        let whereValue = []
        if (Array.isArray(where)) {
            for (const w of where) {
                let first = whereStr.length == 0;
                whereStr += (first ? "" : " AND ") + w.name + (w.value ? "=?" : " IS NULL");
                if (w.value) {
                    whereValue.push(w.value);
                }
            }
        } else {
            whereStr = where.name + '=?';
            whereValue.push(where.value);
        }

        let q = 'SELECT * FROM ' + tableName + ' WHERE ' + whereStr;
        this.db.get(q, whereValue, (err, rows) => {
            if (err) {
                console.log(err);
            }
            func(!err, rows);
        });
    },

    // field -> {name, value}
    insert_or_replace: function (tableName, fields, func) {
        // INSERT OR REPLACE INTO Book(ID, Name) VALUES(1001, 'SQLite');
        let valueStr = "";
        let fieldsStr = "";
        let values = [];
        for (const field of fields) {
            let first = fieldsStr.length == 0;
            valueStr  += (first ? "" : ",") + "?";
            fieldsStr += (first ? "" : ",") + field.name;
            values.push(field.value);
        }

        this.run('INSERT OR REPLACE INTO ' + tableName + '(' + fieldsStr + ') VALUES(' + valueStr + ')', values, func);
    },

    run: function (q, values, func = null) {
        this.db.run(q, values, function (err) {
            if (err) {
                console.log(err.message + " quary=" + q);
            }
            if (func != null) {
                func(!err, this);
            }
        });
    },

    // where -> {field name, value}
    delete: function (tableName, where, func) {
        let whereStr = "";
        let whereValue = []
        if (Array.isArray(where)) {
            for (const w of where) {
                let first = whereStr.length == 0;
                whereStr += (first ? "" : " AND ") + w.name + "=?";
                whereValue.push(w.value);
            }
        } else {
            whereStr = where.name + '=?';
            whereValue.push(where.value);
        }

        let q = 'DELETE FROM ' + tableName + ' WHERE ' + whereStr;
        this.db.run(q, whereValue, (err) => {
            if (err) {
                console.log(err);
            }
            if (func != null) {
                func(!err);
            }
        });
    },

    runSqlFile: function (q, values, func = null) {
        const splittedCommands = q.split(');');
        let self = this;
        this.db.serialize(() => {
            self.db.run("BEGIN TRANSACTION;", {}, null);
            splittedCommands.forEach((query) => {
                if (query && query.length > 0) {
                    query += ');';
                    //console.log(query);
                    self.db.run(query, (err) => {
                        if (err) throw err;
                    });
                }
            });
            self.db.run('COMMIT;', func);
        });
    },

    close: function () {
        this.db.close();
    },

    remove: function () {
        this.db.close();
        const fs = require('fs');
        let deletedFile = this.getFullPath(this.filename + "_removed");
        if (fs.existsSync(deletedFile)) {
            fs.unlinkSync(deletedFile);
        }
        fs.renameSync(this.getFullPath(this.filename), deletedFile);
    },

    getFullPath: function (dbname) {
        const path = require('path');
        return path.join(path.join(__dirname, this.database_dir), dbname);
    }
};

module.exports = sqlWrapper

