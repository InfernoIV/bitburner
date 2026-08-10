import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"

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
    
    var lab_checked = false
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
        await ns.sleep(CONSTANTS.TIME.WAIT)
    }
}


//disable logging
function init(ns, hostname_self, threads) {
    ns.disableLog("disableLog")
    ns.disableLog("sleep")
    //ns.disableLog("scp")
    //ns.disableLog("exec")
    ns.disableLog("dnet.probe")
    ns.disableLog("dnet.phishingAttack")

    //note: this will crash the game when trying to kill the scripts..
    //if server restarts (or shuts down)
    
    ns.atExit(() => {
        //get logs
        var logs = ns.getScriptLogs()
        //get the last log
        const last_log = logs.pop()
        //check if restarting
        const server_restarted = last_log.includes("restarted")
        //if restarting
        if (server_restarted) {
            //try to respawn script
            ns.spawn(CONSTANTS.SCRIPT.WORKER.DARKNET, {threads: threads, spawnDelay: CONSTANTS.TIME.WAIT, preventDuplicates: true}, 
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
        var server_details = ns.dnet.getServerDetails(darknet_hostname)
        //if no longer online or already authenticated or not enough charisma
        if (!server_details.isOnline || server_details.hasSession || player.skills.charisma < server_details.requiredCharismaSkill) {
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
        var result = await authenticate_server(ns, server_details, darknet_hostname)
        //if succesfull
        if (result.success == true) {
            //start worker
            await start_worker(ns, darknet_hostname)
            //not successfull
        } else if (result.code == ns.enums.DarknetResponseCode.AuthFailure) {
            //perform heartbleed for more information
            var heartbleed = await ns.dnet.heartbleed(darknet_hostname)
            //if server became unavailable
            if (heartbleed.code == ns.enums.DarknetResponseCode.ServiceUnavailable ||
                heartbleed.code == ns.enums.DarknetResponseCode.DirectConnectionRequired) {
                //next
                continue
            }
            //print message
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
    //for easy lookup
    const model = server_details.modelId
    const format = server_details.passwordFormat
    const length = server_details.passwordLength
    const data = server_details.data
    const hint = server_details.passwordHint
    //variable to fill
    var passwords = []
    //decide what to do on model
    switch (model) {
        case "ZeroLogon"://works
            return await authenticate(ns, hostname, "")

        case "Laika4"://works
        //decide on length
        switch (length) {
            case 3: return await authenticate(ns, hostname, "max")
            case 4: return await try_passwords(ns, hostname, ["spot", "fido"], "Laika4")
            case 5: return await authenticate(ns, hostname, "rover")
            case 6: return await authenticate(ns, hostname, "tigger")
            default:
                log.error(ns, ns.pid, "Uncaught length: " + length)
        }

        case "DeskMemo_3.1"://works
            return await authenticate(ns, hostname, get_password(hint, length))

        case "CloudBlare(tm)"://works
            return await authenticate(ns, hostname, extract_numbers(data))

        case "OctantVoxel"://works
            return await authenticate(ns, hostname, calculate_base(data))

        case "Pr0verFl0"://works
            return await authenticate(ns, hostname, "_".repeat(length * 2))

        case "BellaCuore"://works
            return await authenticate(ns, hostname, convert_roman_numerals(ns, hint, length))

        case "FreshInstall_1.0": //works
            return await try_default_passwords(ns, hostname, format, length)

        case "PHP 5.4"://works
            return await sort_password(ns, hostname, data, length)

        case "Factori-Os": //works
            return await find_number_divisible(ns, hostname, length)

        case "AccountsManager_4.2": //works
            return await find_number_higher_lower(ns, hostname, length)

        case "NIL": //works
            return await increment_password(ns, hostname, length)

        case "OpenWebAccessPoint": //works
            return await derive_password_from_heartbleed(ns, hostname, length)         

        case "DeepGreen":  //works
            return await mastermind_password(ns, hostname, length)


        case "buster":

        default:
            //heartbleed for more information
            var heartbleed = await ns.dnet.heartbleed(hostname)
            //log extra information
            log.error(ns, "", hostname + "-> unknown model '" + model +
                "', server details: '" + JSON.stringify(server_details) + "', heartbleed: '" + JSON
                .stringify(heartbleed) + "'", true)
            //open logs
            ns.ui.openTail()
            //stop for now
            ns.exit()
    }
    return false
}


//actual authentication
async function authenticate(ns, hostname, password) {
    //try to keep solving
    while (true) {
        //try to authenticate
        var result = await ns.dnet.authenticate(hostname, password)
        //decide what to do
        switch (result.code) {
            //successfull
            case ns.enums.DarknetResponseCode.Success:
                //log
                //log.success(ns, ns.pid, "authenticate success! : " + password, true)
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
    //open ui
    //ns.ui.openTail()
    //set index to loop
    var index = 0
    //create password
    var password = ["0","_","_"] //[].fill(0,0,length)
    //log.info(ns, ns.pid, "Starting with password: '" + password + "'", true)
    //loop
    while (true) {
        //try password
        var result = await try_passwords(ns, hostname, [password.join("")], "mastermind_password")
        //log.info(ns, ns.pid, "try_passwords: '" + JSON.stringify(result) + "'")
       
        //log.info(ns, ns.pid, "Tried password '" + password.join("") + "' -> " + JSON.stringify(result))
        //if failed
        if (result.code == ns.enums.DarknetResponseCode.AuthFailure) {
            //heartbleed for more information
            const heartbleed = await ns.dnet.heartbleed(hostname)
            //log
            log.info(ns, ns.pid, "heartbleed: " + JSON.stringify(heartbleed))
            //check if successfull
            if (heartbleed.success == true) {
                //check if we have logs (we should..)
                if (heartbleed.logs.length == 0) {
                    //go next
                    continue
                }
                //if server is restarting.. heartbleed: '{"success":true,"code":200,"message":"Success","logs":["Server restarting, terminating scripts..."]}'
                if (heartbleed.logs[0].includes("restarting")) {
                    //stop
                    return
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
                return result
            }
        //success, offline or moved
        } else {
            //return the result
            return result
        }
    }


    /*
[2026-07-24 03:42:07] WARNING	crypto::echo-anonymous-> unknown model 'DeepGreen', 
server details: '{"isOnline":true,"isConnectedToCurrentServer":true,"hasSession":false,"modelId":"DeepGreen","passwordHint":"Only a true master may pass","data":"","logTrafficInterval":20.683,"passwordLength":3,"passwordFormat":"numeric","blockedRam":1,"difficulty":4,"requiredCharismaSkill":184,"depth":1,"isStationary":false}', 
heartbleed: '{"success":true,"code":200,"message":"Success","logs":[]}'

message: Hint: 0 symbols are match exactly,  and 0 symbols match but are in the wrong place.
data: 0,0
passwordAttempted: 1
code: 401
*/
//WIP
    return {code: ns.enums.DarknetResponseCode.AuthFailure}
}


//guesses the password with yes & yesn't
async function increment_password(ns, hostname, length) {
    //create an array of the length and fill with 0's
    var password = Array(length).fill(0)
    //loop
    while (true) {
        //try to auth
        var result = await try_passwords(ns, hostname, [password.join("")], "increment_password") // authenticate(ns, hostname, password.join(""))
        //if failed
        if (result.code == ns.enums.DarknetResponseCode.AuthFailure) {
            //heartbleed for more information
            var heartbleed = await ns.dnet.heartbleed(hostname)
            
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
                var password_attempted = heartbleed_log.passwordAttempted.split("")
                //for each value
                for (let i = 0; i < feedback.length; i++) {
                    //if incorrect
                    if(feedback[i] == "yesn't") {
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
    //failsafe
    return {code: ns.enums.DarknetResponseCode.AuthFailure, success: false}

/*
    [2026-07-24 02:37:27] WARNING	48087	increment_password: '{"success":false,"code":401,"message":"Unauthorized"}' --- 
    heartbleed: '{"success":true,"code":200,"message":"Success","logs":["{\"code\":401,\"message\":\"that wasn't right\",\"data\":\"yesn't,yesn't,yesn't,yesn't,yesn't\",\"passwordAttempted\":\"00000\"}"]}'

    */
/*
[2026-07-24 01:50:33] WARNING	38089	increment_password: '{"success":false,"code":401,"message":"Unauthorized"}' --- 
heartbleed: '{"success":true,"code":200,"message":"Success","logs":["{\"code\":401,\"message\":\"that wasn't right\",\"data\":\"yesn't,yesn't,yesn't,yesn't,yesn't\",\"passwordAttempted\":\"00000\"}"]}'
*/



    /*
            [2026-07-24 12:37:05] WARNING	Anor_Londo$anonymous:2181-> unknown model 'NIL', 
            server details: '{"isOnline":true,"isConnectedToCurrentServer":true,"hasSession":false,"modelId":"NIL",
            "passwordHint":"you are one who's'nt authorized","data":"","logTrafficInterval":22.870000000000005,"passwordLength":5,"passwordFormat":"numeric","blockedRam":1,"difficulty":3,"requiredCharismaSkill":119,"depth":0,"isStationary":false}', 
            heartbleed: '{"success":true,"code":200,"message":"Success","logs":[]}'

            message: that wasn't right
data: yesn't,yesn't,yesn't,yesn't,yesn't
passwordAttempted: 55555
code: 401

message: that wasn't right
data: yes,yesn't,yesn't,yesn't,yesn't
passwordAttempted: 11111
code: 401
            */

}


/*
            message: (I'm busy browsing social media at the cafe)
data:  I think 8 with 5 is key.71196318 I think 9 with 8 is key.8028123456685952514642MMMMDLXXV524 iron_gym  byt3;t3ch:8598 598312347008qazwsx7418 I must use 8 & 9!
passwordAttempted: 0000
code: 401
*/
async function derive_password_from_heartbleed(ns, hostname, length) {
    //try a password
    var result = await try_passwords(ns, hostname, ["0".repeat(length)], "derive_password_from_heartbleed", true)
    //log
    log.info(ns, ns.pid, "derive_password_from_heartbleed (try_passwords): " + JSON.stringify(result))
    //if not succesfull
    if (result.code == ns.enums.DarknetResponseCode.AuthFailure) {
        //dummy value
        var heartbleed = { success: true }
        //keep track of loops
        var loop = 1
        //keep looping until success
        while(heartbleed.success) {
            log.info(ns, ns.pid, "try_passwords - Heartbleeding for more information")
            //heartbleed for more information
            heartbleed = await ns.dnet.heartbleed(hostname)
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
                    const regex = new RegExp(String.raw`\d{${length}}`, "g") //RegExp(String.raw`\D\d{${length}}\D`, "g")
                    //get passwords
                    const matches = heartbleed_log.data.match(regex)
                    //debug
                    log.success(ns, ns.pid, "Found '" + JSON.stringify(matches) + "' in '" + JSON.stringify(heartbleed_log.message) + "'")
                    //try passwords
                    result = await try_passwords(ns, hostname, matches, "derive_password_from_heartbleed")
                    //check for success
                    if(result.success) {
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
        }
    }
    //return result
    return result
}


//function that tries default passwords
async function try_default_passwords(ns, hostname, format, length) {
    //check the type
    if (format == "numeric") {
        var passwords = []
        passwords.push("0".repeat(length))
        var password1 = ""
        var password2 = ""
        for (let i = 0; i < length; i++) {
            password1 += i
            password2 += (i + 1)
        }
        passwords.push(password1)
        passwords.push(password2)
        log.info(ns, ns.pid, "passwords: " + JSON.stringify(passwords))
        //return the password
        return await try_passwords(ns, hostname, passwords, "try_default_passwords (numeric)")

    } else if ("alphabetic") {
        if (length == 5) {
            return await authenticate(ns, hostname, "admin")

        } else if (length == 8) {
            return await authenticate(ns, hostname, "password")
        }
    }
    //log
    log.error(ns, ns.pid, "")
    //should not happen
    return {code: ns.enums.DarknetResponseCode.AuthFailure, success: false}
}


//function that will try multiple passwords
async function try_passwords(ns, hostname, passwords, prefix = "", should_print = false) {
    log.info(ns, ns.pid, prefix + " -> try_passwords: " + passwords)
    //for each password
    for (const password of passwords) {
        //try 0's
        var result = await authenticate(ns, hostname, password)
        //check what to do
        switch (result.code) {
            //successfull
            case ns.enums.DarknetResponseCode.Success:
                //log
                log.success(ns, ns.pid, prefix + " success! : " + password, should_print)
                //server moved or went offline
            case ns.enums.DarknetResponseCode.NotFound:
            case ns.enums.DarknetResponseCode.ServiceUnavailable:
            case ns.enums.DarknetResponseCode.DirectConnectionRequired:
                //stop
                return result
        }
    }
    //nothing worked
    return {code: ns.enums.DarknetResponseCode.AuthFailure, success: false}
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
    var number = parseInt("9".repeat(length))
    var number_change = Math.ceil(number / 2)
    //try to keep solving
    while (true) {
        //try a password
        var result = await try_passwords(ns, hostname, [number],"find_number_higher_lower", false) //authenticate(ns, hostname, number)
        //
        if (result.code == ns.enums.DarknetResponseCode.AuthFailure) {
            //heartbleed for more information
            result = await ns.dnet.heartbleed(hostname)
            if (result.code == ns.enums.DarknetResponseCode.Success) {                
                //log
                log.info(ns, ns.pid, "heartbleed: '" + JSON.stringify(result) + "'")
                //check if we have logs
                const log_heartbleed_raw = result.logs[0]
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
    //failsafe
    return {code: ns.enums.DarknetResponseCode.AuthFailure, success: false}
}


async function find_number_divisible(ns, hostname, length) {
    //create values
    var passwords = []
    //2 character password, so start from 10?
    for (let i = 0; i <= 99; i++) {
        //add to list
        passwords.push(i)
    }
    //loop until found or server is offline / moved
    while (true) {
        //set default number of passwords to check, before heartbleed
        var amount = Math.max(5, passwords.length)
        //try the divisor
        var result = await try_passwords(ns, hostname, passwords.slice(0,amount), "find_number_divisible")
        //if incorrect
        if (result == ns.enums.DarknetResponseCode.AuthFailure) {
            //get heartbleed
            var heartbleed = await ns.dnet.heartbleed(hostname)
            //if successfull
            if (heartbleed.code == ns.enums.DarknetResponseCode.Success) {
                //check logs
                for (const log of heartbleed.logs) {
                    //get if divisible
                    const flag_divisible = !log.message.includes("not")
                    //get the number
                    const number = parseInt(log.message.split("'")[1]) //get the number
                    //new list
                    var passwords_new = []
                    //for each value saved
                    for (const password of passwords) {
                        //get leftover value
                        const leftover = password % number
                        //if not divisible
                        if ((flag_divisible && leftover == 0) || (!flag_divisible && leftover != 0)) {
                            //add to the list
                            passwords_new.push(password)
                        }
                    }
                    log.info(ns, ns.pid, "Current password list: " + passwords, true)
                    log.info(ns, ns.pid, "New password list: " + passwords_new, true)
                    //overwrite old list
                    passwords = passwords_new
                    
                }
            }
        //successfull, server offline or server moved
        } else {
            //stop
            return result
        }
    }
    /*
    [2026-07-24 01:09:09] WARNING	28553	Auth failed for 'gig4.org', getServerDetails: '{"isOnline":true,"isConnectedToCurrentServer":true,"hasSession":false,"modelId":"Factori-Os",
    "passwordHint":"The password is divisible by 1 ;)","data":"","logTrafficInterval":22.870000000000005,"passwordLength":2,"passwordFormat":"numeric","blockedRam":0,"difficulty":3,"requiredCharismaSkill":119,"depth":4,"isStationary":false}', heartbleed: '{"success":false,"code":351,"message":"Direct Connection Required","logs":[]}'
    [2026-07-24 01:19:47] ERROR	31248	'gig4.org'heartbleed uncaught: 'undefined' ({"success":true,"code":200,"message":"Success","logs":["{\"code\":401,\"message\":\"Password is not divisible by '99'\",\"data\":\"false\",\"passwordAttempted\":\"99\"}"]})
    */
    //WIP
    return {code: ns.enums.DarknetResponseCode.AuthFailure, success: false}
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
    log.info(ns, "", "Found numerals: '" + character_string + "' in '" + hint + "'")
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
    const s2 = data[1]
    var passwords

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
    var result = ns.scp(CONSTANTS.SCRIPT.TO_COPY.DARKNET, hostname)
    //if failed
    if (!result) {
        //log warning
        log.warning(ns, ns.pid, "Failed to copy '" + script + "' to '" + hostname + "'", true)
        //stop
        return
    }
    //get blocked ram
    var ram_blocked = ns.dnet.getBlockedRam(hostname)
    //calc ram costs: the eval worker for the darknet worker needs to scale, therefore it is not counted
    var threads_while_blocked = Math.floor((server_info.maxRam-ram_blocked) / CONSTANTS.RAM.WORKER.DARKNET)
    //calc threads for normal
    //debug
    //log.info(ns, ns.pid, hostname + " -> ram: total = " + server_info.maxRam + ", blocked: " + ram_blocked, true)
    //calc the threads while there is ram blocked
    var threads_unblocked = Math.floor(server_info.maxRam / CONSTANTS.RAM.WORKER.DARKNET)
    //set threads to default value
    var threads = threads_while_blocked
    //if it has value to unblock
    if (threads_while_blocked < threads_unblocked) {
        //log
        log.info(ns, ns.pid, "Unblocking ram for " + (threads_unblocked - threads_while_blocked) + " more threads")
        //variable for results 
        result = null
        //while still ram blocked
        while (ns.dnet.getBlockedRam(hostname) > 0.0) {
            //free ram
            result = await ns.dnet.memoryReallocation(hostname)
            //if not successfull
            if (!result.success) {
                //stop
                return
            }
            //update blocked ram
            //ram_blocked = ns.dnet.getBlockedRam(hostname)
            //wait a little bit
            await ns.sleep(CONSTANTS.TIME.WAIT)
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
    result = ns.exec(CONSTANTS.SCRIPT.WORKER.DARKNET, hostname, {
        preventDuplicates: true,
        threads: threads,
    }, hostname, threads)
    //check if not started
    if (result == false) {
        //get a message
        ns.ui.openTail()
        //debug
        log.warning(ns, ns.pid, "Failed to start worker (" + CONSTANTS.RAM.WORKER.DARKNET + " x " + threads + " = " + (CONSTANTS.RAM.WORKER.DARKNET * threads) + ") of available " + (server_info.maxRam - server_info.ramUsed) + " on '" + hostname + "' => " + JSON
            .stringify(server_info), true)
        //stop
        return
    }
    //indicate success
    log.success(ns, ns.pid, "Launched worker on '" + hostname + "'")
}


//function that open caches
function open_caches(ns, hostname_self) {
    //get files on current server
    const files_cache = ns.ls(hostname_self)
    //for each cache file found
    for (const file_name of files_cache) {
        //get the extention
        const file_extension = "." + file_name.split('.').pop()
        //depending on the extention
        switch (file_extension) {
            //if type of cache
            case CONSTANTS.FILE_EXTENSION.CACHE:
                //collect cache
                const reward = ns.dnet.openCache(file_name)
                //debug
                log.success(ns, ns.pid, "Opened cache: '" + JSON.stringify(reward) + "'")
                //stop
                break

                //if type of txt or lit
            case CONSTANTS.FILE_EXTENSION.TEXT:
            case CONSTANTS.FILE_EXTENSION.LITERATURE:
                //read file
                const file_contents = ns.read(file_name)
                //debug
                log.success(ns, ns.pid, "Found file: '" + file_name + "' => '" + file_contents + "'")

            case CONSTANTS.FILE_EXTENSION.CODING_CONTRACT:
                //TODO
                //remove the file
                ns.rm(file_name, hostname_self)
                //stop
                break

            case CONSTANTS.FILE_EXTENSION.EXECUTABLE:
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

            case CONSTANTS.FILE_EXTENSION.SCRIPT:
                //do nothing
                break

            default:
                log.error(ns, ns.pid, "Uncaught condition 'file_extension': '" + file_extension + "'")
        }
    }
}


//phish
async function phish(ns) {
    //dummy
    var result_phishing = {
        success: true
    }
    //while we can attempt
    while (result_phishing.success == true) {
        //Phishing attacks can only be run from scripts on darknet servers.
        var result_phishing = await ns.dnet.phishingAttack()
        //export type DarknetResult = { success: boolean; code: DarknetResponseCode; message: string };
        log.info(ns, ns.pid, "PhishingAttack: " + JSON.stringify(result_phishing))
        //wait a bit
        await ns.sleep(CONSTANTS.TIME.WAIT)
    }
}


//promote stock: TODO
async function promote_stock(ns) {
    //TODO: how to check which stock we own and how to communicate this?
    //var result_promote = await ns.dnet.promoteStock('" + sym + "')")
    //Spends some time spreading propaganda about a stock to increase its volatility. 
    // This does not actually change the stock's forecasts, but a savvy investor can take advantage of the chaos. 
    // The effect scales with charisma and the number of threads used, but degrades over time if left alone.
    //This function requires TIX API access. You can use purchaseTixApi to purchase it.
}


//TODO: investigate
async function investigate_lab(ns) {
    //There is more than meets the eye.
    var result_radar = await ns.dnet.labradar()
    //if success
    if (result_radar.success) {
        //debug
        log.success(ns, ns.pid, "result_radar: " + JSON.stringify(result_radar), result_report.success)
    }
    //Not all who wander are lost.
    var result_report = await ns.dnet.labreport()
    if (result_report.success) {
        //debug
        log.success(ns, ns.pid, "result_report: " + JSON.stringify(result_report), result_report.success)
    }
    return (result_radar || result_report.success) 
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


/*
2026-07-24 10:00:28] WARNING	Unknown model 'AccountsManager_4.2', server info: '{"isOnline":true,"isConnectedToCurrentServer":true,"hasSession":false,"modelId":"AccountsManager_4.2","passwordHint":"The password is a number between 0 and 100","data":"","logTrafficInterval":22.870000000000005,"passwordLength":2,"passwordFormat":"numeric","blockedRam":0,"difficulty":3,"requiredCharismaSkill":118,"depth":1,"isStationary":false}'
*/

/*
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
    */

/*
//function that tries to authenticate adjacent servers, with information provided by the orchestrator
async function authenticate_servers(ns, hostname_self) {
    //value to fill
    var darknet_servers = []
    //scan for darknet servers every time, since they might shift
    const servers_darknet_hostnames = ns.dnet.probe()
    //for each server found by scan
    for (const darknet_hostname of servers_darknet_hostnames) {
        //debug
        log.info(ns, ns.pid, "Trying to authenticate for '" + darknet_hostname + "'")
        //get server information
        var server_details = ns.dnet.getServerDetails(darknet_hostname)
        //add data to list
        darknet_servers.push({
            hostname: darknet_hostname,
            lenght: server_details.passwordLength,
            details: server_details
        })
    }
    //sort the servers: smallest password first
    darknet_servers.sort((firstItem, secondItem) => firstItem.lenght - secondItem.lenght)
    //loop over the servers
    for (const server of darknet_servers) {
        //get details
        const server_details = server.details
        const darknet_hostname = server.hostname
        //if no longer online
        if (!server_details.isOnline) {
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
        //get common passwords
        const passwords_common = get_common_passwords(ns, server_details)
        //debug
        log.info(ns, ns.pid, "Got common passwords: '" + JSON.stringify(passwords_common) + "'")
        //authenticate
        var return_code = await authenticate(ns, hostname_self, darknet_hostname, passwords_common)
        //check if common passwords failed
        if (return_code == ns.enums.DarknetResponseCode.AuthFailure) {
            //guess password
            const passwords_guessed = guess_password(ns, server_details)
            //debug
            log.info(ns, ns.pid, "Got guessed passwords: '" + JSON.stringify(passwords_common) + "'")
            //authenticate again
            return_code = await authenticate(ns, hostname_self, darknet_hostname, passwords_guessed)
            //if password is still incorrect
            if (return_code == ns.enums.DarknetResponseCode.AuthFailure) {
                //perform heartbleed for more information
                return_code = await ns.dnet.heartbleed(darknet_hostname)
                //print message
                log.warning(ns, ns.pid, "Auth failed for '" + darknet_hostname + "' with common '" +
                    passwords_common + "', guessed: '" +
                    passwords_guessed + "', and info '" + JSON.stringify(server_details) + "', heartbleed: '" +
                    JSON.stringify(return_code) + "'", true)
            }
        }
    }
}*/


/*
//function that guesses password
function guess_password(ns, server_details) {
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

            /*case "AccountsManager_4.2":
            case "Factori-Os":
            case "DeepGreen":
            case "buster":
            case "OpenWebAccessPoint":
            case "NIL":
                passwords_guessed = generate_characters(ns, length, format)
                //stop
                break //

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

        case "Pr0verFl0":
            //length of 7 bytes, overflows the array... -> return 14 characters
            passwords_guessed = ["_".repeat(length * 2)]
            //stop
            break

        case "BellaCuore":
            //check what to do
            /*if (hint.includes("Warning: password buffer is")) {
                passwords_guessed = generate_characters(ns, length, format)
            } else //
            if (hint.includes("The password is the value of the number")) {
                passwords_guessed = convert_roman_numerals(ns, hint, length)
            }
            //stop
            break

        default:
            //log extra information
            log.warning(ns, "", "Unknown model '" + model +
                "', server info: '" + JSON.stringify(server_details) + "'")
            //open logs
            ns.ui.openTail()
            //stop for now
            ns.exit()
    }
    //failsafe
    return passwords_guessed
}*/

/*
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
            var result_auth = await ns.dnet.authenticate(darknet_hostname,
                password) //cannot be eval, needs to be THIS script
            //decide what to do
            switch (result_auth.code) {
                //authentication worked
                case ns.enums.DarknetResponseCode.Success:
                    //debug
                    log.success(ns, ns.pid, "Authentication successfull with '" + darknet_hostname +
                        "' using password '" + password + "' (" + JSON.stringify(result_auth) + ")")
                    //debug
                    ns.toast("Dnet authenticated '" + darknet_hostname + "' using '" + password + "'")
                    //start worker
                    await start_worker(ns, darknet_hostname)
                    //stop
                    return result_auth.code

                    //requested failed due to instability
                case ns.enums.DarknetResponseCode.RequestTimeOut:
                    //try again
                    retry = true
                    //debug
                    log.warning(ns, ns.pid, "Request timed out: '" + JSON.stringify(result_auth) +
                        "', retrying")
                    //break
                    break

                    //password failed
                case ns.enums.DarknetResponseCode.AuthFailure:
                    //debug
                    log.warning(ns, ns.pid, "Auth failed: " + JSON.stringify(result_auth) + "'using '" +
                        password +
                        "'")
                    //wrong password, try next password
                    continue

                    //server moved / online / not usable
                case ns.enums.DarknetResponseCode.Forbidden:
                case ns.enums.DarknetResponseCode.ServiceUnavailable:
                case ns.enums.DarknetResponseCode.DirectConnectionRequired:
                case ns.enums.DarknetResponseCode.NotFound:
                case ns.enums.DarknetResponseCode.NotEnoughCharisma:
                    //debug
                    log.warning(ns, ns.pid, "Auth failed for '" + darknet_hostname + "': " + JSON.stringify(
                        result_auth) + "'using '" + password + "'")
                    //stop
                    return result_auth.code

                    //should not happen here
                case ns.enums.DarknetResponseCode.StasisLinkLimitReached:
                case ns.enums.DarknetResponseCode.NoBlockRAM:
                case ns.enums.DarknetResponseCode.PhishingFailed:
                default:
                    //should not happen, all cases should be covered
                    log.warning(ns, ns.pid, "Auth uncaught 'result_auth.code': '" + result_auth.code + "'",
                        true)
            }
            //wait a little bit
            await ns.sleep(CONSTANTS.TIME.WAIT)
        }
    }
    //indicate authentication failure
    return ns.enums.DarknetResponseCode.AuthFailure
}
*/



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
/*
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
}*/




/*
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
*/