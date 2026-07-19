import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"
import * as evaluate from "scripts/sub/evaluate.js"


//main loop
export async function main(ns) {
    //stop logging
    //ns.disableLog("ALL")
    ns.disableLog("sleep")
    //clear ports
    ns.getPortHandle(CONSTANTS.PORT.DARKNET.INFORMATION).clear()
    ns.getPortHandle(CONSTANTS.PORT.DARKNET.PASSWORD).clear()


    //save our own hostname
    const hostname_self = ns.args[0]
    //get our max ram
    const allowed_ram = ns.args[1]
    //init
    evaluate.init(ns, hostname_self, CONSTANTS.RAM.DARKNET.ORCHESTRATOR_EVAL, true, allowed_ram)
    //create map of passwords
    var servers_passwords = new Map()
    //add self (darkweb server)
    servers_passwords.set(hostname_self, {
        password: "",
        confirmed: true,
        heartbleed: {},
        server_info: {}
    })
    //keep track of connected servers
    //key = hostname, value = isStationary property
    var connected_servers = new Map()
    //add this server (for visibility?)
    connected_servers.set(hostname_self, true)

    //loop forever
    while (true) {
        //wait until next mutation
        await ns.sleep(CONSTANTS.TIME.WAIT) //await ns.dnet.nextMutation()
        //communicate with workers
        await communicate_with_workers(ns, servers_passwords, connected_servers)
        //move connected servers
        //await move_servers(ns, connected_servers)
        //wait a little bit
        await ns.sleep(CONSTANTS.TIME.WAIT)
    }
}


//function that communicate with worker scripts
/* mesage data is formatted like:
    hostname = hostname of worker (either sent from or sent to, depending on the port)
    type = type of request
    data = data (depends on the request)
*/
async function communicate_with_workers(ns, servers_passwords, connected_servers) {
    //create port object
    const port_in = ns.getPortHandle(CONSTANTS.PORT.DARKNET.INFORMATION)
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
        //if not a correct message
        if (typeof sent_message === 'object' && sent_message !== null) {
            //debug
            log.info(ns, "Darknet_orch", "Found message: " + sent_message, true)
            //get server information of the target server
            const server_info = await evaluate.exec(ns, "ns.getServer('" + sent_message.hostname + "')")
            //check if online
            if (server_info.isOnline) {
                //stop
                break
            }
        }
        //remove the message from the list (target is offline)
        port_password.read()
    }

    //while there is data incoming
    while (port_in.peek() != CONSTANTS.PORT.NO_DATA) {
        //get the message
        var message = JSON.parse(port_in.read())

        //debuy
        //log.info(ns, "", "Received message: " + JSON.stringify(message), true)
        //create password date variable
        var password_data = null

        //decide on what to do
        switch (message.type) {
            case CONSTANTS.MESSAGE.DARKNET.FILE:
                //save to file for now?
                await evaluate.exec(ns, "ns.write('darknet_files/" + message.file_name + "','" + message.data +
                    "')")
                //stop
                break
                //information is provided from workers to orchestrator
            case CONSTANTS.MESSAGE.DARKNET.INFORMATION:
                //data contains the hint and server information
                //log
                log.info(ns, "", "Received information: '" + JSON.stringify(message) + "'")
                //solve passwords
                await solve_passwords(ns, servers_passwords, message)
                //stop
                break

                //worker indicates a server has been authenticated
            case CONSTANTS.MESSAGE.DARKNET.AUTHENTICATED:
                //data is the hostname which has been authenticated
                //get saved password data
                password_data = servers_passwords.get(message.data)
                //set to true
                password_data.confirmed = true
                //overwrite password data
                password_data.password = message.password
                //save to map
                servers_passwords.set(message.data, password_data)
                //log
                log.success(ns, "", "Authentication success for '" + message.data +
                    "' with password '" +
                    password_data.password + "' and hint: '" + password_data.hint + "'")
                //stop
                break

                //server indicated authentication failed
            case CONSTANTS.MESSAGE.DARKNET.AUTHENTICATION_FAILED:
                //get saved password data
                password_data = servers_passwords.get(message.data)
                //check if server still online
                //get server information of the target server
                const server_info = await evaluate.exec(ns, "ns.getServer('" + message.data + "')")

                if (password_data.heartbleed == ["Server restarting, terminating scripts..."]) {
                    //do nothing
                    break
                }
                //if still online
                if (server_info.isOnline) {
                    //log
                    log.warning(ns, "", "Authentication of '" + message.pid + "' failed for '" +
                        message.data +
                        "' with information '" +
                        JSON.stringify(password_data) + "' => " + JSON.stringify(server_info))
                    //TEMP
                    ns.ui.openTail()
                    ns.exit()
                }

                //if worker requests a password 
            case CONSTANTS.MESSAGE.DARKNET.PASSWORD_REQUEST:
                //data contains the hostname of which the password is requested
                //create password to return
                var password = CONSTANTS.PASSWORD_NOT_FOUND
                //if we have a password for this
                if (servers_passwords.has(message.data)) {
                    //save the password
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
                log.error(ns, "", "Uncaught condition on 'message.type': " + JSON.stringify(
                        message) +
                    "'")
        }
    }
}


