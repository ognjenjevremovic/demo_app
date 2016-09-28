//  Require the modules
var UsersDAO    = require('./index'),
    MongoClient = require('mongodb').MongoClient,
    logger      = require('../logger');


//  Connect to the database
MongoClient.connect("mongodb://localhost:27017/test", function(err, db) {

    //  There was an error connecting to the database
    if(err) {
        logger('error', {
            message: "Error connecting to the database."
        });
        throw err;
    }

    //  Construct a new instance of UsersDAO
    var users       = new UsersDAO(db);


    //  Insert a user
    new Promise(function(resolve, reject) {

        //  Add new user
        users.addNew({
            username    :   "test",
            password    :   "1234",
            name        :   {
                first   :   "Ognjen",
                last    :   "Jevremovic"
            },
            email       :   'jevremovic.ognjen@gmail.com'
        }, function(err, warning, userInserted) {
            if(err) {
                logger('error', err);
            }
            if(warning) {
                logger('warning', warning);
            }
            console.log("User "+ userInserted._id +" successfuly inserted.");

            //  Resolve the promise
            return resolve();
        });

    }).then(function() {

        //  Authenticate the user
        users.authenticate({
            username    :   'test',
            password    :   '12342'
        }, function(err, warning, userFound) {
            if(err) {
                logger('error', err);
            }
            if(warning) {
                logger('warning', warning);
            }
            console.log("User "+ userFound._id + " found and successfuly authenticated.");
        });

    });

});
