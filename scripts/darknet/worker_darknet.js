//config
import { TIME_WAIT } from "./config.js"


//constants
import { SCRIPT } from "scripts/constants/scripts.js"
import { PORT } from "scripts/constants/ports.js"
import { RAM } from "scripts/constants/ram.js"
import { FILE_EXTENSION } from "scripts/constants/.js"


//functions
import * as log from "scripts/util/log.js"


/*
1.6 + 0.2 + 0.4 + 2 + 2 + 0.1 + 0 + 0 = 6.3 + 0.5 = 6.9 + 2 = 8.9
base                                1.6
ns.dnet.probe()                     0.2 GB
ns.dnet.authenticate()              0.4 GB
ns.dnet.phishingAttack()            2 GB 
ns.dnet.openCache()                 2 GB
ns.dnet.unleashStormSeed            0.1 GB
ns.dnet.labradar()                  0 GB
ns.dnet.labreport()                 0 GB
ns.dnet.heartbleed()                0.6 GB

ns.getServer()                      2 GB


needed?
ns.dnet.promoteStock()              2 GB
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
    //get hostname
    const hostname_self = ns.args[0]
    const threads = ns.args[1]
    //initialize
    init(ns, hostname_self, threads)
    //letiable to check for lab (once)
    let lab_checked = false
    //endless work
    while (true) {
        //open caches FIRST
        open_caches(ns, hostname_self)
        //authenticate servers
        await authenticate_servers(ns, hostname_self)
        //phish
        await phish(ns)
        //promote stock: TODO: create function
        await promote_stock(ns)
        //check if we need to check for lab
        if (!lab_checked) {
            //investigate lab (TODO: investigate)
            await investigate_lab(ns)
            //set flag
            lab_checked = true
        }
        //wait a bit
        await ns.sleep(TIME_WAIT)
    }
}


//disable logging
function init(ns, hostname_self, threads) {
    //disable logging
    //log.disable(CONFIG.DISABLE_LOGGING)
    //function to call when the script ends
    ns.atExit(() => {
        //get logs
        let logs = ns.getScriptLogs()
        if (logs == undefined) {
            return
        }
        //get the last log
        const last_log = logs.pop()
        if (last_log == undefined) {
            return
        }

        //check if restarting
        const server_restarted = last_log.includes("restarted")
        //if restarting
        if (server_restarted) {
            //try to respawn script
            ns.spawn(SCRIPT.WORKER.DARKNET, {
                    threads: threads,
                    spawnDelay: TIME_WAIT,
                    preventDuplicates: true
                },
                hostname_self, threads)
        }
    })
}


//function that tries to authenticate adjacent servers, with information provided by the orchestrator
async function authenticate_servers(ns, hostname_self) {
    //scan for darknet servers every time, since they might shift
    const servers_darknet_hostnames = ns.dnet.probe()
    //for each server found by scan
    for (const darknet_hostname of servers_darknet_hostnames) {
        //get player
        const player = ns.getPlayer()
        //get server information
        let server_details = ns.dnet.getServerDetails(darknet_hostname)
        //if no longer online or already authenticated or not enough charisma
        if (!server_details.isOnline || server_details.hasSession || player.skills.charisma < server_details
            .requiredCharismaSkill) {
            //go to next
            continue
        }
        //get running scripts
        const ps = ns.ps(darknet_hostname)
        //if already running something
        if (ps.length > 0) {
            //log
            log.info(ns, ns.pid, "Host '" + darknet_hostname +
                "' is already running a worker!")
            //next server
            continue
        }
        //authenticate
        let result = await authenticate_server(ns, server_details, darknet_hostname)
        //check result
        if (result == undefined) {
            //go to next
            continue
        }
        //if succesfull
        if (result.success == true) {
            //start worker
            await start_worker(ns, darknet_hostname)
            //not successfull
        } else if (result.code == ns.enums.DarknetResponseCode.AuthFailure) {
            //perform heartbleed for more information
            let heartbleed = await get_heartbleed(ns, darknet_hostname)
            //print message
            ns.alert("Auth failed for '" + darknet_hostname + "': '" + JSON.stringify(result) +
                "', getServerDetails: '" + JSON
                .stringify(server_details) + "', heartbleed: '" +
                JSON.stringify(heartbleed) + "'")
            log.warning(ns, ns.pid, "Auth failed for '" + darknet_hostname + "': '" + JSON.stringify(result) +
                "', getServerDetails: '" + JSON
                .stringify(server_details) + "', heartbleed: '" +
                JSON.stringify(heartbleed) + "'", true)
            //open logs
            ns.ui.openTail()
            //stop for now
            ns.exit()
        }
    }
}


//function that gets the password and authenticates
async function authenticate_server(ns, server_details, hostname) {
    //try to use saved password first
    const result_saved = await use_saved_password(ns, hostname)
    //request password
    if (result_saved.success) {
        //stop
        return result_saved
    }
    //for easy lookup
    const model = server_details.modelId
    const format = server_details.passwordFormat
    const length = server_details.passwordLength
    const data = server_details.data
    const hint = server_details.passwordHint
    //decide what to do on model
    switch (model) {
        case "ZeroLogon":
            return await authenticate(ns, hostname, "")

        case "Laika4":
            //decide on length
            switch (length) {
                case 3:
                    return await authenticate(ns, hostname, "max")
                case 4:
                    return await try_passwords(ns, hostname, ["spot", "fido"], "Laika4")
                case 5:
                    return await authenticate(ns, hostname, "rover")
                case 6:
                    return await authenticate(ns, hostname, "tigger")
                default:
                    log.error(ns, ns.pid, "Uncaught length: " + length)
            }

        case "DeskMemo_3.1":
            return await authenticate(ns, hostname, get_password(hint, length))

        case "CloudBlare(tm)":
            return await authenticate(ns, hostname, extract_numbers(data))

        case "OctantVoxel":
            return await authenticate(ns, hostname, calculate_base(data))

        case "Pr0verFl0":
            return await authenticate(ns, hostname, "_".repeat(length * 2))

        case "BellaCuore":
            return await authenticate(ns, hostname, convert_roman_numerals(ns, hint, length))

        case "FreshInstall_1.0":
            return await try_default_passwords(ns, hostname, format, length)

        case "PHP 5.4": 
            return await sort_password(ns, hostname, data, length)

        case "Factori-Os": 
            return await find_number_divisible(ns, hostname, length)

        case "AccountsManager_4.2":
            return await find_number_higher_lower(ns, hostname, length)

        case "NIL":
            return await increment_password(ns, hostname, length)

        case "OpenWebAccessPoint":
            return await derive_password_from_heartbleed(ns, hostname, length)

        case "DeepGreen":
            return await mastermind_password(ns, hostname, length)

        default:
            //heartbleed for more information
            let heartbleed = await get_heartbleed(ns, hostname)
            //log extra information
            log.error(ns, "", hostname + "-> unknown model '" + model +
                "', server details: '" + JSON.stringify(server_details) + "', heartbleed: '" + JSON
                .stringify(heartbleed) + "'", true)
            //open logs
            ns.ui.openTail()
    }
    return false
}


async function use_saved_password(ns, hostname) {
    //password letiable to fill
    let password = ""
    //request password
    const port = ns.getPortHandle(PORT.DARKNET)
    //create request
    port.tryWrite({
        "target": "Darknet",
        "type": "get",
        "hostname": hostname,
        "sender": ns.pid,
    })
    //placeholder
    let data = null
    //wait
    while (true) {
        //check the data
        data = port.peek()
        //if this is a message for us
        if (data.target == ns.pid) {
            //get the password
            password = data.password
            //remove the message
            port.read()
            //stop
            break
        }
        await ns.sleep(TIME_WAIT)
    }
    //check if password is set
    if (password == "") {
        //stop
        return {success: false}
    }
    //loop for instability
    while (true) {
        //try to authenticate
        let result = await ns.dnet.authenticate(hostname, password)
        //decide what to do
        switch (result.code) {
            //successfull
            case ns.enums.DarknetResponseCode.Success:
                //save data to manager
                port.tryWrite({
                    "target": "Darknet",
                    "type": "set",
                    "hostname": hostname,
                    "password": password,
                    "sender": ns.pid,
                })
                //indicate success
                return result
            case ns.enums.DarknetResponseCode.AuthFailure:
                //save data to manager
                port.tryWrite({
                    "target": "Darknet",
                    "type": "delete",
                    "hostname": hostname,
                    "sender": ns.pid,
                })
            case ns.enums.DarknetResponseCode.NotFound:
            case ns.enums.DarknetResponseCode.ServiceUnavailable:
            case ns.enums.DarknetResponseCode.DirectConnectionRequired:
                //indicate failure
                return result
                //timeout (due to instability)
            case ns.enums.DarknetResponseCode.RequestTimeOut:
                //try again
                continue
            default:
                log.error(ns, ns.pid, "authenticate - Uncaught result.code: '" + result.code + "'", true)
        }
    }
}


//actual authentication
async function authenticate(ns, hostname, password) {
    //try to keep solving
    while (true) {
        //try to authenticate
        let result = await ns.dnet.authenticate(hostname, password)
        //decide what to do
        switch (result.code) {
            //successfull
            case ns.enums.DarknetResponseCode.Success:
                //save data to manager
                ns.writePort(PORT.DARKNET, {
                    "target": "Darknet",
                    "type": "set",
                    "hostname": hostname,
                    "password": password,
                })
                //server moved or went offline
            case ns.enums.DarknetResponseCode.NotFound:
            case ns.enums.DarknetResponseCode.ServiceUnavailable:
            case ns.enums.DarknetResponseCode.DirectConnectionRequired:
            case ns.enums.DarknetResponseCode.AuthFailure:
                //stop
                return result
                //timeout (due to instability)
            case ns.enums.DarknetResponseCode.RequestTimeOut:
                //try again
                continue
            default:
                log.error(ns, ns.pid, "authenticate - Uncaught result.code: '" + result.code + "'", true)
        }
    }
}


//function that solves the password (in max 10 attempts)_
async function mastermind_password(ns, hostname, lenght) {
    //set index to loop
    let index = 0
    //create password
    let password = ["0", "_", "_"]
    //loop
    while (true) {
        //try password
        let result = await try_passwords(ns, hostname, [password.join("")], "mastermind_password")
        //if failed
        if (result.code == ns.enums.DarknetResponseCode.AuthFailure) {
            //heartbleed for more information
            const heartbleed = await get_heartbleed(ns, hostname)
            //check if successfull
            if (heartbleed.success == true) {
                //check if we have logs (we should..)
                if (heartbleed.logs.length == 0) {
                    //go next
                    continue
                }
                const heartbleed_log = JSON.parse(heartbleed.logs[0])
                const data = heartbleed_log.data
                //update the index
                index = data.split(",")[0]
                //check if we need to set to a number
                if (password[index] == "_") {
                    //set to 0
                    password[index] = "0"
                } else {
                    //update the password
                    password[index] = "" + (parseInt(password[index]) + 1)
                }
                //if overrunning (should not happen..)
                if (password[index] > "10") {
                    //set to 0
                    password[index] = "0"
                }
                log.info(ns, ns.pid, "Updated password to: '" + password + "'")
                //Hint: 0 symbols are match exactly,  and 0 symbols match but are in the wrong place.\",
                //\"data\":\"0,0\
            } else {
                //stop
                return heartbleed
            }
            //success, offline or moved
        } else {
            //return the result
            return result
        }
    }
}


//guesses the password with yes & yesn't
async function increment_password(ns, hostname, length) {
    //create an array of the length and fill with 0's
    let password = Array(length).fill(0)
    //loop
    while (true) {
        //try to auth
        let result = await try_passwords(ns, hostname, [password.join("")],
            "increment_password") // authenticate(ns, hostname, password.join(""))
        //if failed
        if (result.code == ns.enums.DarknetResponseCode.AuthFailure) {
            //heartbleed for more information
            let heartbleed = await get_heartbleed(ns, hostname)
            //check if successfull
            if (heartbleed.success == true) {
                log.info(ns, ns.pid, "heartbleed: '" + JSON.stringify(heartbleed) + "'")
                //get the results in array
                const heartbleed_log = JSON.parse(heartbleed.logs[0])
                const data = heartbleed_log.data
                //if failing for some reason
                if (data == undefined) {
                    //try again
                    continue
                }
                log.info(ns, ns.pid, "data: '" + JSON.stringify(data) + "'")
                const feedback = data.split(",")
                //log.info(ns, ns.pid, "Feedback: '" + feedback + "'", true)
                let password_attempted = heartbleed_log.passwordAttempted.split("")
                //for each value
                for (let i = 0; i < feedback.length; i++) {
                    //if incorrect
                    if (feedback[i] == "yesn't") {
                        //up the value
                        password[i] = parseInt(password_attempted[i]) + 1
                    } else {
                        password[i] = parseInt(password_attempted[i])
                    }
                }
            } else {
                //stop
                return heartbleed
            }
            //successfull, offline or moved
        } else {
            //stop
            return result
        }
    }
}


/*
message: (I'm busy browsing social media at the cafe)
data:  I think 8 with 5 is key.71196318 I think 9 with 8 is key.8028123456685952514642MMMMDLXXV524 iron_gym  byt3;t3ch:8598 598312347008qazwsx7418 I must use 8 & 9!
passwordAttempted: 0000
code: 401
*/
async function derive_password_from_heartbleed(ns, hostname, length) {
    //try a password
    let result = await try_passwords(ns, hostname, ["0".repeat(length)], "derive_password_from_heartbleed", true)
    //log
    log.info(ns, ns.pid, "derive_password_from_heartbleed (try_passwords): " + JSON.stringify(result))
    //if not succesfull
    if (result.code == ns.enums.DarknetResponseCode.AuthFailure) {
        //dummy value
        let heartbleed = await get_heartbleed(ns, hostname)
        //keep track of loops
        let loop = 1
        //keep looping until success
        while (heartbleed.success) {
            log.info(ns, ns.pid, "try_passwords - Heartbleeding for more information")
            
            log.info(ns, ns.pid, "heartbleed: '" + JSON.stringify(heartbleed) + "'")
            //for each log
            for (const log_raw of heartbleed.logs) {
                //convert to object
                const heartbleed_log = JSON.parse(log_raw)
                //debug
                log.info(ns, ns.pid, "heartbleed_log: '" + JSON.stringify(heartbleed_log) + "'")
                //if there is data
                if ("data" in heartbleed_log) {
                    //create regex
                    const regex = new RegExp(String.raw`\d{${length}}`,
                        "g") //RegExp(String.raw`\D\d{${length}}\D`, "g")
                    //get passwords
                    const matches = heartbleed_log.data.match(regex)
                    //debug
                    log.success(ns, ns.pid, "Found '" + JSON.stringify(matches) + "' in '" + JSON.stringify(
                        heartbleed_log.message) + "'")
                    //try passwords
                    result = await try_passwords(ns, hostname, matches, "derive_password_from_heartbleed")
                    //check for success
                    if (result.success) {
                        //return the success
                        return result
                    }
                }
            }
            //debug
            log.info(ns, ns.pid, "Couldn't find information in heartbleed log, trying again... (" + loop + ")")
            //if we keep looping...
            if (loop >= 5) {
                //stop
                break
            }
            //up the loop   
            loop += 1
            //heartbleed for more information
            heartbleed = await get_heartbleed(ns, hostname)
        }
        //if heartbleed failed
        if (!heartbleed.success) {
            //return the information
            return heartbleed
        }
    }
    //return result
    return result
}


