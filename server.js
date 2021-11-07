'use strict';

let logError = function (error) {
    console.error(error);
    const fs = require('fs');
    const path = require('path');
    fs.appendFileSync(path.join(__dirname, config.error_log_file), error + "\n");
}

let logInfo = function (info) {
    console.log(info);
    const fs = require('fs');
    const path = require('path');
    fs.appendFileSync(path.join(__dirname, config.info_log_file), info + "\n");
}

let init = function (dbManager) {
    logInfo("Start init");
    if (config.admin_password == "") {
        console.error("Change admin password in config.js");
        throw new Error("Change admin password in config.js");
    }
    try {
        logInfo("Check exists");
        let exists = dbManager.dbExists(config);
        logInfo("Check exists2");
        // Init Database
        dbManager.init(config, function () {
            if (!exists) {
                logInfo("Try reg admin");
                dbManager.getUsers().registerUser("admin", config.admin_password, config.admin_email, "Admin", 0,
                    function () {
                        dbManager.getUsers().activateUser("admin");
                        dbManager.getUsers().makeAdmin("admin");
                        logInfo("Add Admin");
                    }
                );
            }
        });
    }
    catch (err) {
        logError(err);
        dbManager.removeDB();
    }
}

if (typeof (PhusionPassenger) != 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
}

try
{    
    // Common stuff
    var express    = require('express');
    var app        = express();
    const sessions = require('express-session');
    const cookieParser = require("cookie-parser");

    // Our stuffs
    var config    = require("./config");
    var dbManager = require("./database/databaseManager");

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(sessions({
        secret: config.session_secret_key,
        saveUninitialized: true,
        cookie: { maxAge: config.sessin_lifetime },
        resave: false
    }));
    app.use(cookieParser());

    init(dbManager);

    let MetaRoute = require('./metaroute');
    let metaRoute = new MetaRoute();
    metaRoute.setDBManager(dbManager);

    let AdminRoute = require('./adminroute');
    let adminRoute = new AdminRoute();
    adminRoute.setDBManager(dbManager);

    let OfficeRoute = require('./officeroute');
    let officeRoute = new OfficeRoute();
    officeRoute.setDBManager(dbManager);

    let ClassRoomRoute = require('./classroomroute');
    let classroomRoute = new ClassRoomRoute();
    classroomRoute.setDBManager(dbManager);

    app.use("/", metaRoute.getMetaRoute(express));
    app.use("/admin", adminRoute.getAdminRoute(express));
    app.use("/office", officeRoute.getOfficeRoute(express));
    app.use("/classroom", classroomRoute.getClassroomRoute(express));

    // Allows you to set port in the project properties.
    app.set('port', process.env.PORT || 3000);
    var server = null;
    if (typeof (PhusionPassenger) != 'undefined') {
        server = app.listen('passenger', function () {
            console.log('listening');
        });
    } else {
        server = app.listen(app.get('port'), function () {
            console.log('listening');
        });
    }

} catch (err) {
    console.error(err.message)
}