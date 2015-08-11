var sqlite3 = require('sqlite3'),
    slug = require('slug'),
    fs = require('fs'),
    unzip = require('unzip'),
    plist = require('simple-plist'),
    tmp = require('temporary'),
    db = new sqlite3.Database('database.db'),
    PLIST_TEMPLATE = fs.readFileSync('./template.plist', 'utf8');

exports.all = function(fn) {
    db.all("SELECT * FROM apps", fn);
};

exports.one = function(id, fn) {
    db.get("SELECT * FROM apps WHERE id=?", [id], fn);
};

exports.remove = function(id, fn) {

    db.get("SELECT * FROM apps WHERE id=?", [id], function(err, file) {
        if (err) {
            fn(err);
            return;
        }
        if (file && file.name) {
            var filePath = './public/files/' + file.name;
            db.run("DELETE FROM apps WHERE id=?", [file.id], function(err, file) {
                fs.unlink(filePath, function(err) {
                    fn(err);
                });
            });
        } else {
            fn(err);
        }
    });
};

exports.add = function(app, fn) {

    var saveFileName = new Date().getFullYear() + '-' + new Date().getTime(),
        destFilePath = './public/files/' + saveFileName,
        sqlQuery = 'INSERT INTO apps (title, slug, name, bundleId, bundleName, version) VALUES (?, ?, ?, ?, ?, ?)',
        sqlParams;

    function delIpaTmpFile() {
        fs.unlink(app.path, new Function());
    };

    sqlParams = [
        app.title,
        slug(app.title.trim().toLowerCase()),
        saveFileName,
        app.bundleId,
        app.bundleId.split(".").pop(),
        app.version
    ];

    db.run(sqlQuery, sqlParams, function(err, row) {
        if (err) {
            delIpaTmpFile();
            fn(err)
        }
        fs.rename(app.path, destFilePath, function(err) {
            delIpaTmpFile();
            fn(err);
        });
    });

}

exports.generatePLIST = function(title, bundle, version, url, fn) {
    fn(PLIST_TEMPLATE
        .replace(/{{APP_TITLE}}/, title)
        .replace(/{{APP_URL}}/, url)
        .replace(/{{APP_BUNDLE}}/, bundle)
        .replace(/{{VERSION}}/, version));
};