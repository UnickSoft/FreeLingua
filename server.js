'use strict';

let init = function (dbManager, func) {
    log.info("Start init");
    try {
        let exists = dbManager.dbExists(config);

        // Init Database
        dbManager.init(config, function () {
            if (!exists) {
                if (config.admin_password == "") {
                    throw new Error("Change admin password in config.js");
                }
                dbManager.getUsers().registerUser("admin", config.admin_password, config.admin_email, "Admin", 0,
                    function () {
                        dbManager.getUsers().activateUser("admin");
                        dbManager.getUsers().makeAdmin("admin");
                        log.info("Add Admin");
                    }
                );
            }

            func();
        });
    }
    catch (err) {
        log.error(err);        
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
    var log       = require("./log");

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(sessions({
        secret: config.session_secret_key,
        saveUninitialized: true,
        cookie: { maxAge: config.sessin_lifetime },
        resave: false
    }));
    app.use(cookieParser());
    app.use(require('prerender-node').set('prerenderToken', config.prerenderToken));
    app.use(require('prerender-node').whitelisted(['/', '/catalog/.*', '/classroom/catalog/.*/task/.*']));
    app.use(require('prerender-node').set('protocol', 'https'));

    let initAfterDataBase = function () {
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

        let metaRountRaw = metaRoute.getMetaRoute(express);
        metaRountRaw.use(require('prerender-node').set('prerenderToken', config.prerenderToken));
        metaRountRaw.use(require('prerender-node').whitelisted(['/', '/catalog/.*', '/classroom/catalog/.*/task/.*']));
        metaRountRaw.use(require('prerender-node').set('protocol', 'https'));

        app.use("/", metaRountRaw);
        app.use("/en", metaRoute.getMetaRoute(express));
        app.use("/admin", adminRoute.getAdminRoute(express));
        app.use("/office", officeRoute.getOfficeRoute(express));
        app.use("/classroom", classroomRoute.getClassroomRoute(express));

        // Allows you to set port in the project properties.
        app.set('port', process.env.PORT || 3000);
        var server = null;
        if (typeof (PhusionPassenger) != 'undefined') {
            server = app.listen('passenger', function () {
                log.info('listening');
            });
        } else {
            server = app.listen(app.get('port'), function () {
                log.info('listening');
            });
        }
    }

    init(dbManager, initAfterDataBase);

} catch (err) {
    console.error(err)
}