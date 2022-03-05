'use strict';

var isbot = require('isbot');
var fs = require('fs');
var path = require('path');

let prerenderPath = path.join(__dirname, '/static/');

var Utils = {
    sendFileName: function (req, staticPath) {
        let prerenderIndex = path.join(prerenderPath, req.path, "/index.html");
        prerenderIndex = prerenderIndex.replace(/\.\./g, '');
        if (isbot(req.get('user-agent')) && fs.existsSync(prerenderIndex)) {
            return prerenderIndex;
        } else {
            return path.join(staticPath, "_index.html");
        }
    }
}

module.exports = Utils