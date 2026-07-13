//enum for message formatting
const FORMAT = {
    INFO: "INFO", //blue
    SUCCESS: "SUCCESS", //green, default color (no extra text needed)
    WARNING: "WARNING",
    ERROR: "ERROR",
}

//global variables, set at init
var log_to_file = false
var file_name = ""


//function that inits logging (only needed when logging to file)
export function init(ns, flag_log_to_file = false) {
    //save the flag
    log_to_file = flag_log_to_file
    //if we need to log to file
    if (log_to_file) {
        //base location to log to
        const base_folder = "log"
        //format of the log file
        const file_extention = ".txt"
        //get time
        const date = Date.now()
        //set file name to new name
        const string_date = date.getUTCFullYear() + "-" + (date.getUTCMonth()+1) + "-" + date.getUTCDate()
        //format time
        const string_time = date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds()
        //format: base folder / date / time . extention
        file_name = base_folder + "/" + string_date + "/" + string_time + file_extention
        //create the file, needed?
        //ns.write(file_name, time + '\t' + "Start of log", "w")
    }
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
export function warning(ns, prefix, message) {
    //pass to execute script
    print_message(ns, message, FORMAT.WARNING, prefix, true)
}


//function that logs error messages
export function error(ns, prefix, message) {
    //pass to execute script
    print_message(ns, message, FORMAT.ERROR, prefix, true)
}


//function that execute the formatting and printing of the message 
function print_message(ns, message, type, prefix, print_in_terminal = false) {
    //get time
    const date = Date.now()
    //format time
    const time = date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds()
    //build message
    var formatted_message = type + '\t' + time + '\t' + prefix + '\t' + message
    
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