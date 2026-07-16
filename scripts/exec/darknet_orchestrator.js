import * as CONSTANTS from "scripts/constants.js"
import * as log from CONSTANTS.SCRIPT.LIBRARY.LOG
import * as evaluate from CONSTANTS.SCRIPT.LIBRARY.EVALUATE


//main loop
export async function main(ns) {
    //stop logging
    ns.disableLog("ALL")
    //save our own hostname
    const hostname_self = ns.args[0]
    //get our max ram
    const allowed_ram = ns.args[1]
    //init
    evaluate.init(ns, hostname_self, CONSTANTS.RAM.DARKNET.WORKER, true, allowed_ram)
    //create map of passwords
    var servers_passwords = new Map()
    //add self (darkweb server)
    servers_passwords.set(hostname_self, {
        password: "",
        confirmed: true,
        heartbleed: {},
        server_info: {}
    })
    //loop forever
    while (true) {
        //wait until next mutation
        await ns.sleep(CONSTANTS.TIME.WAIT) //await ns.dnet.nextMutation()
        //communicate with workers
        await communicate_with_workers(ns, servers_passwords)
    }
}


//function that communicate with worker scripts
/* mesage data is formatted like:
    hostname = hostname of worker (either sent from or sent to, depending on the port)
    type = type of request
    data = data (depends on the request)
*/
async function communicate_with_workers(ns, servers_passwords) {
    //create port object
    const port_information = ns.getPortHandle(CONSTANTS.PORT.DARKNET.INFORMATION)
    //create port object
    const port_password = ns.getPortHandle(CONSTANTS.PORT.DARKNET.PASSWORD)


    //check if we need to delete messages in the outbound port first
    while (true) {
        //if there is no data
        if (port_password.peek() == CONSTANTS.PORT.NO_DATA) {
            //stop
            break
        }
        //read the sent message
        var sent_message = port_password.peek()
        //get server information of the target server
        const server_info = await evaluate.exec(ns, "ns.getServer('" + sent_message.hostname + "')")
        //check if NOT online
        if (server_info.isOnline) {
            //stop
            break
        }
        //remove the message from the list (target is offline)
        port_password.read()
    }

    //while there is data incoming
    while (port_information.peek() != CONSTANTS.PORT.NO_DATA) {
        //get the message
        var message = JSON.parse(port_information.read())
        //decide on what to do
        switch (message.type) {

            //information is provided from workers to orchestrator
            case CONSTANTS.MESSAGE.DARKNET.INFORMATION:
                //data contains the hint and server information
                //solve passwords
                await solve_passwords(ns, servers_passwords, message)
                //stop
                break

                //worker indicates a server has been authenticated
            case CONSTANTS.MESSAGE.DARKNET.AUTHENTICATED:
                break
                //data is the hostname which has been authenticated
                //get saved password data
                var password_data = servers_passwords.get(message.data)
                //set to true
                password_data.confirmed = true
                //save to map
                servers_passwords.set(message.data, password_data)
                //log
                log.success(ns, "Darknet", "Authentication success for '" + message.data + "' with password '" +
                    password_data.password + "' and hint: '" + password_data.hint + "'")
                //stop
                break

                //server indicated authentication failed
            case CONSTANTS.MESSAGE.DARKNET.AUTHENTICATION_FAILED:
                break
                //data contains the target hostname of which authentication failed
                //get saved password data
                const password_data = servers_passwords.get(message.data)
                //log
                log.warning(ns, "Darknet", "Authentication failed for '" + message.data + "' with information '" +
                    JSON.stringify(password_data) + "'")
                //remove from map
                servers_passwords.delete(message.data)

                //if worker requests a password 
            case CONSTANTS.MESSAGE.DARKNET.PASSWORD_REQUEST:
                break
                //data contains the hostname of which the password is requested
                //create password to return
                var password = CONSTANTS.PASSWORD_NOT_FOUND
                //if we have a password for this
                if (servers_passwords.includes(message.data)) {
                    //write to port
                    password = servers_passwords.get(message.data).password
                }
                //reply with password
                port_password.tryWrite(JSON.stringify({
                    worker: message.hostname,
                    password: password
                }))
                //stop
                break

                //uncaught
            default:
                log.error(ns, "Darknet", "Uncaught condition on 'message.type': " + JSON.stringify(message.type) +
                    "'")
        }
    }
}


//try to solve the passwords
function solve_passwords(ns, servers_passwords, message) {
    //we assume the data is for the same server
    var hostname_target = message.data.target
    //get server info from message
    const server_info = message.data.server_details
    //get heartbleed logs from message
    const heartbleed = message.data.heartbleed


    //try to guess the password
    var password = guess_password(ns, hostname_target, server_info, heartbleed)
    //if password was found
    if (password != null) {
        //debug
        log.success(ns, "Darknet", "Guessed: '" + password + "' for '" + JSON.stringify(server_info) + "'")
        //if we don't have an entry
        if (!servers_passwords.has(hostname_target)) {
            //save password
            servers_passwords.set(hostname_target, {
                password: password,
                confirmed: false,
                heartbleed: heartbleed,
                server_info: server_info
            })
        //password entry exists
        } else {
            //check if different
            if (password != servers_passwords.get(hostname_target).password) {
                //either the server has rebooted and had a password change, or ???
                const saved_password_information = servers_passwords.get(hostname_target)
                //save password
                servers_passwords.set(hostname_target, {
                    password: password,
                    confirmed: false,
                    heartbleed: heartbleed,
                    server_info: server_info
                })
                //log information
                log.warning(ns, "Darknet", "Found different saved password for '" + hostname_target + "': '" + JSON.stringify(saved_password_information) + "'")
            }
        }
    //password was not found
    } else {
        //debug
        log.warning(ns, "Darknet", "Could not guess password for: '" + hostname_target + "', info: '" + JSON.stringify(
            server_info) + "', heartbleed: '" + heartbleed + "'")
    }
}


//function to return the information as soon as it is available
async function guess_password(ns, hostname_target, server_info, heartbleed) {
    //log information
    log.info(ns, "Darknet", "Received password information: '" + JSON.stringify(heartbleed) + "' fom server '" +
        hostname_target + "', with server data: '" + JSON.stringify(server_info) + "'")
        
    //variable to fill (sometimes)
    var password = ""

    //try to solve by model
    switch (server_info.modelId) {
        case "":
            return null
        default:
            //check other things
            break
    }

    //solve by hints
    //if no password needed
    if (server_info.passwordLength == 0) {
        //no password
        return ""
    }

    //if we need to extract the password from the data (numeric)
    if (server_info.passwordHint == "Type the numbers to prove you are human") {
        //for each character in the data
        for (const character in server_info.data) {
            //check if a number
            if (character >= '0' && character <= '9') {
                //add to password
                password += character
            }
        }
        //return the pieced password
        return password
    }

    //if the password is default = 0's
    if (server_info.passwordHint.includes("the default password")) {
        //for the lenght of the password
        for (let i = 0; i < server.passwordLength; i++) {
            //add zeroes
            password += "0"
        }
        //return the generated password
        return password
    }

    //if the password is part of the hint
    if (server_info.passwordHint.includes("The password is") || server_info.passwordHint.includes(
            "Remember to use") ||
        server_info.passwordHint
        .includes("It's set to")) {
        //password are the last characters of the hint
        return server.passwordHint.substring(server_info.passwordHint.length - server_info.passwordLength)
    }

    //nothing found
    return null
}
