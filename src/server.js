//  Require the modules
var express     = require('express'),
    MongoClient = require('mongodb').MongoClient,
    routes      = require('./routes'),
    envReader   = require('./custom_modules/envReader'),
    logger      = require('./custom_modules/logger'),
    datter      = require('./custom_modules/datter');


//  Register the application
var app         = express();

//  Load the environment variables (with error logs enabled)
envReader.load(".envVars", true);


//  Define the database connection
var db = {
    name        :   process.env.DB_NAME,
    username    :   process.env.DB_USER,
    password    :   process.env.DB_PASS
};
var dbConnection = "mongodb://" + db.username + ":" + db.password + "@ds041486.mlab.com/" + db.name;



//  Database connection callback
function databaseConnection_callback(db, err) {

    'use strict';


    //  Check if there was an error in the connection
    if(err) {

        //  Construct the error message
        var databaseConnection_error = {
            date    : datter().time + " " + datter().date,
            stack   : err.trace,
            message : "There was an error connecting to the '" + db.name + "' database! \n"
        };

        //  Error out (database is a MUST for the app, that's why we close it if we cannot connect to the database)
        /*
        *   db is on the same server as the back-end
        *   this is for development purposes only (and demo apps!)
        */
        throw logger('err', databaseConnection_error);

    //  Connection established
    }


    //  Register the port number
    var appPort     = process.env.PORT;

    //  Register the application routes
    routes(app, db);


    //  Define the static file server
    // app.use(express.static("/static", __dirname + "/public/static"));
    // app.use(favicon(__dirname + "/public/static/img/favicon.png"));


    //  Define the socket for the webapp
    app.listen(appPort, function() {

        //  Construct the info message
        var serverListen_info = {
            date    : datter().time + " " + datter().date,
            message : "Server listening on the port " + appPort + "."
        };
        logger('info', serverListen_info);

    });


}

//  Connect to the database and set the application socket
MongoClient.connect(dbConnection, databaseConnection_callback);
