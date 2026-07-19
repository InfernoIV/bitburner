import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"
import * as evaluate from "scripts/sub/evaluate.js"

/*
base                                1.6
ns.dnet.probe()                     0.2 GB
ns.dnet.heartbleed()                0.6 GB
ns.dnet.authenticate()              0.4 GB

ns.dnet.phishingAttack()            2 GB + 1.6 = 3.6
ns.dnet.openCache()                 2 GB
ns.dnet.promoteStock()              2 GB

ns.dnet.unleashStormSeed            0.1 GB

???
ns.dnet.labradar()                  0 GB
ns.dnet.labreport()                 0 GB


needed?
ns.dnet.induceServerMigration()     4 GB
ns.dnet.setStasisLink()             12 GB
*/



/*
    Function that:
        continously scans the darkweb network
        continously heartbleed found servers for logs
            what happens when there are nog logs? Is there a way to check IF there are logs?
        provides server hostnames and heartbleed logs back to the orchestrator

        when password is found by the orchestrator: tries to authenticate with the server (is successfull, only once?)
            This allows the orchestrator to remotely connect
        
        performs phishing attacks on self
        open caches
        influence stock
*/
export async function main(ns) {
    //callback
    /*
    ns.atExit(() => {
        ns.ui.openTail()
    })*/

    //stop logging
    //ns.disableLog("ALL")
    ns.disableLog("sleep")
    //get hostname
    const hostname_self = ns.args[0]
    //get max ram usage
    const max_ram = ns.args[1]
    //init eval
    evaluate.init(ns, hostname_self, CONSTANTS.RAM.DARKNET.WORKER_EVAL, true, max_ram)
    //endless work
    while (true) {
        //authenticate servers
        await authenticate_servers(ns, hostname_self)
        //perform different activities
        await perform_activities(ns, hostname_self)
        //wait a bit
        await ns.sleep(CONSTANTS.TIME.WAIT)
    }
}


/* mesage data is formatted like:
    hostname = hostname of worker (either sent from or sent to, depending on the port)
    type = type of request
    data = data (depends on the request)
*/
//function that tries to authenticate adjacent servers, with information provided by the orchestrator
async function authenticate_servers(ns, hostname_self) {
    //scan for darknet servers every time, since they might shift
    const servers_darknet_hostnames = await evaluate.exec(ns, "ns.dnet.probe()")
    //for each server found by scan
    for (const darknet_hostname of servers_darknet_hostnames) {
        //debug
        log.info(ns, ns.pid, "Trying to authenticate for '" + darknet_hostname + "'")
        //get server information
        //get server information
        var server_details = await evaluate.exec(ns, "ns.dnet.getServerDetails('" + darknet_hostname + "')")
        //if no longer online
        if (!server_details.isOnline) {
            //go to next
            continue
        }
        //get running scripts
        const ps = await evaluate.exec(ns, "ns.ps('" + darknet_hostname + "')")
        //if already running something
        //if (server_details.ramUsed >= (CONSTANTS.RAM.DARKNET.WORKER + CONSTANTS.RAM.EVAL_ORCHESTRATOR)) {
        //if already scripts running
        if (ps.length > 0) {
            //log
            log.info(ns, ns.pid, "Host '" + darknet_hostname +
                "' is already running a worker!: " + JSON.stringify(server_details))
            //no need to do anything: next
            continue
        }
        //get common passwords
        const passwords_common = get_common_passwords(ns, server_details) 
        //authenticate
        var return_code = await authenticate(ns, hostname_self, darknet_hostname, passwords_common)
        //check if need to guess
        if (return_code == 401) {
            //guess password
            const passwords_guessed = await guess_password(ns, server_details)
            //authenticate again
            return_code = await authenticate(ns, hostname_self, darknet_hostname, passwords_guessed)
            //if still incorrect
            if (return_code == 401) {
                //perform heartbleed for more information
                return_code = await evaluate.exec(ns, "ns.dnet.heartbleed('" + darknet_hostname + "')")
                //print message
                log.warning(ns, ns.pid, "Auth failed for '" + darknet_hostname + "' with passwords '" + passwords_guessed + "' and info '" + JSON.stringify(server_details) + "', heartbleed: '" + JSON.stringify(return_code) + "'", true)
            }
        }   
    }
}


