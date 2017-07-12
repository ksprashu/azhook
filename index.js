var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var Promise = require('bluebird');

var config = require('./config');

var path = require('path');
var replace = require('replace');
var copydir = require('copy-dir');

app.use(bodyParser.json());

var apigeetool = require('apigeetool');
var sdk = apigeetool.getPromiseSDK();

var localFolderPrefix = './';
var zipPostfix = '.zip';
var proxyFile = '/apiproxy/proxies/default.xml';
var targetFile = '/apiproxy/targets/default.xml';

app.post('/azhook', function(req, res, next) {
    if (!req.body) return res.sendStatus(400);
    if (req.body.status != 'success') return res.sendStatus(400);

    var sourceBundle = 'passthrough_proxy';
    var targetBundle = req.body.siteName + '_proxy';

    var sourceDir = path.join('./passthrough_proxy');
    var targetDir = path.join('./temp', req.body.siteName + '_proxy');
    var targetFile = path.join(targetDir, 'apiproxy', 'targets', 'default.xml');
    var proxyFile = path.join(targetDir, 'apiproxy', 'proxies', 'default.xml');

    /*loadProxyBundle(sourceBundle)
        .then(function(bundle) {
            return replaceStringInBundle(bundle, sourceBundle + proxyFile, 'sitenamefromazure', req.body.siteName);
        }).then(function(bundle) {
            return replaceStringInBundle(bundle, sourceBundle + targetFile, 'hostnamefromazure', req.body.hostName, targetBundle)
        }).then(function(bundle) {
            return saveTargetBundle(bundle, targetBundle);
        }).then(function(bundlePath) {
            return importProxyFromZip(bundlePath, req.body.siteName);
        }).then(function(revision) {
            return deployProxyRevision(revision, req.body.siteName);
        }).then(function(result) {
            res.status(201).json(result);
        }).catch(function(err) {
            console.log(err);
            res.status(500).send(err);
        });*/

    copyProxyBundle(sourceDir, targetDir)
        .then(function() {
            return replaceTargetPath(targetFile, req.body.hostName);
        }).then(function(result) {
            return replaceBasePath(proxyFile, req.body.siteName);
        }).then(function(result) {
            return deployProxyWithSDK(targetDir, req.body.siteName);
        }).then(function(result) {
            res.status(201).json(result);
        }).catch(function(err) {
            console.log(err);
            res.status(500).send(err);
        });
});

app.listen(9001, function() {
    console.log('server started');
});

/*var loadProxyBundle = function(sourceBundle) {
    return new Promise(function(resolve, reject) {
        console.log('loading zipfile ' + sourceBundle);
        // var zip = new AdmZip('./' + sourceBundle + '.zip');
        return resolve(zip);
    });
};

var replaceStringInBundle = function(bundle, fileName, toReplace, replaceWith, newName) {
    return new Promise(function(resolve, reject) {
        console.log('filename ' + fileName);
        console.log('replacing ' + toReplace + ' with ' + replaceWith);

        var data = bundle.readFile(fileName);
        var dataString = data.toString();

        var newString = dataString.replace(toReplace, replaceWith);

        var newData = Buffer.from(newString);
        bundle.updateFile(fileName, newData);

        resolve(bundle);
    });
};

var saveTargetBundle = function(bundle, newName) {
    return new Promise(function(resolve, reject) {
        console.log('saving zipfile ' + newName);
        bundle.writeZip(newName + '.zip');

        resolve('./' + newName + '.zip');
    });
};

var importProxyFromZip = function(bundlePath, c) {
    return new Promise(function(resolve, reject) {
        console.log('uploading file ' + bundlePath);
        var options = {
            method: 'POST',
            uri: 'https://api.enterprise.apigee.com/v1/organizations/ksp/apis?validate=true&action=import&name=' + siteName,
            headers: {
                'Authorization': 'Basic a3NwcmFzaGFudGhAZ29vZ2xlLmNvbTpYdHJlbWU0cyo=',
                'Accept': 'application/json'
            }
        };
        request(options, function(err, resp, body) {
            console.log(resp);
            if (!err)
                return resolve(resp);
            else
                return reject(err);
        });

        var form = req.form();
        form.append(siteName, fs.createReadStream(bundleName))
    });
};

var deployProxyRevision = function(revision, siteName) {
    return new Promise(function(resolve, reject) {

    });
};*/

/*var copyProxyBundle = function(sourceBundle, targetBundle, sourceDir, targetDir) {
    return new Promise(function(resolve, reject) {
        console.log('copying file ' + sourceBundle + ' to ' + targetBundle);
        copydir(sourceDir, targetDir, function(err) {
            if (err) reject(err);
            else resolve();
        });
    });
};*/

var copyProxyBundle = function(sourceDir, targetDir) {
    return new Promise(function(resolve, reject) {
        console.log('copying directory ' + sourceDir + ' to ' + targetDir);
        copydir(sourceDir, targetDir, function(err) {
            if (err) reject(err);
            else resolve();
        });
    });
};

var replaceTargetPath = function(targetFile, hostName) {
    return new Promise(function(resolve, reject) {
        console.log('replacing ' + hostName + ' in ' + targetFile);
        replace({
            regex: "hostnamefromazure",
            replacement: hostName,
            paths: [targetFile],
            recursive: false,
            silent: true,
        });

        setTimeout(function() {
            resolve();
        }, 1000);
    });
};

var replaceBasePath = function(proxyFile, siteName) {
    return new Promise(function(resolve, reject) {
        console.log('replacing ' + siteName + ' in ' + proxyFile);
        replace({
            regex: "sitenamefromazure",
            replacement: siteName,
            paths: [proxyFile],
            recursive: false,
            silent: false,
        });

        setTimeout(function() {
            resolve();
        }, 1000);
    });
};

var deployProxyWithSDK = function(targetDir, siteName) {
    return new Promise(function(resolve, reject) {
        console.log('publishing proxy ' + siteName + ' from ' + targetDir);

        var opts = {
            organization: config.org,
            environments: config.env,
            username: config.user,
            password: config.pass,
            api: siteName + '_proxy',
            directory: targetDir
        };

        sdk.deployProxy(opts)
            .then(function(result) {
                console.log(result);
                resolve(result);
            }, function(err) {
                console.log(err);
                reject(err);
            });
    });
};