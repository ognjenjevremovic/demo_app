//  Dependancies
var bodyParser =    require('body-parser');

//  Define the module
function routesModule(app, db) {
    'use strict';


    //  parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }));
    //  parse application/json
    app.use(bodyParser.json());


    //  Send application
    app.get("/", function(req, res, next) {
        res.sendFile('index.html', {
            root : __dirname + '/../public',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        });
        // res.json({
        //     message :   "Working root route"
        // });
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