//function that tries default passwords
async function try_default_passwords(ns, hostname, format, length) {
    //check the type
    if (format == "numeric") {
        let passwords = []
        passwords.push("0".repeat(length))
        let password1 = ""
        let password2 = ""
        for (let i = 0; i < length; i++) {
            password1 += i
            password2 += (i + 1)
        }
        passwords.push(password1)
        passwords.push(password2)
        log.info(ns, ns.pid, "passwords: " + JSON.stringify(passwords))
        //return the password
        return await try_passwords(ns, hostname, passwords, "try_default_passwords (numeric)")
    //letters
    } else if ("alphabetic") {
        if (length == 5) {
            return await authenticate(ns, hostname, "admin")
        //other lenght
        } else if (length == 8) {
            return await authenticate(ns, hostname, "password")
        }
    }
    //log
    log.error(ns, ns.pid, "")
    //should not happen
    return {
        code: ns.enums.DarknetResponseCode.AuthFailure,
        success: false
    }
}


//function that will try multiple passwords
async function try_passwords(ns, hostname, passwords, prefix = "", should_print = false) {
    log.info(ns, ns.pid, prefix + " -> try_passwords: " + passwords)
    //for each password
    for (const password of passwords) {
        //try 0's
        let result = await authenticate(ns, hostname, password)
        //check what to do
        switch (result.code) {
            //successfull
            case ns.enums.DarknetResponseCode.Success:
                //log
                log.success(ns, ns.pid, prefix + " success! : " + password, should_print)
                //save data to manager
                ns.writePort(PORT.DARKNET, {
                    "target": "Darknet",
                    "type": "set",
                    "hostname": hostname,
                    "password": password,
                })
                //server moved or went offline
            case ns.enums.DarknetResponseCode.NotFound:
            case ns.enums.DarknetResponseCode.ServiceUnavailable:
            case ns.enums.DarknetResponseCode.DirectConnectionRequired:
                //stop
                return result
        }
    }
    //nothing worked
    return {
        code: ns.enums.DarknetResponseCode.AuthFailure,
        success: false
    }
}


