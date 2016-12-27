//  Require the modules
var logger          = require('../logger'),
    MongoClient     = require('mongodb').MongoClient,
    ContentDAO      = require('./index');


//  Connect to the database
MongoClient.connect('mongodb://localhost:27017/test', function(err, db) {

    'use strict';


    //  There was an error connecting to the database
    if(err) {
        return logger('error', {
            message: "Error connecting to the database."
        });
    }


    //  Construct a new instance of ContentDAO
    var contents    = new ContentDAO(db);


    //  User Constructor
    function UserDocument(username) {
        this.user       = username;
    }

    //  Content document constructor
    function ContentDocument(content) {
        this.originalUrl    = content.originalUrl;
        this.shortenUrl     = content.shortenUrl;
        this.description    = content.description;
        this.name           = content.name;
    }


    //  Construct new User document
    function constructDummyUserDocument() {

        //  Promise callback
        var promise_cb = function(resolve) {

            //  Resolve the promise with a user document
            return resolve(new ContentDocument('test'));

        };


        //  Return new promise
        return new Promise(promise_cb);

    }

    //  Construct new content document
    function constructDummyContentDocument(user) {

        //  Promise callback
        var promise_cb = function(resolve) {

            //  Resolve the promise with a new content document
            return resolve({
                contentDocument :   new ContentDocument({
                    originalUrl     :   'youtube.com',
                    shortenUrl      :   'goo.gl/jOZAHd',
                    description     :   'Youtube link shorten, for the test purposes.',
                    name            :   'Youtube'
                }),
                user            :   user
            });

        };


        //  Return new promise
        return new Promise(promise_cb);

    }

    //  Add new document
    function addNewContentDocument(params) {

        //  Promise callback
        var promise_cb = function(resolve, reject) {

            //  Add new document callback
            var addNew_cb = function(error, warning, documentInserted) {
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
                logger('info', "Content \n" + documentInserted + "\n successfuly inserted.");
                return resolve({
                    documentInserted :   documentInserted
                });
            };


            //  Add new document
            contents.addNew(params, addNew_cb);

        };


        //  Return a promise
        return new Promise(promise_cb);

    }


    //  Construct new User document
    constructDummyUserDocument()
        //  Construct new content document
        .then(constructDummyContentDocument)
        //  Add new document
        .then(addNewContentDocument)
        .then(function() {
            console.log('End!');
        });


});
