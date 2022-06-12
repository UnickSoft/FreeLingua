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
    passhash_secret_key: "ENTER_YOU_SECRET_KEY_HERE",
    sendMailSerger: "smtp server name",
    sendMailPort: 465,
    sendSecure: true,
    sendMailLogin: "ENTER email here",
    sendMailPassword: "PASSWORD here"
}

module.exports = Config