/*
Hint: The password is a number between 0 and 10
Length: 1
Format: numeric
Model: AccountsManager_4.2

AccountsManager_4.2 reply: '{"success":false,"code":401,"message":"Unauthorized"}'

Hearbleed:
message: The password is a number between 0 and 10
data: Lower
passwordAttempted: 9
code: 401
*/
/*
[2026 - 07 - 24 11: 06: 46] WARNING Unknown model 'AccountsManager_4.2', server details:
'{"isOnline":true,"isConnectedToCurrentServer":true,"hasSession":false,"modelId":"AccountsManager_4.2","passwordHint":"The password is a number between 0 and 100","data":"","logTrafficInterval":22.870000000000005,"passwordLength":2,"passwordFormat":"numeric","blockedRam":2,"difficulty":3,"requiredCharismaSkill":119,"depth":0,"isStationary":false}',
heartbleed:
'{"success":true,"code":200,"message":"Success","logs":["{\"code\":401,\"message\":\"The password is a number between 0 and 100\",\"data\":\"Higher\",\"passwordAttempted\":\"5\"}"]}'
[2026-07-24 03:52:24] WARNING	61604	Auth failed for 'neon-flame;oasis': '{"success":false,"code":401,"message":"Unauthorized"}', getServerDetails: '{"isOnline":true,"isConnectedToCurrentServer":true,"hasSession":false,"modelId":"AccountsManager_4.2","passwordHint":"The password is a number between 0 and 100","data":"","logTrafficInterval":20.683,"passwordLength":2,"passwordFormat":"numeric","blockedRam":2,"difficulty":4,"requiredCharismaSkill":182,"depth":1,"isStationary":false}', heartbleed: '{"success":true,"code":200,"message":"Success","logs":["{\"code\":401,\"message\":\"The password is a number between 0 and 100\",\"data\":\"Lower\",\"passwordAttempted\":\"99\"}"]}'
*/
//works
async function find_number_higher_lower(ns, hostname, length) {
    //start in the middle
    let number = parseInt("9".repeat(length))
    let number_change = Math.ceil(number / 2)
    //try to keep solving
    while (true) {
        //try a password
        let result = await try_passwords(ns, hostname, [number], "find_number_higher_lower",
            false) //authenticate(ns, hostname, number)
        //
        if (result.code == ns.enums.DarknetResponseCode.AuthFailure) {
            //heartbleed for more information
            result = await get_heartbleed(ns, hostname)
            //if successfull
            if (result.success == true) {
                //log
                log.info(ns, ns.pid, "heartbleed: '" + JSON.stringify(result) + "'")
                //check if we have logs
                const log_heartbleed_raw = result.logs[0]
                //if defined
                if(log_heartbleed_raw == undefined) {
                    //try again
                    continue
                }
                //check if the property exists
                if (!log_heartbleed_raw.hasOwnProperty('data')) {
                    //go to next
                    continue
                }
                //get the log
                const log_heartbleed = JSON.parse(log_heartbleed_raw)
                //if we need to go lower
                if (log_heartbleed.data == "Lower") {
                    //decrease the number by 25%
                    number -= number_change
                    //if we need to go higher
                } else if (log_heartbleed.data == "Higher") {
                    //increase the number by 25%
                    number += number_change
                    //uncaught
                } else {
                    //stop
                    log.error(ns, ns.pid, "'" + hostname + "'heartbleed uncaught: '" + result.data + "' (" + JSON
                        .stringify(result) +
                        ")", true)
                    //next
                    continue
                    //ns.exit()
                }
            } else {
                //stop
                return result
            }

        } else {
            //stop
            return result
        }
        //adjust the number smaller
        number_change = Math.ceil(number_change / 2)
    }
}


