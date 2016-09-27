// Require the dependancie modules
var colors  = require("colors");


// Export the module
module.exports = function(mode, params) {


    "use strict";


    /* Define the logger styles :
        1.  info message (light-blue color)
        2.  warn message (yellow color)
        3.  error message (red color)
    */
    var loggerModes = {
        info: {
            message : "INFO",
            style   : colors.cyan
        },
        warn: {
            message : "WARNING",
            style   : colors.yellow
        },
        error: {
            message : "ERROR",
            style   : colors.red
        }
    };


    // Define the function for logging the info, warning or error message
    function logIt(log, params) {

        //  Array itteration callback
        function arrItteration_cb(param) {
            console.log(log.style("    == > " + params[i] + "\n"));
        }


        // Log out the header of the message to the console (INFO || WARNING || ERROR)
        console.log(log.style("\n                    *********"));
        console.log(log.style("                    * " + log.message + " *"));
        console.log(log.style("                    *********\n"));

        // Check if the params is type of object
        if (typeof params === "object") {
            // Array format
            if(params instanceof Array) {

                // Itterate through the array of messages
                params.forEach(arrItteration_cb);

            // Object literal format
            } else {

                // Itterate through the properties of an object
                for(var prop in params) {
                    // Log out every message
                    console.log(log.style("    == > " + params[prop] + "\n"));
                }

            }

        // Single value passed (String || Number || Boolean)
        } else {
            // Log it out
            console.log(log.style("    == > " + params + "\n"));
        }

        // Log out the footer of the message to the console
        console.log(log.style("                    ---END--- \n"));
    }


    /* Check the logger mode :
        1.  info style message
        2.  warn style message
        3.  error style message
    */
    if (mode.toLowerCase() === "info") {
        // Call the logger with desired style parameters
        logIt(loggerModes.info, params);
    } else if (mode.toLowerCase() === "warn" || mode.toLowerCase() === "warning") {
        // Call the logger with desired style parameters
        logIt(loggerModes.warn, params);
    } else if (mode.toLowerCase() === "err" || mode.toLowerCase() === "error") {
        // Call the logger with desired style parameters
        logIt(loggerModes.error, params);
    } else {
        // Call the logger with default error style parameters
        logIt(loggerModes.error, params);
    }

};
