//  Dependancies
var Log =   require('pretty-easy-logs');


//  Construct new loggers
var infoLog    =    new Log({
        mode : 1,
        includeTime : true
    }),
    successLog =    new Log({
        mode : 2,
        includeTime : true
    }),
    warnLog    =    new Log({
        mode : 3,
        includeTime : true
    }),
    errLog     =    new Log(0);

var logger =    {};
logger.info =   infoLog;
logger.scs  =   logger.success =    successLog;
logger.warn =   logger.warning =    warnLog;
logger.err  =   logger.error   =    errLog;



//  Export the module
module.exports =    logger;
