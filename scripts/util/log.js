import * as CONSTANTS from "scripts/constants.js"


//enum for message formatting
const FORMAT = {
    INFO: "INFO", //blue
    SUCCESS: "SUCCESS", //green, default color (no extra text needed)
    WARNING: "WARNING",
    ERROR: "ERROR",
}


//function that inits logging (only needed when logging to file)
export function init(ns) {
}


//function that logs info messages
export function info(ns, prefix, message, print_in_terminal = false) {
    //pass to execute script
    print_message(ns, message, FORMAT.INFO, prefix, print_in_terminal)
}


//function that logs info messages
export function success(ns, prefix, message, print_in_terminal = false) {
    //pass to execute script
    print_message(ns, message, FORMAT.SUCCESS, prefix, print_in_terminal)
}


//function that logs warning messages
export function warning(ns, prefix, message, print_in_terminal = false) {
    //pass to execute script
    print_message(ns, message, FORMAT.WARNING, prefix, print_in_terminal)
}


//function that logs error messages
export function error(ns, prefix, message, print_in_terminal = true) {
    //pass to execute script
    print_message(ns, message, FORMAT.ERROR, prefix, print_in_terminal)
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
}


export function disable(ns, types) {
    
    //guard first
    if (types == null || types == undefined) {
        //stop
        return
    } 
    //disable the logging of the disable of logging...
    ns.disableLog("disableLog")
    //if an array
    if (Array.isArray(types)) {
        //for each
        for (const type of types) {
            //disable
            ns.disableLog(type)
        }
    //should be a single string
    } else if (types instanceof String) {
        //disable
        ns.disableLog(types)
    }
}
