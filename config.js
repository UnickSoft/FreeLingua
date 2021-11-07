'use strict';


var Config = {
    // Use sqlite
    database_wrapper : require("./database/sqliteWrapper"),
    database_name: "learning.db",
    sessin_lifetime: 1000 * 60 * 60 * 24 * 14, // 14 dayes
    log_file: "error_log.txt",

    // Plase change it
    session_secret_key: "supersecretifdonttellyouit",
    admin_password: "",
    admin_email: "",
}

module.exports = Config