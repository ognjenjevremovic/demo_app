//  Export the module
module.exports = function(param) {

    'use strict';


    // Define a object that will hold the date in object and timestamp format
    var dateObject = {};

    // Check if the parameter is supplied to a function, if not set the default value
    param = param || Date.now();


    /* Params format:
        1.  timestamp format
        2.  date object
        3.  invalid parameter supplied
    */
    // Params options is in the timestamp format
    if(typeof param === "number") {
        // Add the values to the dateObj
        dateObject.timestamp   = param;
        dateObject.date        = new Date(param);
    } else if(typeof param === "object") {
        // Add the values to the dateObj
        dateObject.timestamp   = param.getTime();
        dateObject.date        = param;
    } else {
        // Add the values to the dateObj
        dateObject.timestamp   = Date.now();
        dateObject.date        = new Date();
    }


    // Store the date & time information in a nicer looking format
    dateObject.day      =   (dateObject.date.getDate()).toString();
    dateObject.month    =   (dateObject.date.getMonth() + 1).toString();
    dateObject.year     =   (dateObject.date.getFullYear()).toString();
    dateObject.hours    =   (dateObject.date.getHours()).toString();
    dateObject.minutes  =   (dateObject.date.getMinutes()).toString();
    dateObject.seconds  =   (dateObject.date.getSeconds()).toString();


    // Pretty the dateObject format
    (function() {
        // Pretty the month result
        if (dateObject.month.length === 1) {
            dateObject.month = "0" + dateObject.month;
        }
        // Pretty the day result
        if (dateObject.day.length === 1) {
            dateObject.day = "0" + dateObject.day;
        }
        // Pretty the hours result
        if (dateObject.hours.length === 1) {
            dateObject.hours = "0" + dateObject.hours;
        }
        // Pretty the minutes result
        if (dateObject.minutes.length === 1) {
            dateObject.minutes = "0" + dateObject.minutes;
        }
        // Pretty the seconds result
        if (dateObject.seconds.length === 1) {
            dateObject.seconds = "0" + dateObject.seconds;
        }
    })();


    // Store the date & time information in a nicer looking format
    dateObject.date = dateObject.day + "." + dateObject.month + "." + dateObject.year;
    dateObject.time = dateObject.hours + ":" + dateObject.minutes + ":" + dateObject.seconds;

    /* === */
    dateObject.date_us      =   dateObject.month + "/" + dateObject.day + "/" + dateObject.year;
    dateObject.date_eu      =   dateObject.day + "." + dateObject.month + "." + dateObject.year;
    /* == */
    dateObject.time_us      =   ((dateObject.hours > 12) ? (dateObject.hours - 12) : dateObject.hours) + ":" + dateObject.minutes + ((dateObject.hours > 12) ? " pm" : " am");
    dateObject.time_eu      =   dateObject.hours + ":" +dateObject.minutes;
    /* === */
    dateObject.fullDate_us  =   dateObject.time_us + " - " + dateObject.date_us;
    dateObject.fullDate_eu  =   dateObject.time_eu + " - " + dateObject.date_eu;


    //  Return the date object
    return dateObject;

};