//function that returns common passwords to try first
function get_common_passwords(ns, server_details) {
//common passwords
    const common_passwords = {
        "numeric": {
            1: ["0"],
            4: ["2000", "6969"],
            6: ["112233", "123123", "696969", "666666", "123321", "654321", "121212", "777777", "159753"],
            7: ["1234567", "7777777"],
            10: ["1234567890"],
        },
        "alphabetic": {
            3: ["max"],
            4: ["fido", "spot", "pass", "love"],
            5: ["tigger", "rover"],
            6: ["joshua", "cheese", "amanda", "summer", "ashley", "ginger", "aaaaaa", "robert", "thomas",
                "hockey", "ranger", "daniel", "george", "dragon", "monkey", "shadow", "master", "qazwsx",
                "jordan", "maggie", "nicole", "biteme"
            ],
            7: ["charlie", "letmein", "mustang", "michael", "zxcvbnm", "freedom", "chelsea", "matthew"],
            8: ["princess", "sunshine", "iloveyou", "starwars", "computer", "michelle", "baseball", "superman",
                "jennifer"
            ],
            10: ["qwertyuiop"],
        },
        "alphanumeric": {
            6: ["abc123", "123qwe"],
            8: ["1qaz2wsx", "trustno1"],
        },
    }
    //get data
    const format = server_details.passwordFormat
    const length = server_details.passwordLength

     //if this format exists
    if (format in common_passwords) {
        //and there are pre-defined passwords of this length
        if (length in common_passwords[format]) {
            //add the guessed passwords to the end of the list
            return common_passwords[format][length]
        }
    } else {
        //should not happen
        log.error(ns, "", "Uncaught format: '" + format + "'")
    }
    //failsafe
    return [""]

}
//function that guesses password
async function guess_password(ns, server_details) {
    //debug
    log.info(ns, ns.pid, "Solving for '" + JSON.stringify(server_details) + "'")
    //for easy lookup
    const model = server_details.modelId
    const format = server_details.passwordFormat
    const length = server_details.passwordLength
    const data = server_details.data
    const hint = server_details.passwordHint
    
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
            passwords_guessed = get_unsorted_password(data, length)
            //stop
            break

        case "AccountsManager_4.2":
        case "Factori-Os":
        case "DeepGreen":
        case "buster":
        case "OpenWebAccessPoint":
        case "NIL":            
            passwords_guessed = generate_characters(ns, length, format)
            //stop
            break

        case "Pr0verFl0":
            //length of 7 bytes, overflows the array...
            //passwords_guessed = generate_characters(ns, length, format)
            //what to do?
            //removed the numbers from the name?
            passwords_guessed = ["prverfl", "PrverFl"]

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
                    server_details) + "', server info: '" + JSON.stringify(server_details) + "'")
            //open logs
            ns.ui.openTail()
            //stop for now
            ns.exit()
    }

   
    //failsafe
    return passwords_guessed
}


