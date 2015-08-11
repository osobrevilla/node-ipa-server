var model = require('../models/file');

exports.index = function(req, res) {
    console.log("index");
    model.all(function(err, files) {
        if (err) {
            throw error;
        }
        res.render('index', {
            rows: files
        });
    });
};

exports.one = function(req, res) {

    model.one(req.params.id, function(err, file) {
        if (err) {
            console.log('Error:', err);
            res.redirect('/');
        }
        if (file) {
            res.render('single', {
                id: file.id,
                title: file.title,
                url: 'http://' + req.get('host') + '/files/manifest/' + file.id
            });
        } else {
            res.status(404).send('Not found');
        }
    });
};

exports.create = function(req, res) {
    res.render('create');
};

exports.save = function(req, res) {
    if (req.body.title && req.file) {
        model.add({
            title: req.body.title,
            bundleId: req.body.bundleId,
            version: req.body.version,
            path: req.file.path
        }, function(err) {
            if (err)
                throw err;
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
};

exports.update = function(req, res) {};

exports.remove = function(req, res) {
    if (req.params.id) {
        model.remove(req.params.id, function(err) {
            if (err) {
                console.log('Error: remove', err);
            }
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
};

exports.download = function(req, res) {
    model.one(req.params.id, function(err, file) {
        if (err) {
            res.redirect('/');
        }
        if (file) {
            var filePath = './public/files/' + file.name;
            res.set('Content-Type', 'application/octet-stream');
            res.download(filePath);
        } else {
            res.status(404).send('Not found');
        }

    });
};

exports.manifest = function(req, res) {

    model.one(req.params.id, function(err, file) {

        if (!file) {
            res.status(404).send('Not found');
            return;
        }

        var url = 'http://' + req.get('host') + '/files/download/' + file.id;

        model.generatePLIST(file.bundleName, file.bundleId, file.version, url, function(data) {
            if (err) {
                res.redirect('/');
                return;
            }
            res.setHeader('content-type', 'text/xml');
            res.end(data, 'utf8');
        });
    });
};