// Require the dependancie modules
var log = require('../logger'),
    fs  = require('fs');


// Extract the key:value pairs from the file
function getVariables(fileContent) {

    // Define the object that will hold the environment key:value pairs
    var ENV_obj = {};

    // Split the content of the file by line breaks => '\n'
    fileContent.split('\n').forEach(function(line) {

        // Extract the key:value pair as separate values and store them in the array
        var keyValueArr = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);

        // Check if the array is populated (aka fileContent is provided)
        if (keyValueArr) {

            // Get the key (ENVIRONMENT_VARIABLE propertie)
            var ENV_key = keyValueArr[1],

            // Get the value (ENVIRONMENT_VARIABLE value) => [if empty set '' as default]
                ENV_value = keyValueArr[2] ? keyValueArr[2] : '',

            // Text expanding multiple lines (wrapped with double quotes and including line breaks => '\n') will be quoted
                ENV_valueLength = ENV_value ? ENV_value.length : 0;
            if (ENV_valueLength > 0 && ENV_value.charAt(0) === '\"' && ENV_value.charAt(ENV_valueLength - 1) === '\"') {
                ENV_value = ENV_value.replace(/\\n/gm, '\n');
            }

            // Remove quotes and empty spaces
            ENV_value = ENV_value.replace(/(^['"]|['"]$)/g, '').trim();

            // Populate the object with key:value pairs
            ENV_obj[ENV_key] = ENV_value;

        }

    });

    // Return the object with key:value pairs defined
    return ENV_obj;

}


// Load the ENVIRONMENT_VARIABLES from a file
function loadVariables(pathToDotEnvVarsFile, expectLogs) {


    // Path to the .pathToDotEnvVarsFile file containing the environment variables
    var path = pathToDotEnvVarsFile || '../.envVars',
        shouldLog = expectLogs || true;


    // Try (read && parse) the content of the .pathToDotEnvVarsFile file
    try {

        // specifying an encoding returns a string instead of a buffer
        var ENV_VARSObj = getVariables(fs.readFileSync(path, { encoding: 'utf8' }));

        // Itterate through the object
        for(var ENV_prop in ENV_VARSObj) {
            /*

            *   Populate the environment variables in the Node process for each key:value pair in the object
            *   If the ENVIRONMENT_VARIABLE with that name is already defined its' value will NOT get overriden
            */
            process.env[ENV_prop] = process.env[ENV_prop] || ENV_VARSObj[ENV_prop];

        }

        // Return the object containing key:value pairs
        return ENV_VARSObj;

    /* Check if there was an error (reading && parsing) the data */
    } catch (error) {
        // Check if logs are expected

        if (shouldLog) {
            // Log out the error
            log('err', error);
        }

        // Don't log anything to the console
        return;
    }

}


// Export the module
module.exports.load = function(pathToDotEnvVarsFile, expectLogs) {
    return loadVariables(pathToDotEnvVarsFile, expectLogs);
};
