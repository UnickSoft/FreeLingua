'use strict';

var isbot = require('isbot');
var fs = require('fs');
var path = require('path');

let prerenderPath = path.join(__dirname, '/static/');

var Utils = {
    sendFileName: function (req, staticPath) {
        let prerenderIndex = path.join(prerenderPath, req.originalUrl, "/index.html");
        prerenderIndex = prerenderIndex.replace(/\.\./g, '');
        prerenderIndex = prerenderIndex.replace("?_escaped_fragment_=", '');

        if (req.query._escaped_fragment_ != null && fs.existsSync(prerenderIndex)) {
            return prerenderIndex;
        } else {
            return path.join(staticPath, "_index.html");
        }
    }
}

module.exports = Utils