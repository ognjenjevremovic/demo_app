//  Dependancies
var express     =   require('express'),
    MongoClient =   require('mongodb').MongoClient,
    envVars     =   require('pretty-easy-env-vars'),
    dates       =   require('pretty-easy-dates'),

    //  application routes
    routes      =   require('./routes'),

    //  helper modules
    helpers     =   require('./custom_modules/helpers'),
    CustomError =   helpers.Error,
    log         =   helpers.logger,

    //  initialize the application
    app =   express();


//  Load environment variables
envVars();


//  Define the database connection
var db = {};
db.name     =   process.env.DB_NAME;
db.username =   process.env.DB_NAME;
db.password =   process.env.DB_PASS;

var dbConnectionURL =   "mongodb://" + db.username + ":" + db.password + "@ds041486.mlab.com/" + db.name;


//  Connect to the database and open the application socket
MongoClient.connect(dbConnectionURL, databaseConnection_callback);


//  Database connection callback
function databaseConnection_callback(db, errorConnection) {
    'use strict';


    //  init
    var portNum,
    _err, _errMessage,
    _info, _infoMessage;


    //  Error connection
    if(errorConnection) {
        //  Construct the error message
        _err =  {};
        _err.message =  "There was an error connecting to the '" + db.name + "' database!";
        _err.stack   =  errorConnection.trace;
        _errMessage =   new CustomError(_err);

        log.err(_errMessage);

        /*
        *   Error out
        *   database is a MUST for the app, that's why we close the application
        *   it if we cannot connect to the database
        */
        throw new Error('\n\n   => Database connection error! ');
    }


    //  Register the application routes
    routes(app, db);
    //  Get the port number
    portNum =   process.env.PORT;

    //  Define the static file server
    // app.use(express.static("/static", __dirname + "/public/static"));
    // app.use(favicon(__dirname + "/public/static/img/favicon.png"));


    //  Define the socket for the webapp
    app.listen(portNum, function() {
        //  Construct the info message
        _info = {};
        _info.message = "Application running!";
        _info.stack   = "Server listening on the port " + portNum + ".";
        _infoMessage  = new CustomError(_info);

        log.info(_infoMessage);
    });
}