async function find_number_divisible(ns, hostname, length) {
    //passwords to try
    const passwords_to_try = [2, 3, 4, 5, 6, 7, 8, 9]
    let divisible = []
    let not_divisible = []
    let possible_passwords = []
    //try the divisor
    let result = await try_passwords(ns, hostname, passwords_to_try, "find_number_divisible")
    //if incorrect
    if (result == ns.enums.DarknetResponseCode.AuthFailure) {
        //get heartbleed
        let heartbleed = await get_heartbleed(ns, hostname)
        //if successfull
        if (heartbleed.success == true) {
            //check logs
            for (const log of heartbleed.logs) {
                //get the number
                const number = parseInt(log.message.split("'")[1]) //get the number
                //if divisible
                if (!log.message.includes("not")) {
                    //add to divisible list
                    divisible.push(number)
                    //not divisible
                } else {
                    //add to not divisible list
                    not_divisible.push(number)
                }
            }
        } else {
            //return the heartbleed information
            return heartbleed
        }
        log.info(ns, ns.pid, "Found divisible: " + divisible)
        log.info(ns, ns.pid, "Found non-divisible: " + not_divisible)
        //for each possible number
        for (let i = 0; i <= parseInt("9".repeat(length)); i++) {
            //keep track of possibility
            let flag_correct = true
            //for the non-divisibles
            for (const non_entry of not_divisible) {
                //check if we can divide cleanly
                if (non_entry % i == 0) {
                    //set flag to false
                    flag_correct = false
                    //stop
                    break
                }
            }
            //if still correct
            if (flag_correct) {
                //check the other divisible entries?
                for (const entry of divisible) {
                    //check if we cannot divide cleanly
                    if (entry % i != 0) {
                        //set flag to false
                        flag_correct = false
                        //stop
                        break
                    }
                }
            }
            //if flag is still correct
            if (flag_correct) {
                //add to possibility
                possible_passwords.push(i)
            }
        }
        log.info(ns, ns.pid, "find_number_divisible: trying passwords: " + possible_passwords)
        //try these passwords
        return await try_passwords(ns, hostname, possible_passwords, "find_number_divisible")
        //how to continue?
    }
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
    let previous_value = 0
    let current_value = 0
    let total = 0
    //get the last values
    let character_string = hint.split("'")[1]
    //debug
    log.info(ns, "", "Found numerals: '" + character_string + "' in '" + hint + "'")
    for (let i = 0; i < character_string.length; i++) {
        //get the character
        let character = character_string[i]
        //get the value
        current_value = roman_numeral[character]
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
    let num = total.toString()
    //while size is not yet reached (e.g. number is 9, should be 09?)
    while (num.length < length) {
        //add a leading 0
        num = "0" + num
    }
    //return the total
    return "" + num
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
    return "" + number
}


function extract_numbers(data) {
    let pasword_entry = ""
    //for each character in the data
    for (const index in data) {
        let character = data[index]
        //check if a number
        if (!isNaN(character)) {
            //add to password
            pasword_entry += character
        }
    }
    //return the pieced password
    return pasword_entry
}


function get_password(hint, lenght) {
    //return the last characters of the hint
    return hint.substring(hint.length - lenght)
}


//"heartbleed":["{\"code\":401,\"message\":\"I accidentally sorted the password: 029\",\"data\":\"029\",\"passwordAttempted\":\"\"}"],
//"server_details":{"isOnline":true,"isConnectedToCurrentServer":true,"hasSession":false,"modelId":"PHP 5.4","passwordHint":"I accidentally sorted the password: 029","data":"029","logTrafficInterval":20.683,"passwordLength":3,"passwordFormat":"numeric","blockedRam":0,"difficulty":4,"requiredCharismaSkill":180,"depth":1,"isStationary":false}}'
//"modelId":"PHP 5.4"
async function sort_password(ns, hostname, data, length) {
    //check for lenght
    if (length > 3) {
        //indicate WIP
        log.warning(ns, "", "sorting for size '" + length + "' not yet implemented!", true)
        //return empty
        return ns.enums.DarknetResponseCode.AuthFailure
    }

    //create the combinations
    const s1 = data[0]
    let passwords

    if (length == 1) {
        passwords = [s1]
        return await try_passwords(ns, hostname, passwords, "sort_password")
    }

    const s2 = data[1]
    if (length == 2) {
        passwords = [s1 + s2, s2 + s1]
        //try the passwords
        return await try_passwords(ns, hostname, passwords, "sort_password")
    }

    const s3 = data[2]
    passwords = [
        s1 + s2 + s3,
        s1 + s3 + s2,
        s2 + s3 + s1,
        s2 + s1 + s3,
        s3 + s1 + s2,
        s3 + s2 + s1
    ]
    //try the passwords
    return await try_passwords(ns, hostname, passwords, "sort_password")
}


//function that starts worker on server
async function start_worker(ns, hostname) {
    //get running scripts
    const ps = ns.ps(hostname)
    //if already running something
    if (ps.length > 0) {
        //log
        log.info(ns, ns.pid, "Host '" + hostname +
            "' is already running a worker!")
        //next server
        return
    }
    //get server information
    const server_info = ns.getServer(hostname)
    //get server details
    const server_details = ns.dnet.getServerDetails(hostname)
    //copy scripts
    let result = ns.scp(SCRIPT.TO_COPY.DARKNET, hostname)
    //if failed
    if (!result) {
        //log warning
        log.warning(ns, ns.pid, "Failed to copy '" + script + "' to '" + hostname + "'", true)
        //stop
        return
    }
    //get blocked ram
    let ram_blocked = ns.dnet.getBlockedRam(hostname)
    //calc ram costs: the eval worker for the darknet worker needs to scale, therefore it is not counted
    let threads_while_blocked = Math.floor((server_info.maxRam - ram_blocked) / RAM.WORKER.DARKNET)
    //calc the threads while there is ram blocked
    let threads_unblocked = Math.floor(server_info.maxRam / RAM.WORKER.DARKNET)
    //set threads to default value
    let threads = threads_while_blocked
    //if it has value to unblock
    if (threads_while_blocked < threads_unblocked) {
        //log
        log.info(ns, ns.pid, "Unblocking ram for " + (threads_unblocked - threads_while_blocked) + " more threads")
        //letiable for results 
        result = null //await ns.dnet.memoryReallocation(hostname)
        //while still ram blocked
        while (ram_blocked > 0.0) { //true) { 
            //free ram
            result = await ns.dnet.memoryReallocation(hostname)
            //if not successfull
            if (!result.success) {
                //NoBlockRAM
                if(result.code == 454) {
                    //stop
                    break
                }
                //stop
                return
            }
            //update ram
            ram_blocked = ns.dnet.getBlockedRam(hostname)
        }
        //update threads
        threads = threads_unblocked
    }

    //check for threads
    if (threads < 1) {
        //log
        log.error(ns, ns.pid, "start_worker on '" + hostname + "' has 0 threads")
        //stop
        return
    }

    //launch worker
    result = ns.exec(SCRIPT.WORKER.DARKNET, hostname, {
        preventDuplicates: true,
        threads: threads,
    }, hostname, threads)
    //check if not started
    if (result == false) {
        //get a message
        ns.ui.openTail()
        //debug
        log.warning(ns, ns.pid, "Failed to start worker (" + RAM.WORKER.DARKNET + " x " + threads +
            " = " + (RAM.WORKER.DARKNET * threads) + ") of available " + (server_info.maxRam -
                server_info.ramUsed) + " on '" + hostname + "' => " + JSON
            .stringify(server_info), true)
        //stop
        ns.exit()
    }
    //indicate success
    log.success(ns, ns.pid, "Launched worker on '" + hostname + "'")
}


//function that open caches
function open_caches(ns, hostname_self) {
    //get files on current server
    const files = ns.ls(hostname_self)
    //for each cache file found
    for (const file_name of files) {
        //get the extention
        const file_extension = "." + file_name.split('.').pop()
        //depending on the extention
        switch (file_extension) {
            //if type of cache
            case FILE_EXTENSION.CACHE:
                //collect cache
                const reward = ns.dnet.openCache(file_name)
                //debug
                log.success(ns, ns.pid, "Opened cache: '" + JSON.stringify(reward) + "'")
                //stop
                break

                //if type of txt or lit
            case FILE_EXTENSION.TEXT:
            case FILE_EXTENSION.LITERATURE:
                //read file
                const file_contents = ns.read(file_name)
                //debug
                log.success(ns, ns.pid, "Found file: '" + file_name + "' => '" + file_contents + "'")

            case FILE_EXTENSION.CODING_CONTRACT:
                //communicate to coding contract
                ns.tryWritePort(PORT.CODING_CONTRACT, {
                    "hostname": hostname_self, 
                    "filename": file_name,
                    "origin": "darknet",
                })                
                //stop
                break

            case FILE_EXTENSION.EXECUTABLE:
                //check if storm seed
                if (file_name == "STORM_SEED.exe") {
                    //unlseach storm seed
                    const storm_result = ns.dnet.unleashStormSeed()
                    //debug
                    log.warning(ns, ns.pid, "Launched STORM_SEED: '" + JSON.stringify(storm_result) + "'", true)
                } else {
                    //debug
                    log.warning(ns, ns.pid, "Found executable '" + file_name + "'", true)
                }
                //stop
                break

            case FILE_EXTENSION.SCRIPT:
                //do nothing
                break

            default:
                log.error(ns, ns.pid, "Uncaught condition 'file_extension': '" + file_extension + "'")
        }
    }
}


//get and handle heartbleed information
async function get_heartbleed(ns, hostname) {
    //create log letiable
    let logs = []
    //check if server is online
    /*if(ns.getServer(hostname)) {
        return {success: false, logs: logs}
    }*/
    //"Server restarting, terminating scripts..."
    //get heartbleed
    const heartbleed = await ns.dnet.heartbleed(hostname)
    
    switch (heartbleed.code) {
        //if successfull
        case ns.enums.DarknetResponseCode.Success: 
        //continue
        break

        /*
        //if timeout due to instability
        case ns.enums.DarknetResponseCode.RequestTimeOut: 
        //try again
        return await get_heartbleed(ns, hostname)
        */
        /*
        case ns.enums.DarknetResponseCode.DirectConnectionRequired:
        case ns.enums.DarknetResponseCode.AuthFailure:
        case ns.enums.DarknetResponseCode.Forbidden: 
        case ns.enums.DarknetResponseCode.NotFound: 
        case ns.enums.DarknetResponseCode.RequestTimeOut: 
        case ns.enums.DarknetResponseCode.NotEnoughCharisma: 
        case ns.enums.DarknetResponseCode.StasisLinkLimitReached: 
        case ns.enums.DarknetResponseCode.NoBlockRAM: 
        case ns.enums.DarknetResponseCode.PhishingFailed: 
        case ns.enums.DarknetResponseCode.ServiceUnavailable: 
        */
        default: 
            return {success: false, code: heartbleed.code, logs: logs}
    }
    //for each log
    for (const log of heartbleed.logs) {
        //if the log is not a 'restart' log
        if (log != "Server restarting, terminating scripts...") {
            //add it to the logs
            logs.push(log)
        }
    }
    //return success and logs
    return {success: true, logs: logs, code: heartbleed.code}
}


//phish
async function phish(ns) {
    //dummy
    let result_phishing = {
        success: true
    }
    //while we can attempt
    //while (result_phishing.success == true) {
    //Phishing attacks can only be run from scripts on darknet servers.
    result_phishing = await ns.dnet.phishingAttack()
    //export type DarknetResult = { success: boolean; code: DarknetResponseCode; message: string };
    log.info(ns, ns.pid, "PhishingAttack: " + JSON.stringify(result_phishing))
    //wait a bit
    //await ns.sleep(TIME_WAIT)
    //}
}


//promote stock: TODO
async function promote_stock(ns) {
    //TODO: how to check which stock we own and how to communicate this?
    //let result_promote = await ns.dnet.promoteStock('" + sym + "')")
    //Spends some time spreading propaganda about a stock to increase its volatility. 
    // This does not actually change the stock's forecasts, but a savvy investor can take advantage of the chaos. 
    // The effect scales with charisma and the number of threads used, but degrades over time if left alone.
    //This function requires TIX API access. You can use purchaseTixApi to purchase it.
}


//TODO: investigate
async function investigate_lab(ns) {
    //There is more than meets the eye.
    let result_radar = await ns.dnet.labradar()
    //if success
    if (result_radar.success) {
        //debug
        log.success(ns, ns.pid, "result_radar: " + JSON.stringify(result_radar), result_report.success)
    }
    //Not all who wander are lost.
    let result_report = await ns.dnet.labreport()
    if (result_report.success) {
        //debug
        log.success(ns, ns.pid, "result_report: " + JSON.stringify(result_report), result_report.success)
    }
    return (result_radar || result_report.success)
}