//"heartbleed":["{\"code\":401,\"message\":\"It's still the factory settings\",\"data\":\"\",\"passwordAttempted\":\"00000\"}"],
//"server_details":{"modelId":"FreshInstall_1.0","passwordHint":"It's still the factory settings","data":"","passwordLength":5,"passwordFormat":"numeric"}}'
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
//"server_details":{"isOnline":true,"isConnectedToCurrentServer":true,"hasSession":false,"modelId":"PHP 5.4","passwordHint":"I accidentally sorted the password: 029","data":"029","logTrafficInterval":20.683,"passwordLength":3,"passwordFormat":"numeric","blockedRam":0,"difficulty":4,"requiredCharismaSkill":180,"depth":1,"isStationary":false}}'
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
// "server_details":{"isOnline":true,"isConnectedToCurrentServer":true,"hasSession":false,"modelId":"AccountsManager_4.2",
// "passwordHint":"The password is a number between 0 and 100",
// "data":"",
// "passwordLength":2,"passwordFormat":"numeric","blockedRam":1,"difficulty":3,"requiredCharismaSkill":116,"depth":1,"isStationary":false}}'
//"modelId":"AccountsManager_4.2"
/*
    "heartbleed":["{\"code\":401,\"message\":\"Password is not divisible by ')'\",\"data\":\"false\",\"passwordAttempted\":\")\"}"],
"server_details":{"isOnline":true,"isConnectedToCurrentServer":true,"hasSession":false,"modelId":"Factori-Os","passwordHint":"The password is divisible by 1 ;)","data":"","logTrafficInterval":22.870000000000005,"passwordLength":1,"passwordFormat":"numeric","blockedRam":0,"difficulty":3,"requiredCharismaSkill":120,"depth":2,"isStationary":false}}' => 
    {"hostname":"zero_day::blade","ip":"206.186.234.168","sshPortOpen":false,"ftpPortOpen":false,"smtpPortOpen":false,"httpPortOpen":false,"sqlPortOpen":false,"hasAdminRights":false,"cpuCores":1,"isConnectedTo":false,"ramUsed":0,"maxRam":16,"organizationName":"","purchasedByPlayer":false,"backdoorInstalled":false,"isOnline":true,"depth":2,"modelId":"Factori-Os","hasStasisLink":false,"blockedRam":0,"staticPasswordHint":"The password is divisible by 1 ;)","passwordHintData":"","difficulty":3,"requiredCharismaSkill":120,"logTrafficInterval":22.870000000000005,"isStationary":false}

"heartbleed":["{\"code\":401,\"message\":\"Password is not divisible by ';)'\",\"data\":\"false\",\"passwordAttempted\":\";)\"}"],
"server_details":{"isOnline":true,"isConnectedToCurrentServer":true,"hasSession":false,"modelId":"Factori-Os","passwordHint":"The password is divisible by 1 ;)","data":"","logTrafficInterval":22.870000000000005,"passwordLength":2,"passwordFormat":"numeric","blockedRam":0,"difficulty":3,"requiredCharismaSkill":122,"depth":2,"isStationary":false}}' => 
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





//try to authenticate with this server
async function authenticate(ns, hostname_self, darknet_hostname, passwords) {
    //for each password
    for (const password of passwords) {
        //set retry to initiate first loop
        var retry = true
        //retry system
        while (retry) {
            //set retry to false, since the loop started
            retry = false
            //try to authenticate
            var result_auth = await ns.dnet.authenticate(darknet_hostname, password)
            //if successfull
            if (result_auth.success) {
                //debug
                log.success(ns, ns.pid, "Authentication successfull with '" + darknet_hostname +
                    "' using password '" + password + "'")
                //debug
                ns.toast("Dnet authenticated '" + darknet_hostname + "' using '" + password + "'")
                //start worker
                await start_worker(ns, darknet_hostname)
                //exit function
                return true
            }
            //debug
            log.warning(ns, ns.pid, "Auth failed: " + JSON.stringify(result_auth))
            /*
            Success: 200;
            DirectConnectionRequired: 351;
            AuthFailure: 401;
            Forbidden: 403;
            NotFound: 404;
            RequestTimeOut: 408;
            NotEnoughCharisma: 451;

            StasisLinkLimitReached: 453;
            NoBlockRAM: 454;
            PhishingFailed: 455;
            ServiceUnavailable: 503;
            */
            //check if we need to do anything
            if (result_auth.code == "408") { //RequestTimeOut
                //debug
                log.warning(ns, ns.pid, "Auth failed: '" + JSON.stringify(result_auth) + "', retrying")
                retry = true
            }
            if (result_auth.code == "351" || //DirectConnectionRequired = server moved
                result_auth.code == "451" || //NotEnoughCharisma = don't try -> next!
                result_auth.code == "503") { //ServiceUnavailable = server moved?
                //stop authenticating for this server
                return false
            }
            //check if we need to open tail
            if (retry) {
                ns.openTail()
            }
            //wait a little bit
            await ns.sleep(CONSTANTS.TIME.WAIT)
        }
    }
    
    //indicate failure
    return false
}


