//  Require the modules
var logger      = require("../logger"),
    SessionsDAO = require('./index'),
    MongoClient = require('mongodb').MongoClient;


//  Connect to the database
MongoClient.connect('mongodb://localhost:27017/test', function(err, db) {

    'use strict';


    //  There was an error connecting to the database
    if(err) {
        return logger('error', {
            message: "Error connecting to the database."
        });
    }


    //  Construct a new instance of UsersDAO
    var sessions    = new SessionsDAO(db);


    //  User constructor
    function UserDocument(params) {
        this._id        =   params.username;
        this.name       =   params.name;
        this.email      =   params.email;
    }


    //  Construct a new user
    function constructDummyUser() {

        //  Promise callback
        var promise_cb = function(resolve, reject) {

            //  Resolve the promise with a dummy user document
            return resolve(
                new UserDocument({
                    username    :   'test',
                    name        :   {
                        first   :   'Ognjen',
                        last    :   'Jevremovic'
                    },
                    email       :   'jevremovic.ognjen@gmail.com'
                })
            );

        };


        //  Return a promise
        return new Promise(promise_cb);

    }

    //  Insert a session
    function addNewSession(userDocument) {

        //  Promise callback
        var promise_cb = function(resolve, reject) {

            //  Add session callback
            var addNew_cb = function(error, warning, sessionInserted) {
                //  Error (logs out from the index.js)
                if(error) {
                    return reject(error);
                }
                //  Warning (log it out)
                if(warning) {
                    logger('warning', warning);
                    return resolve({
                        warning :   warning
                    });
                }
                //  No errors/warnings
                logger('info', "Session " + sessionInserted._id + " successfuly inserted.");
                return resolve({
                    userDocument :   userDocument
                });
            };


            //  Add a session
            sessions.addNew(userDocument, addNew_cb);

        };


        //  Return a promise
        return new Promise(promise_cb);

    }

    //  Find a session
    function findSession(params) {

        //  Promise callback
        var promise_cb = function(resolve, reject) {

            //  Find session callback
            var find_cb = function(error, warning, sessionFound) {
                //  Error (logs out from the index.js)
                if(error) {
                    return reject(error);
                }
                //  Warning (log it out)
                if(warning) {
                    logger('warning', warning);
                    return resolve({
                        warning :   warning
                    });
                }
                //  No errors/warnings
                logger('info', "Session found : " + sessionFound._id);
                return resolve({
                    sessionFound    :   sessionFound
                });
            };


            //  Find session
            sessions.find(params.userDocument._id, find_cb);

        };


        //  Return a promise
        return new Promise(promise_cb);

    }

    //  Delete a session
    function deleteSession(params) {

        //  Promise callback
        var promise_cb = function(resolve, reject) {

            //  Delete session callback
            var remove_cb = function(error, warning, sessionDeleted) {
                //  Error (logs out from the index.js)
                if(error) {
                    return reject(error);
                }
                //  Warning (log it out)
                if(warning) {
                    logger('warning', warning);
                    return resolve({
                        warning :   warning
                    });
                }
                //  No errors/warnings
                logger('info', "Session " + sessionDeleted._id + " successfuly deleted.");
                return resolve({
                    sessionDeleted  :   sessionDeleted
                });
            };


            //  Delete session
            sessions.remove(params.sessionFound.user._id, remove_cb);

        };


        //  Return a promise
        return new Promise(promise_cb);

    }

    //  Error handler
    function handleError(error) {
        return;
    }


    //  Perform a check
    constructDummyUser()
        .then(addNewSession)
        .then(findSession)
        .then(deleteSession)
        .catch(handleError);

});