//try to solve the passwords
async function solve_passwords(ns, servers_passwords, message) {
    //we assume the data is for the same server
    var hostname_target = message.data.target
    //get server info from message
    const server_info = message.data.server_details
    //get heartbleed logs from message
    const heartbleed = message.data.heartbleed

    //try to guess the password
    var password = await guess_password(ns, hostname_target, server_info, heartbleed)

    //if password was found
    if (password != null) {
        //debug
        //log.success(ns, "Darknet", "Guessed: '" + password + "' for '" + JSON.stringify(server_info) + "'", true)

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
            }
        }
        //password was not found
    } else {
        //debug
        log.warning(ns, "Darknet", "Could not guess password for: '" + hostname_target + "', info: '" + JSON
            .stringify(
                server_info) + "', heartbleed: '" + heartbleed + "'")
    }
}


//function to return the information as soon as it is available
async function guess_password(ns, hostname_target, server_info, heartbleed) {
    //for easy lookup
    const model = server_info.modelId
    const format = server_info.passwordFormat
    const length = server_info.passwordLength
    const data = server_info.data
    const hint = server_info.passwordHint
    //get server details
    const server_details = await evaluate.exec(ns, "ns.getServer('" + hostname_target + "')")    
    const common_passwords = {
        "numeric": {
            1: ["0"],
            4: ["2000", "6969"],
            6: ["112233", "123123", "696969", "666666", "123321", "654321", "121212", "777777","159753"],
            7: ["1234567", "7777777"],
            10: ["1234567890"],
        },
        "alphabetic": {
            3: ["max"],
            4: ["fido","spot","pass", "love"],
            5: ["tigger", "rover"],
            6: ["joshua", "cheese", "amanda", "summer", "ashley", "ginger", "aaaaaa", "robert", "thomas", "hockey","ranger","daniel","george","dragon","monkey","shadow","master","qazwsx","jordan","maggie"],
            7: ["charlie","letmein","mustang", "michael","zxcvbnm","freedom"],
            8: ["princess", "sunshine", "iloveyou","starwars","computer","michelle","baseball","superman","jennifer"],
            10: ["qwertyuiop"],
        },
        "alphanumeric": {
            6: ["abc123","123qwe"],
            8: ["1qaz2wsx","trustno1"],
        },
    }
    //159753, aaaaaa, ginger, princess, joshua, cheese, amanda, summer, love, ashley, 6969, nicole, chelsea, biteme, matthew

    //log information
    log.info(ns, "", "Guessing password for model '" + model + "': format: '" + format + "', length: '" + length +
        "', hint: '" + hint + "', data: '" + data + "'")
    //password variable to fill
    var passwords_guessed = []
    //try to solve by model
    switch (model) {
        case "ZeroLogon":
            passwords_guessed = [""]
            //stop
            break

        case "FreshInstall_1.0":
            passwords_guessed = get_default_password(format, length)
            //stop
            break

        case "PHP 5.4":
            passwords_guessed =  get_unsorted_password(data, length)
            //stop
            break

        case "AccountsManager_4.2":
        case "Factori-Os":
        case "DeepGreen":
        case "buster":
        case "Pr0verFl0":
        case "OpenWebAccessPoint":
        case "NIL":
            passwords_guessed = generate_characters(ns, length, format)
            //stop
            break

        case "BellaCuore":
            passwords_guessed = convert_roman_numerals(ns, hint, length)
            //stop
            break

        case "DeskMemo_3.1":
            passwords_guessed = get_password(hint, length)
            log.info(ns, "", "found password: '" + passwords_guessed + "'")
            //stop
            break

        case "CloudBlare(tm)":
            passwords_guessed = extract_numbers(data)
            log.info(ns, "", "Extracted '" + passwords_guessed + "'")
            //stop
            break

        case "OctantVoxel": //was roman? now base?
            passwords_guessed = calculate_base(data)
            //stop
            break
        
        case "Laika4":
            //should be part of the common passwords?
            break

        default:
            //log extra information
            log.warning(ns, "", "Unknown model '" + model + "': hostname: '" + hostname_target +
                "', heartbleed: '" + JSON.stringify(heartbleed) + "', server details: '" + JSON.stringify(
                    server_details) + "', server info: '" + JSON.stringify(server_info) + "'")
            //open logs
            ns.ui.openTail()
            //stop for now
            ns.exit()
    }

    //if this format exists
    if (format in common_passwords) {
        //and there are pre-defined passwords of this length
        if (length in common_passwords[format]) {
            //add the guessed passwords to the end of the list
            return common_passwords[format][length].concat(passwords_guessed)
        }
    } else {
        //should not happen
        log.error(ns, "", "Uncaught format: '" + format + "'")
    }
    //failsafe
    return passwords_guessed
}


