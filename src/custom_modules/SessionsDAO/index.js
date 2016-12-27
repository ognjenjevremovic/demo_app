//  Require the modules
var logger      = require('../logger'),
    datter      = require('../datter');


//  Sessions Data Access Object Constructor
function SessionsDAO(db) {

    'use strict';


    //  Check if the constructor is called improperly
    if((this instanceof SessionsDAO) === false) {
        //  Return new instance of constructor
        return new SessionsDAO(db);
    }


    //  Store the sessions collection
    var sessionsCollection  = db.collection('sessions');



    //  Add new session to the collection
    this.addNew     = function(user, callback) {

        //  Session document constructor
        function SessionDocument(user) {
            this.user       = user;
            this.created    = {
                date        :   datter().date,
                time        :   datter().time,
                timestamp   :   datter().timestamp
            };
            // 24h session (token) expiration
            this.validUntil = {
                date        :   datter(this.created.timestamp + 24 * 60 * 60 * 1000).date,
                time        :   datter(this.created.timestamp + 24 * 60 * 60 * 1000).time,
                timestamp   :   this.created.timestamp + (24 * 60 * 60 * 1000)
            };
            this._id        = this.createID();
        }
        SessionDocument.prototype.createID = function() {

            //  Construct a new session id
            function generateRandomNum() {

                //  Define a random number
                var randomNum   = Math.round(Math.random() * 10000).toString();

                //  Make it a 4 digit number
                if(randomNum.length === 1) {
                    randomNum   = "000" + randomNum;
                } else if(randomNum.length === 2) {
                    randomNum   = "00"  + randomNum;
                } else if(randomNum.length === 3) {
                    randomNum   = "0"   + randomNum;
                }

                //  Return the 4 digit number (as a string)
                return randomNum;

            }


            //  Construct a new id for the session document
            return (this.created.timestamp + generateRandomNum());

        };


        //  Construct a new session document
        function constructSessionDocument(user) {

            //  Promise callback
            var promise_cb = function(resolve) {

                //  Construct a new session document
                return resolve(new SessionDocument(user));

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Insert session into database
        function addNewSession(sessionDocument) {

            //  Promise callback
            var promise_cb = function(resolve, reject) {

                //  Insert callback
                var insertOne_cb = function(err, result) {

                    //  Check if there was an error inserting the document
                    if(err) {

                        //  Construct a new error message
                        var insertSession_error    = {
                            date    : datter().time + " " + datter().date,
                            stack   : "ERRROR! \nfile: " + __dirname + ", line 205.",
                            message : "There was an error inserting the user into database."
                        };

                        //  Session already exists (should NOT happen, as there should only be ONE active session per user)
                        if(err.code === 11000) {
                            //  Construct a friendly error message
                            var sessionExists_warning = {
                                date    : datter().time + " " + datter().date,
                                message : "Session with that ID already exists."
                            };

                            //  Resolve the promise with a warning
                            return resolve({
                                warning     :   sessionExists_warning
                            });

                        }

                        //  Log the error
                        logger('error', insertSession_error);

                        //  Reject the promise with an error
                        return reject(insertSession_error);

                    //  No error (session inserted)
                    }

                    //  Capture the session document inserted
                    var sessionInserted = result.ops[0];

                    //  Pass the session inserted
                    return resolve({
                        sessionInserted     :   sessionInserted
                    });

                };


                //  Add the session to the "sessions" collection
                sessionsCollection.insertOne(sessionDocument, insertOne_cb);

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Pass the error/warning/userObject back to the callback
        function exit(params) {
            return callback(null, params.warning, params.sessionInserted);
        }


        //  Construct a new session document
        constructSessionDocument(user)
            //  Insert session into database
            .then(addNewSession)
            //  Pass the error/sessionObject back to the callback
            .then(exit)
            //  Catch the error in the process (if any)
            .catch(function(err) {
                return callback(err, null, null);
            });

    };

    //  Find session in the collection
    this.find       = function(username, callback) {

        //  Session document constructor
        function SessionDocument(username) {
            this['user._id']    =   username;
        }


        //  Construct the session document
        function constructSessionDocument(user) {

            //  Promise callback
            var promise_cb = function(resolve) {

                //  Resolve the promise with a session document
                return resolve(new SessionDocument(user));

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Find session matching the username
        function findSession(sessionDocument) {

            //  Promise callback
            var promise_cb = function(resolve, reject) {

                //  Find one callback
                var findOne_cb = function(err, sessionFound) {

                    //  Check if there was an error querying the database
                    if(err) {

                        //  Construct a new error message
                        var databaseQuery_error    = {
                            date    : datter().time + " " + datter().date,
                            stack   : "ERRROR! \nfile: " + __dirname + ", line 205.",
                            message : "There was an error querying the 'sessions' collection."
                        };
                        logger('error', databaseQuery_error);

                        //  Reject the promise with an error
                        return reject(databaseQuery_error);

                    //  Database query successful
                    }

                    //  There was no session for the user
                    if(!sessionFound) {

                        //  Construct a warning
                        var noSessionFound_warning  = {
                            date    : datter().time + " " + datter().date,
                            message : "There's no active session for the user."
                        };

                        //  Resolve the promise with a warning
                        return resolve({
                            warning     :   noSessionFound_warning
                        });

                    //  Session found
                    }

                    //  Resolve the promise with a session document
                    return resolve({
                        sessionFound    :   sessionFound
                    });

                };


                //  Query the database
                sessionsCollection.findOne(sessionDocument, findOne_cb);

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Pass the error/warning/userObject back to the callback
        function exit(params) {
            return callback(null, params.warning, params.sessionFound);
        }


        //  Construct the session document
        constructSessionDocument(username)
            //  Find session matching the username
            .then(findSession)
            //  Pass the error/sessionObject back to the callback
            .then(exit)
            //  Catch the error in process (if any)
            .catch(function(err) {
                return callback(err, null, null);
            });

    };

    //  Delete session from the collection
    this.remove     = function(username, callback) {

        //  Session document constructor
        function SessionDocument(username) {
            this['user._id']    = username;
        }


        //  Construct new session document
        function constructSessionDocument(sessionID) {

            //  Promise callback
            var promise_cb = function(resolve) {

                //  Return session document
                return resolve(new SessionDocument(sessionID));

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Remove the session matching the query, from the collection
        function removeSession(sessionDocument) {

            //  Promise callback
            var promise_cb = function(resolve, reject) {

                //  Delete session callback
                var deleteSessionDocument_cb = function(err, result) {

                    //  Check if there was an error
                    if(err) {

                        //  Construct a new error message
                        var databaseDelete_error    = {
                            date    : datter().time + " " + datter().date,
                            stack   : "ERRROR! \nfile: " + __dirname + ", line 205.",
                            message : "There was an error inserting the user into database."
                        };
                        logger('error', databaseDelete_error);

                        //  Reject the promise with an error
                        return reject(databaseDelete_error);

                    //  There was no error deleting the document
                    }

                    //  Store the deleted session document
                    var documentDeleted = result.value;

                    //  Check if there was a document deleted (??? - someone sent the old sesion or injected the fake one)
                    if(!documentDeleted) {

                        //  Construct a new error message
                        var noDocumentDeleted_warning   = {
                            date    : datter().time + " " + datter().date,
                            message : "There was no session found matching the query. Nothing deleted"
                        };

                        //  Resolve the promise with a warning
                        return resolve({
                            warning     :   noDocumentDeleted_warning
                        });

                    //  Document deleted successfuly
                    }

                    //  Resolve a promise with a document deleted
                    return resolve({
                        documentDeleted :   documentDeleted
                    });

                };


                //  Remove the session from the collection
                sessionsCollection.findOneAndDelete(sessionDocument, deleteSessionDocument_cb);

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Pass the error/warning/userObject back to the callback
        function exit(params) {
            return callback(null, params.warning, params.documentDeleted);
        }


        //  Construct a sessionDocument
        constructSessionDocument(username)
            //  Remove the session matching the query, from the collection
            .then(removeSession)
            //  Pass the error/warning/userObject back to the callback
            .then(exit)
            //  Catch the  error in the process (if any)
            .catch(function(err) {
                return callback(err, null, null);
            });

    };

}


//  Export the module
module.exports = SessionsDAO;
