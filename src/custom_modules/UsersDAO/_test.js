//  Require the modules
var logger      = require('../logger'),
    UsersDAO    = require('./index'),
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
    var users       = new UsersDAO(db);


    //  User constructor
    function UserDocument(params) {
        this.username   =   params.username;
        this.name       =   params.name;
        this.email      =   params.email;
        this.password   =   params.password;
    }


    //  Construct a new user
    function constructDummyUser() {

        //  Promise callback
        var promise_cb = function(resolve) {

            //  Resolve the promise with a dummy user document
            return resolve(
                new UserDocument({
                    username    :   'test',
                    name        :   {
                        first   :   'Ognjen',
                        last    :   'Jevremovic'
                    },
                    email       :   'jevremovic.ognjen@gmail.com',
                    password    :   '1234'
                })
            );

        };


        //  Return a promise
        return new Promise(promise_cb);

    }

    //  Add a new user
    function addNewUser(userDocument) {

        //  Promise callback
        var promise_cb = function(resolve, reject) {

            //  Add user callback
            var addNew_cb = function(error, warning, userInserted) {
                //  Error (logs out from the index.js)
                if(error) {
                    return reject(error);
                }
                //  Warning (log it out)
                if(warning) {
                    logger('warning', warning);
                    return resolve({
                        warning     :   warning
                    });
                }
                //  No errors/warning
                logger('info', 'User ' + userInserted._id + ' successfuly insterted.');
                return resolve({
                    userInserted    :   userInserted
                });
            };


            //  Add new user
            users.addNew(userDocument, addNew_cb);

        };


        //  Return a promise
        return new Promise(promise_cb);

    }

    //  Authenticate a user
    function authenticateUser(userInserted) {

        //  Promise callback
        var promise_cb = function(resolve, reject) {

            //  Authenticate user callback
            var authenticate_cb = function(error, warning, userAuthenticated) {
                //  Error (logs out in index)
                if(error) {
                    return reject(error);
                }
                //  Warnign (log it out)
                if(warning) {
                    logger('warning', warning);
                    return resolve({
                        warning     :   warning
                    });
                }
                //  No errors/warning
                logger('info', 'User ' + userAuthenticated._id + ' successfuly authenticated.');
                return resolve();
            };


            //  Authenticate user
            users.authenticate({
                username    :   'test',
                password    :   '1234'
            }, authenticate_cb);

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
        .then(addNewUser)
        .then(authenticateUser)
        .catch(handleError);

});