//function that starts worker on server
async function start_worker(ns, hostname) {
    //get server details
    const server_details = await evaluate.exec(ns, "ns.dnet.getServerDetails('" + hostname + "')")
    //get blocked ram
    var ram_blocked = await evaluate.exec(ns, "ns.dnet.getBlockedRam('" + hostname + "')")

    //variable for results
    var result = null
    //while still ram blocked
    while (ram_blocked > 0) {
        //free ram
        result = await evaluate.exec(ns, "ns.dnet.memoryReallocation('" + hostname + "')")
        //update blocked ram
        ram_blocked = await evaluate.exec(ns, "ns.dnet.getBlockedRam('" + hostname + "')")
        //wait a little bit
        await ns.sleep(CONSTANTS.TIME.WAIT)
    }
    //copy scripts
    for (const script of CONSTANTS.SCRIPT.DARKNET.TO_COPY) {
        //copy scripts
        result = await ns.scp(script, hostname)
        //result = await evaluate.exec(ns, "ns.scp('" + script + "','" +  hostname + "')")

        //if failed
        if (!result) {
            //log warning
            log.warning(ns, "", "Failed to copy '" + script + "' to '" + hostname + "'")
        }
    }
    //calc ram
    //get server information
    const server_info = await evaluate.exec(ns, "ns.getServer('" + hostname + "')")
    //debug
    log.info(ns, ns.pid, "server '" + hostname + "' starting: " + JSON.stringify(server_details))
    //if still online / connected
    if (server_info.isOnline) { //} && server_details.isConnectedToCurrentServer) {
        //kill scripts on target server
        //await evaluate.exec(ns, "ns.killall('" + hostname + "')")
        await ns.killall(hostname)

        //calc ram costs
        //darkweb server:
        //worker + eval + eval worker
        //the eval worker for the darknet worker needs to scale, therefore it is not counted
        const max_ram_eval_worker = server_info.maxRam - CONSTANTS.RAM.DARKNET.WORKER - CONSTANTS.RAM
            .EVAL_ORCHESTRATOR
        //debug
        log.info(ns, ns.pid, "Target has " + server_info.maxRam + " GB, and requires " + CONSTANTS.RAM.DARKNET.WORKER + ", " + CONSTANTS.RAM.EVAL_ORCHESTRATOR + "=> resulting into '" + max_ram_eval_worker + "'")


        //launch worker
        result = ns.exec(CONSTANTS.SCRIPT.DARKNET.WORKER, hostname, {
            preventDuplicates: true
        }, hostname, max_ram_eval_worker)
        //check if ok
        if (result == false) {
            //debug
            log.error(ns, ns.pid, "Failed to start worker on '" + hostname + "' => " + JSON
                .stringify(server_info))
            //give alert
            /*
            ns.alert(ns, ns.pid, "Failed to start worker on '" + hostname + "' => " + JSON
                .stringify(server_details))*/
        }
        //indicate success
        log.success(ns, ns.pid, "Launched worker on '" + hostname + "'")
    }
}