//"heartbleed":["{\"code\":401,\"message\":\"It's still the factory settings\",\"data\":\"\",\"passwordAttempted\":\"00000\"}"],
//"server_info":{"modelId":"FreshInstall_1.0","passwordHint":"It's still the factory settings","data":"","passwordLength":5,"passwordFormat":"numeric"}}'
function get_default_password(format, length) {
    //create passwords to return
    var passwords = []
    //check the type
    if (format == "numeric") {
        passwords.push("0".repeat(length))
        var password1 = ""
        var password2 = ""
        for (let i = 0; i < length; i++) {
            password1 += i
            password2 += (i + 1)
        }
        passwords.push(password1)
        passwords.push(password2)
        //return the password
        return passwords
    } else if ("alphabetic") {
        if (length == 5) {
            return ["admin"]
        } else if (length == 8) {
            return ["password"]
        }
    }
    return [""]
}



//"heartbleed":["{\"code\":401,\"message\":\"I accidentally sorted the password: 029\",\"data\":\"029\",\"passwordAttempted\":\"\"}"],
//"server_info":{"isOnline":true,"isConnectedToCurrentServer":true,"hasSession":false,"modelId":"PHP 5.4","passwordHint":"I accidentally sorted the password: 029","data":"029","logTrafficInterval":20.683,"passwordLength":3,"passwordFormat":"numeric","blockedRam":0,"difficulty":4,"requiredCharismaSkill":180,"depth":1,"isStationary":false}}'
//"modelId":"PHP 5.4"
function get_unsorted_password(data, length) {
    //check for lenght
    if (length != 3) {
        //indicate WIP
        log.warnig(ns, "", "sorting for size '" + length + "' not yet implemented!", true)
        //return empty
        return [""]
    }
    //return the combinations
    const s1 = data[0]
    const s2 = data[1]
    const s3 = data[2]
    //todo: make dynamic?
    return [
        s1 + s2 + s3,
        s1 + s3 + s2,
        s2 + s3 + s1,
        s2 + s1 + s3,
        s3 + s1 + s2,
        s3 + s2 + s1
    ]
}

