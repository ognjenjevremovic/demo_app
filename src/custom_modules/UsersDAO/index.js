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
    var usersCollection = db.collection('users');



    //  Add new user to the database
    this.addNew         = function(params, callback) {

        //  Construct the user object
        var userObject = {};
        userObject._id      = params.username;
        userObject.name     = params.name;
        userObject.email    = params.email;
        userObject.password = params.password;


        //  Generate the salt for password hashing
        function generateSalt(resolve, reject) {

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

                    //  Resolve the promise with an error
                    return resolve({
                        error       :   saltGeneration_error
                    });

                //  No error (password hashed)
                }

                //  Resolve the promise with a salt
                return resolve({
                    salt            :   salt
                });

            };


            //  Generate the salt for the password hashing
            bcrypt.genSalt(10, genSalt_cb);

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
                        return resolve({
                            error           :   hashingPassword_error
                        });

                        //  No error (password hashed)
                    }

                    //  Return the hashed password
                    return resolve({
                        hashedPassword      :   hashedPassword
                    });

                };


                //  Check if there was an error generating the salt
                if(params.error) {

                    //  Pass the error
                    return resolve({
                        error       :   params.error
                    });

                //  Salt successfuly generated
                }

                //  Hash the password
                bcrypt.hash(userObject.password, params.salt, null, hash_cb);

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Insert the user into database
        function addUser(params) {

            //  Promise callback
            var promise_cb = function(resolve, reject) {

                //  Insert document callback
                var insertOne_cb = function(err, result) {

                    //  Check if there was an error inserting the user
                    if (err) {

                        //  Construct a friendly error message
                        var insertUser_error = {
                            date    : datter().time + " " + datter().date,
                            stack   : "ERRROR! \nfile: " + __dirname + ", line 205.",
                            message : "There was an error inserting the user into database."
                        };

                        //  User with that username already exists
                        if(err.code === 11000) {
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

                        //  Log the error
                        logger('error', insertUser_error);

                        //  Pass the error
                        return resolve({
                            error           :   insertUser_error
                        });

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


                //  Check if there was an error hashing the password
                if(params.error) {

                    //  Pass the error
                    return resolve({
                        error       :   params.error
                    });

                //  Password successfuly hashed
                }

                //  Construct the user object
                userObject.password     = params.hashedPassword;

                //  Add the user to the "users" collection
                usersCollection.insertOne(userObject, insertOne_cb);

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Pass the error/warning/userObject back to the callback
        function exit(params) {
            return callback(params.error, params.warning, params.userInserted);
        }


        //  Generate the salt for password hashing
        new Promise(generateSalt)
            //  Hash the password
            .then(hashPassword)
            //  Insert the user into database
            .then(addUser)
            //  Pass the error/warning/userObject back to the callback
            .then(exit)
            //  Catch the error in the process (if any)
            .catch(function(err) {
                logger('error', err);
            });

    };


    //  Authenticate the user
    this.authenticate   = function(params, callback) {

        //  Extrach the user infrormation provided
        var userObject = {};
        userObject.username     =   params.username;
        userObject.password     =   params.password;


        //  Query the database with the username provided
        function queryDatabase(resolve, reject) {

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
                    return resolve({
                        error       :   databaseQuery_error
                    });

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
                    userFound   :   userFound
                });

            };


            //  Query the database
            usersCollection
                .findOne({
                    _id:    userObject.username
                }, findOne_cb);

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
                        return resolve({
                            error       :   passwordCompare_error
                        });

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

                    //  Correct password
                    }

                    //  Resolve the promise with the user object found
                    return resolve({
                        userFound       :   params.userFound
                    });

                };


                //  Check if there was an error querying the database
                if(params.error) {

                    //  Resolve the promise with an error
                    return resolve({
                        error       :   params.error
                    });

                //  Database queried successfuly
                }

                //  Check if there was no user found
                if(params.warning) {

                    //  Resolve the promise with a warning
                    return resolve({
                        warning     :   params.warning
                    });

                //  User found
                }

                //  Compare the passwords
                bcrypt.compare(userObject.password, params.userFound.password, compare_cb);

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Pass the error/warning/userObject back to the callback
        function exit(params) {
            return callback(params.error, params.warning, params.userFound);
        }


        //  Query the database with the username provided
        new Promise(queryDatabase)
            //  Compare the password provided
            .then(comparePasswords)
            //  Pass the error/warning/userObject back to the callback
            .then(exit)
            //  Catch the error in the process (if any)
            .catch(function(err) {
                logger('error', err);
            });

    };

}


//  Export the module
module.exports = UsersDAO;
