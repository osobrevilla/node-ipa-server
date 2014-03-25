var sqlite3 = require('sqlite3'),
    slug = require('slug'),
    fs = require('fs'),
    jsxml = require("node-jsxml"),
    unzip = require('unzip'),
    exec = require('child_process').exec,
    db = new sqlite3.Database('ipas.db');

exports.all = function (fn) {
    db.all("SELECT * FROM ipas", fn);
};

exports.one = function (id, fn) {
    db.get("SELECT * FROM ipas WHERE id=?", [id], fn);
};

exports.remove = function (id, fn) {

    db.get("SELECT * FROM ipas WHERE id=?", [id], function (err, file) {
        if (err) {
            fn(err);
            console.log(err);
            return;
        }
      
        if (file && file.dir) {
            var dir = './public/files/' + file.dir;
            db.exec("DELETE FROM ipas WHERE id=" + file.id, function (err, file) {
                exec('rm -rf ' + dir, function (err, out) {
                    fn(err, out);
                });
                if (err)
                    fn(err, out);
            });
        } else {
            fn(err);
        }
    });
};

exports.add = function (args, fn) {

    var dirName = new Date().getFullYear() + '-' + new Date().getTime(),
        dirPath = './public/files/' + dirName;

    fs.mkdir(dirPath, function (e) {

        fs.createReadStream(args.tmpFile)
            .pipe(unzip.Parse())
            .on('entry', function (entry) {
                var fileName = entry.path;
                if ((/\.(ipa|plist)$/i).test(fileName)) {
                    entry.pipe(fs.createWriteStream(dirPath + '/' + fileName));
                } else {
                    entry.autodrain();
                }
            }).on("finish", function (e) {

                deleteTmpFile(args.tmpFile);
                getIpaName(dirPath, function (fileName) {
                    var params = [
                        args.title,
                        slug(args.title.trim().toLowerCase()),
                        dirName,
                        fileName
                    ];
                    db.run('INSERT INTO ipas (title, slug, dir, name) VALUES (?, ?, ?, ?)', params,
                        function (err, row) {
                            if (err) throw err;
                            fn(null);
                        });
                });
            }).on("error", function (e) {
                fn(e);
            });

    });
}

exports.generatePLIST = function (source, ipaUrl, fn) {

    fs.readFile(source, 'utf8', function (err, data) {

        if (err)
            fn(err);

        var xml = new jsxml.XML(data);

        xml.child('dict')
            .child('array')
            .child("dict")
            .child('array')
            .child('dict')
            .child('string')
            .children()
            .each(function (item, i) {
                if (i === 1) {
                    item.setValue(ipaUrl);
                    fn(null, xml.toXMLString());
                }
            });
    });
};

function deleteTmpFile(file) {
    fs.unlink(file, function (err) {
        if (err) throw err;
    });
}

function getIpaName(dir, fn) {
    fs.readdir(dir, function (err, files) {
        if (err) throw err;
        for (var i = 0; i < files.length; i++) {
            if ((/\.ipa$/i).test(files[i])) {
                fn(files[i].replace(/\.ipa$/i, ''));
                break;
            }
        }
    });
};