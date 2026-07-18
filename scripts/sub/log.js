import * as CONSTANTS from "scripts/constants.js"


//global variables, set at init
var log_to_file = false
var file_name = ""


//function that inits logging (only needed when logging to file)
export function init(ns, flag_log_to_file = false) {
    //save the flag
    log_to_file = flag_log_to_file
    //if we need to log to file
    if (log_to_file) {
        /*
        //base location to log to
        const base_folder = "log"
        //format of the log file
        const file_extention = ".txt"
        //get time
        const date = Date.now()
        //set file name to new name
        //const string_date = "13-07-2026" //date.toLocaleDateString('nl')//date.getUTCFullYear() + "-" + (date.getUTCMonth()+1) + "-" + date.getUTCDate()
        //format time
        //const string_time = h + ":" + m + ":" + s//ns.format.time(date)   //date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds()
        //format: base folder / date / time . extention
        file_name = base_folder + "/" + string_date + "/" + string_time + file_extention
        //create the file, needed?
        //ns.write(file_name, time + '\t' + "Start of log", "w")
        */
    }
}


//function that logs info messages
export function info(ns, prefix, message, print_in_terminal = false) {
    //pass to execute script
    print_message(ns, message, CONSTANTS.FORMAT.INFO, prefix, print_in_terminal)
}


//function that logs info messages
export function success(ns, prefix, message, print_in_terminal = false) {
    //pass to execute script
    print_message(ns, message, CONSTANTS.FORMAT.SUCCESS, prefix, print_in_terminal)
}


//function that logs warning messages
export function warning(ns, prefix, message, print_in_terminal = false) {
    //pass to execute script
    print_message(ns, message, CONSTANTS.FORMAT.WARNING, prefix, print_in_terminal)
}


//function that logs error messages
export function error(ns, prefix, message) {
    //pass to execute script
    print_message(ns, message, CONSTANTS.FORMAT.ERROR, prefix, true)
}


//function that execute the formatting and printing of the message 
function print_message(ns, message, type, prefix, print_in_terminal = false) {
    //build message
    var formatted_message = type 
    //check if prefix is needed
    if (prefix != "") {
        formatted_message += '\t' + prefix 
    }
    formatted_message += '\t' + message
    //print in the logs
    ns.print(formatted_message)
    //if also in the terminal
    if (print_in_terminal) {
        //print in the terminal
        ns.tprint(formatted_message)
    }
    //if also log to file
    if (log_to_file) {
        //append to file
        ns.write(file_name, formatted_message, "a")
    }
}


export function format_number(number) {
    //if number is less than 1000
    if (number < 1000) {
        return number.toString()
    }
    //if number is less than 1 million
    else if (number < 1000000) {
        return (number / 1000).toFixed(2) + "K"
    }
    //if number is less than 1 billion
    else if (number < 1000000000) {
        return (number / 1000000).toFixed(2) + "M"
    }
    //if number is less than 1 trillion
    else if (number < 1000000000000) {
        return (number / 1000000000).toFixed(2) + "B"
    }
    //if number is less than 1 quadrillion
    else if (number < 1000000000000000) {
        return (number / 1000000000000).toFixed(2) + "T"
    }
    //if number is less than 1 quintillion
    else if (number < 1000000000000000000) {
        return (number / 1000000000000000).toFixed(2) + "Qa"
    }
    //if number is less than 1 sextillion
    else if (number < 1000000000000000000000) {
        return (number / 1000000000000000000).toFixed(2) + "Qi"
    }
    //if number is less than 1 septillion
    else if (number < 1000000000000000000000000) {
        return (number / 1000000000000000000000).toFixed(2) + "Sx"
    }   
}