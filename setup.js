var fs = require('fs'),
    sqlite3 = require('sqlite3').verbose(),
    stdout = process.stdout,
    __dirname = require('path').dirname(),
    databaseName = 'database.db',

    filesPath = __dirname + '/public/files',
    databasePath = __dirname + '/' + databaseName,
    db = null;


// create files directory if not exist
if (!fs.existsSync(filesPath))
    createFilesDirectory();
// create sqlite database
if (!fs.existsSync(databasePath))
    createDatabase();


function createFilesDirectory() {
    out('Create files dir.');
    try {
        fs.mkdirSync(filesPath);
        fs.writeFileSync(filesPath + '/index.html', '');
        done();
    } catch (e) {
        error(e.toString());
    }
}

function createDatabase() {
    out('Create SQlite3 database');
    db = new sqlite3.Database(databasePath, createTable);
    done();
}

function createTable() {
    out('Create table "apps" if not exist');
    var sql = 'CREATE TABLE IF NOT EXISTS apps (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, slug TEXT, name TEXT, bundleId TEXT, bundleName TEXT, version TEXT)';
    db.exec(sql, function(err) {
        db.close();
        if (err) throw err;
        done();
    });
}

function error(message) {
    stdout.write('\033[31m' + message + '\033[39m');
}

function out(message) {
    stdout.write('\033[32m' + message + '\033[39m');
}

function done() {
    stdout.write('\033[32m [OK] \033[39m\n');
}
