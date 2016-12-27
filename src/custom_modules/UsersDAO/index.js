//  Require the modules
var datter      = require('../datter'),
    bcrypt      = require('bcrypt-nodejs'),
    logger      = require('../logger');


//  Define the Users Data Access Object
function UsersDAO(db) {

    'use strict';


    //  Check if the constructor was called improperly
    if((this instanceof UsersDAO) === false) {
        //  Return the new instance of the constructor
        return new UsersDAO(db);
    }


    //  Store the users database collection
    var usersCollection     = db.collection('users'),
        contentCollection   = db.collection('content');
    usersCollection.createIndex('email', {unique: true});



    //  Add new user to the database
    this.addNew         = function(params, callback) {

        //  User document constructor
        function UserDocument(params) {
            this._id                = params.username;
            this.name               = params.name;
            this.email              = params.email;
            this.unsecurePassword   = params.password;
        }

        //  Content document constructor
        function ContentDocument(user) {
            this._id        = user;
            this.contents   = [];
        }


        //  Construct the user document
        function constructUserDocument(params) {

            //  Promise callback
            var promise_cb = function(resolve) {

                //  Pass the user document
                return resolve(new UserDocument(params));

            };


            //  Return a promise
            return new Promise(promise_cb);
        }

        //  Generate the salt for password hashing
        function generateSalt(userDocument) {

            //  Promise callback
            var promise_cb = function(resolve, reject) {

                //  Salt generate callback
                var genSalt_cb = function(err, salt) {

                    //  Check if there was an error hashing the password
                    if (err) {

                        //  Construct a friendly error message
                        var saltGeneration_error = {
                            date    : datter().time + " " + datter().date,
                            stack   : "ERRROR! \nfile: " + __dirname + ", line 72.",
                            message : "There was an error generating the password salt."
                        };
                        logger('error', saltGeneration_error);

                        //  Reject the promise with an error
                        return reject(saltGeneration_error);

                    //  No error (password hashed)
                    }

                    //  Resolve the promise with a user document and salt
                    return resolve({
                        userDocument    :   userDocument,
                        salt            :   salt
                    });

                };


                //  Generate the salt for the password hashing
                bcrypt.genSalt(10, genSalt_cb);

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Hash the password
        function hashPassword(params) {

            //  Promise callback
            var promise_cb = function(resolve, reject) {

                //  Hashing callback function
                var hash_cb = function(err, hashedPassword) {

                    //  Check if there was an error hashing the password
                    if (err) {

                        //  Construct a friendly error message
                        var hashingPassword_error = {
                            date    : datter().time + " " + datter().date,
                            stack   : "ERRROR! \nfile: " + __dirname + ", line 122.",
                            message : "There was an error hashing the password."
                        };
                        logger('error', hashingPassword_error);

                        //  Pass the error
                        return reject(hashingPassword_error);

                    //  No error (password hashed)
                    }

                    //  Replace the unsecure password with the hash
                    delete params.userDocument.unsecurePassword;
                    params.userDocument.password    = hashedPassword;

                    //  Return the user document (ready for insert)
                    return resolve(params.userDocument);

                };


                //  Hash the password
                bcrypt.hash(params.userDocument.unsecurePassword, params.salt, null, hash_cb);

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Insert the user into database
        function addUser(userDocument) {

            //  Promise callback
            var promise_cb = function(resolve, reject) {

                //  Insert document callback
                var insertOne_cb = function(err, result) {

                    //  Check if there was an error inserting the user
                    if (err) {

                        //  User/email already exists
                        if(err.code === 11000) {

                            //  Username is already taken
                            if(err.message.indexOf('_id') > 0) {

                                //  Construct a friendly error message
                                var userExists_warning = {
                                    date    : datter().time + " " + datter().date,
                                    stack   : "ERRROR! \nfile: " + __dirname + ", line 205.",
                                    message : "User already exists. Please choose a different username or log in if you're the owner."
                                };

                                //  Resolve the promise with a warning
                                return resolve({
                                    warning     :   userExists_warning
                                });

                            }

                            //  Email is already registered
                            if(err.message.indexOf('email') > 0) {

                                //  Construct a friendly error message
                                var emailAlreadyUsed_warning    = {
                                    date    : datter().time + " " + datter().date,
                                    stack   : "ERRROR! \nfile: " + __dirname + ", line 205.",
                                    message : "Account with that e-mail is already registered. Please log instead."
                                };

                                //  Resolve the promise with a warning
                                return resolve({
                                    warning     :   emailAlreadyUsed_warning
                                });

                            }

                        }

                        //  Construct a friendly error message
                        var insertUser_error = {
                            date    : datter().time + " " + datter().date,
                            stack   : "ERRROR! \nfile: " + __dirname + ", line 205.",
                            message : "There was an error inserting the user into database."
                        };

                        //  Log the error
                        logger('error', insertUser_error);

                        //  Reject the promise with an error
                        return reject(insertUser_error);

                    //  No error (user inserted)
                    }

                    //  Capture the user document inserted
                    var userInserted    = result.ops[0];
                    delete userInserted.password;

                    //  Pass the user inserted
                    return resolve({
                        userInserted    :   userInserted
                    });

                };


                //  Add the user to the "users" collection
                usersCollection.insertOne(userDocument, insertOne_cb);

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Construct the content document
        function constructContentDocument(params) {

            //  Promise callback
            var promise_cb = function(resolve) {

                //  Check if the user is not successfuly created
                if(params.warning) {

                    //  Resolve the promise with a warning
                    return resolve({
                        warning     :   params.warning
                    });

                //  User created successfuly
                }

                //  Return a content document
                return resolve({
                    userInserted    : params.userInserted,
                    contentDocument : new ContentDocument(params.userInserted._id)
                });

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Insert new document (for the user content) on the content collection
        function initContentForTheUser(params) {

            //  Promise callback
            var promise_cb = function(resolve, reject) {

                //  Insert document callback
                var insertOne_cb = function(err, result) {

                    //  Check if there was an error inserting the content document
                    if(err) {

                        //  Construct a friendly error message
                        var contentDocumentInsert_error = {
                            date    : datter().time + " " + datter().date,
                            stack   : "ERRROR! \nfile: " + __dirname + ", line 122.",
                            message : "There was an error hashing the password."
                        };
                        logger('error', contentDocumentInsert_error);

                        //  Reject the promise with an error
                        return reject (contentDocumentInsert_error);

                    //  Content document inserted successfuly
                    }


                    //  Check if the user is not successfuly created
                    if(params.warning) {

                        //  Resolve the promise with a warning
                        return resolve({
                            warning     :   params.warning
                        });

                    //  User created successfuly
                    }


                    //  Return a user inserted
                    return resolve({
                        userInserted    :   params.userInserted
                    });


                };


                //  Check if the user was not successfuly created
                if(params.warning) {

                    //  Resolve the promise with a warning
                    return resolve({
                        warning     :   params.warning
                    });

                //  User created successfuly
                }


                //  Insert new document into content collection
                contentCollection.insertOne(params.contentDocument, insertOne_cb);

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Pass the error/warning/userObject back to the callback
        function exit(params) {
            return callback(null, params.warning, params.userInserted);
        }


        //  Construct the user document
        constructUserDocument(params)
            //  Generate the salt for password hashing
            .then(generateSalt)
            //  Hash the password
            .then(hashPassword)
            //  Insert the user into database
            .then(addUser)
            //  Construct the content document
            .then(constructContentDocument)
            //  Insert the user into database
            .then(initContentForTheUser)
            //  Pass the error/warning/userObject back to the callback
            .then(exit)
            //  Catch the error in the process (if any)
            .catch(function(error) {
                return callback(error, null, null);
            });

    };

    //  Authenticate the user
    this.authenticate   = function(params, callback) {

        //  User object constructor
        function UserDocument(params) {
            this.username   =   params.username;
            this.password   =   params.password;
        }

        //  Construct the user document
        function constructUserDocument(params) {

            //  Promise callback
            var promise_cb = function(resolve) {

                //  Construct new user
                return resolve(new UserDocument(params));

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Query the database with the username provided
        function queryDatabase(userDocument) {

            //  Promise callback
            var promise_cb = function(resolve, reject) {

                //  Database query callback
                var findOne_cb  =   function(err, userFound) {

                    //  Check if there was an error querying the database
                    if(err) {

                        //  Construct a friendly error message
                        var databaseQuery_error = {
                            date    : datter().time + " " + datter().date,
                            stack   : "ERRROR! \nfile: " + __dirname + ", line 287.",
                            message : "There was an error querying the database."
                        };
                        logger('error', databaseQuery_error);

                        //  Resolve the promise with an error
                        return reject(databaseQuery_error);

                    //  Database queried successfuly
                    }

                    //  User does not exist (wrong username)
                    if(!userFound) {

                        //  Construct a friendly error message
                        var userNotFound_warning  = {
                            date    : datter().time + " " + datter().date,
                            stack   : "ERRROR! \nfile: " + __dirname + ", line 287.",
                            message : "User not found. Please check your input and try again."
                        };

                        //  Resolve the promise with a warning
                        return resolve({
                            warning     :   userNotFound_warning
                        });

                    //  User found
                    }

                    //  Resolve the promise with a user object found
                    return resolve({
                        userFound       :   userFound,
                        infoSubmited    :   userDocument
                    });

                };

                //  Query the database
                usersCollection
                    .findOne({
                        _id:    userDocument.username
                    }, findOne_cb);

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Compare the password provided
        function comparePasswords(params) {

            //  Promise callback
            var promise_cb = function(resolve, reject) {

                //  Password comparison callback
                var compare_cb  = function(err, match) {

                    //  Check if there was an error comparing 2 passwords
                    if(err) {

                        //  Construct a friendly error message
                        var passwordCompare_error = {
                            date    : datter().time + " " + datter().date,
                            stack   : "ERRROR! \nfile: " + __dirname + ", line 382.",
                            message : "There was an error comparing 2 passwords."
                        };
                        logger('error', passwordCompare_error);

                        //  Resolve the promise with an error
                        return reject(passwordCompare_error);

                    //  Password compare successfuly
                    }

                    //  Passwords don't match
                    if(!match) {

                        //  Construct a friendly warning message
                        var passwordIncorrect_warning = {
                            date    : datter().time + " " + datter().date,
                            stack   : "ERRROR! \nfile: " + __dirname + ", line 382.",
                            message : "Incorrect password. Please check your input and try again."
                        };

                        //  Resolve the promise with a warning
                        return resolve({
                            warning         :   passwordIncorrect_warning
                        });

                    //  Passwords are matching
                    }

                    //  Resolve the promise with the user object found
                    return resolve({
                        userFound       :   params.userFound
                    });

                };


                //  Check if there was no user found
                if(params.warning) {

                    //  Resolve the promise with a warning
                    return resolve({
                        warning     :   params.warning
                    });

                //  User found
                }


                //  Compare the passwords
                bcrypt.compare(params.infoSubmited.password, params.userFound.password, compare_cb);

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Pass the error/warning/userObject back to the callback
        function exit(params) {
            return callback(null, params.warning, params.userFound);
        }


        //  Construct the user document
        constructUserDocument(params)
            //  Query the database with the username provided
            .then(queryDatabase)
            //  Compare the password provided
            .then(comparePasswords)
            //  Pass the error/warning/userObject back to the callback
            .then(exit)
            //  Catch the error in the process (if any)
            .catch(function(error) {
                return callback(error, null, null);
            });

    };

}



//  Export the module
module.exports = UsersDAO;
