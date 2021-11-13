'use strict';

var config = require("./config");

var Log = {
    dumpError : function (err) {
        let res = "";
        if (typeof err === 'string') {
            res = err;
        } else if (typeof err === 'object') {
            if (err.message) {
                res += '\nMessage: ' + err.message;
            }
            if (err.stack) {
                res += '\nStacktrace:';
                res += '====================';
                res += err.stack;
            }
        } else {
            console.log('dumpError :: argument is not an object');
            res = err;
        }
        return res;
    },

    error: function (error) {
        console.log(error);
        let formatedMessage = this.dumpError(error);
        console.error(formatedMessage);
        const fs   = require('fs');
        const path = require('path');
        fs.appendFileSync(path.join(__dirname, config.error_log_file), formatedMessage + "\n");
    },

    info: function (info) {
        console.log(info);
        const fs = require('fs');
        const path = require('path');
        fs.appendFileSync(path.join(__dirname, config.info_log_file), info + "\n");
    }
}

module.exports = Log