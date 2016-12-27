//  Define the module
function routesModule(app, db) {

    'use strict';


    //
    app.get("/", function(req, res, next) {
        res.json({
            message :   "Working root route"
        });
    });

    app.get('*', function(req, res, next) {
        // res.json({
        //     message :   "Unregistered route. Redirection, working as intended"
        // });
        res.redirect(301, '/');
    });

}


//  Export the module
module.exports = routesModule;