//"heartbleed":["{\"code\":401,\"message\":\"The password is a number between 0 and 100\",\"data\":\"Higher\",\"passwordAttempted\":\"00\"}"],
// "server_info":{"isOnline":true,"isConnectedToCurrentServer":true,"hasSession":false,"modelId":"AccountsManager_4.2",
// "passwordHint":"The password is a number between 0 and 100",
// "data":"",
// "passwordLength":2,"passwordFormat":"numeric","blockedRam":1,"difficulty":3,"requiredCharismaSkill":116,"depth":1,"isStationary":false}}'
//"modelId":"AccountsManager_4.2"
/*
    "heartbleed":["{\"code\":401,\"message\":\"Password is not divisible by ')'\",\"data\":\"false\",\"passwordAttempted\":\")\"}"],
"server_info":{"isOnline":true,"isConnectedToCurrentServer":true,"hasSession":false,"modelId":"Factori-Os","passwordHint":"The password is divisible by 1 ;)","data":"","logTrafficInterval":22.870000000000005,"passwordLength":1,"passwordFormat":"numeric","blockedRam":0,"difficulty":3,"requiredCharismaSkill":120,"depth":2,"isStationary":false}}' => 
    {"hostname":"zero_day::blade","ip":"206.186.234.168","sshPortOpen":false,"ftpPortOpen":false,"smtpPortOpen":false,"httpPortOpen":false,"sqlPortOpen":false,"hasAdminRights":false,"cpuCores":1,"isConnectedTo":false,"ramUsed":0,"maxRam":16,"organizationName":"","purchasedByPlayer":false,"backdoorInstalled":false,"isOnline":true,"depth":2,"modelId":"Factori-Os","hasStasisLink":false,"blockedRam":0,"staticPasswordHint":"The password is divisible by 1 ;)","passwordHintData":"","difficulty":3,"requiredCharismaSkill":120,"logTrafficInterval":22.870000000000005,"isStationary":false}

"heartbleed":["{\"code\":401,\"message\":\"Password is not divisible by ';)'\",\"data\":\"false\",\"passwordAttempted\":\";)\"}"],
"server_info":{"isOnline":true,"isConnectedToCurrentServer":true,"hasSession":false,"modelId":"Factori-Os","passwordHint":"The password is divisible by 1 ;)","data":"","logTrafficInterval":22.870000000000005,"passwordLength":2,"passwordFormat":"numeric","blockedRam":0,"difficulty":3,"requiredCharismaSkill":122,"depth":2,"isStationary":false}}' => 
    {"hostname":"5noitu1o5%ed41b","ip":"46.63.122.129","sshPortOpen":false,"ftpPortOpen":false,"smtpPortOpen":false,"httpPortOpen":false,"sqlPortOpen":false,"hasAdminRights":false,"cpuCores":1,"isConnectedTo":false,"ramUsed":0,"maxRam":16,"organizationName":"","purchasedByPlayer":false,"backdoorInstalled":false,"isOnline":true,"depth":2,"modelId":"Factori-Os","hasStasisLink":false,"blockedRam":0,"staticPasswordHint":"The password is divisible by 1 ;)","passwordHintData":"","difficulty":3,"requiredCharismaSkill":122,"logTrafficInterval":22.870000000000005,"isStationary":false}
*/
function generate_numbers(length) {
    //just create numbers for the lenght of the password
    var number_start = 0
    var number_end = parseInt("9".repeat(length))
    //create a list
    var password_list = []
    //for loop
    for (let i = number_start; i < number_end; i++) {
        //cast to string
        var num = i.toString()
        //while size is not yet reached
        while (num.length < length) {
            //add a leading 0
            num = "0" + num
        }
        //add the string
        password_list.push(num)
    }
    //debug
    log.info(ns, "", "Created the following between '" + number_start + "' and '" +
        number_end + "': '" + password_list + "'", true)
    return password_list
}



