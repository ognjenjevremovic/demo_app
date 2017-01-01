//  Constructor
function CustomMessage(err) {
    'use strict';


    this.message =  err.message;
    this.stack   =  err.stack;

    if (err.additional) {
        this[err.additional] =  true;
    }
}



//  Export the module
module.exports =    CustomMessage;
