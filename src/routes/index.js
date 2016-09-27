//  Require the modules
var logger  = require('../custom_modules/logger'),
    datter  = require('../custom_modules/datter');



//  Define the module
function routesModule(app, db) {

    'use strict';


    //
    app
        .get("/", function(req, res, next) {

            res
                .json({
                    message:    "Root"
                });

    });

}


//  Export the module
module.exports = routesModule;