//Password hint: 'The password is the value of the number 'CIII'
function convert_roman_numerals(ns, hint, length) {
    //map to consult
    const roman_numeral = {
        I: 1,
        V: 5,
        X: 10,
        L: 50,
        C: 100,
        D: 500,
        M: 1000,
    }
    var previous_value = 0
    var current_value = 0
    var total = 0
    //get the last values
    var character_string = hint.split("'")[1]
    //debug
    log.info(ns, "", "Found numerals: '" + character_string + "' in 'hint'")
    for (let i = 0; i < character_string.length; i++) {
        //get the character
        var character = character_string[i]
        //get the value
        current_value = roman_numeral[character]

        //debug
        //log.info(ns, "", "Found character '" + character + "' which is '" + current_value + "'", true)
        //check if bigger than previous
        if (previous_value != 0 && current_value > previous_value) {
            //remove the number, twice (1 to get back to normal, then again to reduce it)
            total -= (previous_value * 2)
        }
        //add the current value
        total += current_value
        //update the previous value
        previous_value = current_value
    }
    //check if need to pad
    var num = total.toString()
    //while size is not yet reached (e.g. number is 9, should be 09?)
    while (num.length < length) {
        //add a leading 0
        num = "0" + num
    }
    //debug
    //log.success(ns, "", "Converted numerals'" + character_string + "' to '" + num + "'", true)
    //return the total
    return ["" + num]
}



/*
"passwordHint":"the password is the base 5 number 3031 in base 10",
"passwordHint":"the password is the base 4 number 111 in base 10",
"passwordHint":"the password is the base 8 number 505 in base 10", "passwordLength":3, "passwordFormat":"numeric"
Guessing password for model 'OctantVoxel': format: 'numeric', length: '3', hint: 'the password is the base 9 number 430 in base 10', data: '9,430'
*/
function calculate_base(data) {
    const split_data = data.split(",")
    const radix = parseInt(split_data[0])
    const number_string = split_data[1]
    //parse to base 10
    const number = parseInt(number_string, radix)
    //return (as string)
    return ["" + number]
}

function extract_numbers(data) {
    var pasword_entry = ""
    //for each character in the data
    for (const index in data) {
        var character = data[index]
        //check if a number
        if (!isNaN(character)) { // >= '0' && character <= '9') {
            //add to password
            pasword_entry += character
        }
    }
    //return the pieced password
    return [pasword_entry]
}

function generate_characters(ns, length, format) {
    //create set to fill and return
    var set = create_character_set(format)
    //check if we need to create more
    if (length > 1) {
        //extend the set
        set = extend_character_set(ns, set, length, format)
    }
    //return the (extended) set
    return set
}


//creates the base set
function create_character_set(format) {
    //set to fill
    var set = []
    //check format
    if (format == "alphabetic" || format == "alphanumeric") {
        //start and end
        const start = 'a'.charCodeAt(0)
        const end = 'z'.charCodeAt(0) + 1
        //for the characters
        for (let i = start; i < end; i++) {
            //get the character of the index
            const character = String.fromCharCode(i)
            //add to new list
            set.push(character)
        }
    }
    if (format == "numeric" || format == "alphanumeric") {
        //start and end
        const start = '0'.charCodeAt(0)
        const end = '9'.charCodeAt(0) + 1
        //for the characters
        for (let i = start; i < end; i++) {
            //get the character of the index
            const character = String.fromCharCode(i)
            //add to new list
            set.push(character)
        }
    }
    //return the set
    return set
}