//activities that can be performed multiple times, but only by self
async function perform_activities(ns, hostname_self) {
    //get files on current server
    const files_cache = await evaluate.exec(ns, "ns.ls('" + hostname_self + "')") //, '.cache')")
    //for each cache file found
    for (const file_name of files_cache) {
        //get the extention
        const file_extension = "." + file_name.split('.').pop()
        //depending on the extention
        switch (file_extension) {
            //if type of cache
            case CONSTANTS.FILE_EXTENSION.CACHE:
                //collect cache
                const reward = await evaluate.exec(ns, "ns.dnet.openCache('" + file_name + "')")
                //debug
                log.success(ns, ns.pid, "Opened cache: '" + JSON.stringify(reward) + "'")
                //stop
                break

            //if type of txt or lit
            case CONSTANTS.FILE_EXTENSION.TEXT:
            case CONSTANTS.FILE_EXTENSION.LITERATURE:
                //read file
                const file_contents = await evaluate.exec(ns, "ns.read('" + file_name + "')")
                //debug
                log.success(ns, ns.pid, "Found file: '" + file_name + "' => '" + file_contents + "'", true)

            case CONSTANTS.FILE_EXTENSION.CODING_CONTRACT:
                //TODO
                //remove the file
                await evaluate.exec(ns, "ns.rm('" + file_name + "','" + hostname_self + "')")
                //stop
                break

            case CONSTANTS.FILE_EXTENSION.EXECUTABLE:
                //check if storm seed
                if (file_name == "STORM_SEED.exe") {
                    //unlseach storm seed
                    const storm_result = await evaluate.exec(ns, "ns.dnet.unleashStormSeed()")
                    //debug
                    log.warning(ns, ns.pid, "Launched STORM_SEED: '" + JSON.stringify(storm_result) + "'", true)
                } else {
                    //debug
                    log.warning(ns, ns.pid, "Found executable '" + file_name + "'", true)
                }
                //stop
                break

            case CONSTANTS.FILE_EXTENSION.SCRIPT:
                //do nothing
                break

            default:
                log.error(ns, ns.pid, "Uncaught condition 'file_extension': '" + file_extension + "'")
        }
        //Phishing attacks can only be run from scripts on darknet servers.
        var result_phishing = await evaluate.exec(ns, "ns.dnet.phishingAttack()")
        //export type DarknetResult = { success: boolean; code: DarknetResponseCode; message: string };
        log.info(ns, ns.pid, "PhishingAttack: " + JSON.stringify(result_phishing))
    }

    //TODO: how to check which stock we own and how to communicate this?
    //var result_promote = await evaluate.exec(ns, "ns.dnet.promoteStock('" + sym + "')")
    //Spends some time spreading propaganda about a stock to increase its volatility. 
    // This does not actually change the stock's forecasts, but a savvy investor can take advantage of the chaos. 
    // The effect scales with charisma and the number of threads used, but degrades over time if left alone.
    //This function requires TIX API access. You can use purchaseTixApi to purchase it.

    //TODO: investigate
    //There is more than meets the eye.
    var result_radar = await ns.dnet.labradar()
    //if success
    if (result_radar.success) {
        //debug
        log.success(ns, ns.pid, "result_radar: " + JSON.stringify(result_radar), true)
    }

    //Not all who wander are lost.
    var result_report = await ns.dnet.labreport()
    if (result_report.success) {
        //debug
        log.success(ns, ns.pid, "result_report: " + JSON.stringify(result_report), true)
    }
}

/*
TODO

RANGE ERROR
RangeError: Invalid array length

Stack: RangeError: Invalid array length
    at Array.push (<anonymous>)
    at extend_character_set (darkweb/​scripts/​exec/​darknet_worker.js:488:27)
    at extend_character_set (darkweb/​scripts/​exec/​darknet_worker.js:511:15)
    at extend_character_set (darkweb/​scripts/​exec/​darknet_worker.js:511:15)
    at extend_character_set (darkweb/​scripts/​exec/​darknet_worker.js:511:15)
    at extend_character_set (darkweb/​scripts/​exec/​darknet_worker.js:511:15)
    at generate_characters (darkweb/​scripts/​exec/​darknet_worker.js:427:15)
    at guess_password (darkweb/​scripts/​exec/​darknet_worker.js:182:33)
    at authenticate_servers (darkweb/​scripts/​exec/​darknet_worker.js:105:31)
    at async main (darkweb/​scripts/​exec/​darknet_worker.js:62:9)

Script: scripts/exec/darknet_worker.js
PID: 8541

*/