'use strict';


var Config = {
    // Use sqlite
    database_wrapper : require("./database/sqliteWrapper"),
    database_name: "learning.db",
    sessin_lifetime: 1000 * 60 * 60 * 24 * 14, // 14 dayes
    error_log_file: "logs/error_log.txt",
    info_log_file: "logs/info_log.txt",

    // Plase change it
    session_secret_key: "supersecretifdonttellyouit",
    admin_password: "",
    admin_email: "",
}

module.exports = Config