//extends the provided set
function extend_character_set(ns, set, length, format, depth = 2) {
    //debug
    //log.info(ns, "", "Extending character set '" + set + "' to lenght '" + depth + "'")
    //create local set, as copy 
    var local_set = []
    //for each entry of the original set
    for (const entry of set) {
        //check format
        if (format == "alphabetic" || format == "alphanumeric") {
            //start and end
            const start = 'a'.charCodeAt(0)
            const end = 'z'.charCodeAt(0) + 1
            //for the characters
            for (let i = start; i < end; i++) {
                //get the character of the index
                const character = String.fromCharCode(i)
                //debug
                //log.info(ns, "", "Adding: '" + entry + character + "'")
                //add to new list
                local_set.push(entry + character)
            }
        }
        if (format == "numeric" || format == "alphanumeric") {
            //start and end
            const start = '0'.charCodeAt(0)
            const end = '9'.charCodeAt(0) + 1
            //for the characters
            for (let i = start; i < end; i++) {
                //get the character of the index
                const character = String.fromCharCode(i)
                //debug
                //log.info(ns, "", "Adding: '" + entry + character + "'")
                //add to new list
                local_set.push(entry + character)
            }
        }
    }
    //overwrite the total list
    set = local_set
    //check if we need to go deeper
    if (depth < length) {
        //go deeper
        set = extend_character_set(ns, set, length, format, depth + 1)
    }
    //return the set
    return set
}

function get_password(hint, lenght) {
    //return the last characters of the hint
    return [hint.substring(hint.length - lenght)]
}
/*
//correct password
async function correct_password(ns, servers_passwords, hostname) {
    //get saved password data
    var password_data = servers_passwords.get(hostname)

    //if it should be the default password
    if (password_data.server_info.passwordHint.includes("default password") && password_data.server_info.numeric) {
        //set to 0's instead
        servers_passwords.set(hostname, "0".repeat(password_data.server_info.passwordLength))
    }
}
    */

/*








"heartbleed":["{\"code\":401,\"message\":\"Password is not divisible by ';)'\",\"data\":\"false\",\"passwordAttempted\":\";)\"}"],
"server_info":{"isOnline":true,"isConnectedToCurrentServer":true,"hasSession":false,"modelId":"Factori-Os","passwordHint":"The password is divisible by 1 ;)","data":"","logTrafficInterval":22.870000000000005,"passwordLength":2,"passwordFormat":"numeric","blockedRam":1,"difficulty":3,"requiredCharismaSkill":118,"depth":1,"isStationary":false}}' => 
    {"hostname":"cyber::systems","ip":"205.120.233.74","sshPortOpen":false,"ftpPortOpen":false,"smtpPortOpen":false,"httpPortOpen":false,"sqlPortOpen":false,"hasAdminRights":true,"cpuCores":1,"isConnectedTo":false,"ramUsed":7.9,"maxRam":16,"organizationName":"","purchasedByPlayer":false,"backdoorInstalled":false,"isOnline":true,"depth":0,"modelId":"DeskMemo_3.1","hasStasisLink":false,"blockedRam":0,"staticPasswordHint":"The password is 489","passwordHintData":"","difficulty":2,"requiredCharismaSkill":64,"logTrafficInterval":25.3,"isStationary":false}


"passwordHint":"Warning: password buffer is 5 bytes",
"data":"",
"passwordLength":5,
"passwordFormat":"alphabetic"

"passwordHint":"Only a true master may pass",
"data":"",
"passwordLength":3,
"passwordFormat":"numeric",
heartbleed: '{
    "code":401,
    "message":"Hint: 0 symbols are match exactly,  and 0 symbols match but are in the wrong place.",
    "data":"0,0",
    "passwordAttempted":"PASSWORD_NOT_FOUND"
}'

"The default password is set\",\"data\":\"\",\"passwordAttempted\":\"00000\"}"],"server_info":{"isOnline":true,"isConnectedToCurrentServer":true,"hasSession":false,"modelId":"FreshInstall_1.0","passwordHint":"The default password is set","data":"","logTrafficInterval":31,"passwordLength":5,"passwordFormat":"numeric","blockedRam":1,"difficulty":0,"requiredCharismaSkill":1,"depth":0,"isStationary":false}}



[2026-07-17 12:18:31] scripts/exec/darknet_orchestrator.js: INFO	Darknet_orchestrator	' => 'II''
*/