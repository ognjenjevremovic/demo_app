//  Require the modules
var logger  = require('../logger'),
    datter  = require('../datter');



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
function constructSessionDocument(collection, user) {

    //  Promise callback
    var promise_cb = function(resolve) {

        //  Construct a new session document
        return resolve({
            collection          :   collection,
            sessionDocument     :   new SessionDocument(user)
        });

    };


    //  Return a promise
    return new Promise(promise_cb);

}

//  Insert session into database
function insertSession(params) {

    //  Extract the parameters
    var collection          =   params.collection,
        sessionDocument     =   params.sessionDocument;


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

                //  Session already exists (can it actualy happen?!)
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


        //  Add the session to collection
        collection.insertOne(sessionDocument, insertOne_cb);

    };


    //  Return a promise
    return new Promise(promise_cb);

}

//  Pass the error/warning/userObject back to the callback
function exit(params) {
    return callback(null, params.warning, params.sessionInserted);
}



//  Add new user
var addSession  = function (collection, user, callback) {


    //  Construct a new session document
    constructSessionDocument(user)
        //  Insert session into database
        .then(insertSession)
        //  Pass the error/sessionObject back to the callback
        .then(exit)
        //  Catch the error in the process (if any)
        .catch(function(err) {
            return callback(err, null, null);
        });


};



//  Export the module
module.exports  = addSession;
