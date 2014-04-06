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


exports.add = function(args, fn) {

    var saveFileName = new Date().getFullYear() + '-' + new Date().getTime(),
        destFilePath = './public/files/' + saveFileName,
        sqlQuery = 'INSERT INTO apps (title, slug, name, bundleId, bundleName) VALUES (?, ?, ?, ?, ?)',
        save = function(entry) {

            if (/Info\.plist/.test(entry.path)) {

                var tmpFile = new tmp.File();

                entry.pipe(fs.createWriteStream(tmpFile.path)).on('close', function() {

                    var plistJSON = plist.readFileSync(tmpFile.path),
                        sqlParams = [
                            args.title,
                            slug(args.title.trim().toLowerCase()),
                            saveFileName,
                            plistJSON.CFBundleIdentifier,
                            plistJSON.CFBundleName
                        ];
                    db.run(sqlQuery, sqlParams, function(err, row) {
                        if (err) {
                            tmpFile.unlink();
                            fs.unlink(args.tmpFile);
                            throw err;
                        }
                        fs.rename(args.tmpFile, destFilePath, function() {
                            if (err)
                                throw err;
                            tmpFile.unlink();
                            fs.unlink(args.tmpFile);
                            fn(err);
                        });
                    });
                });

            } else {
                entry.autodrain();
            }
        };


    fs.createReadStream(args.tmpFile)
        .pipe(unzip.Parse())
        .on('entry', save).on("error", function(err) {
            fn(err);
        });
}

exports.generatePLIST = function(title, bundle, url, fn) {
    fn(PLIST_TEMPLATE
        .replace(/{{APP_TITLE}}/, title)
        .replace(/{{APP_URL}}/, url)
        .replace(/{{APP_BUNDLE}}/, bundle));
};