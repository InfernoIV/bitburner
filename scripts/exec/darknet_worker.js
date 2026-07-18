import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"
import * as evaluate from "scripts/sub/evaluate.js"

/*
base                        1.6
ns.dnet.probe()             0.2 GB
ns.dnet.heartbleed()        0.6 GB
ns.dnet.authenticate()      0.4 GB

ns.dnet.phishingAttack()    2 GB + 1.6 = 3.6
ns.dnet.openCache()         2 GB
ns.dnet.promoteStock()      2 GB

???
ns.dnet.labradar()          0 GB
ns.dnet.labreport()         0 GB
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
    //port for sending questions
    const port_information = ns.getPortHandle(CONSTANTS.PORT.DARKNET.INFORMATION)
    //port for checking answers
    const port_password = ns.getPortHandle(CONSTANTS.PORT.DARKNET.PASSWORD)

    //scan for darknet servers every time, since they might shift
    const servers_darknet_hostnames = await evaluate.exec(ns, "ns.dnet.probe()")



    //for each server found by scan
    for (const darknet_hostname of servers_darknet_hostnames) {
        //get server information
        //get server information
        const server_info = await evaluate.exec(ns, "ns.getServer('" + darknet_hostname + "')")
        //if already running something
        if (server_info.ramUsed >= (CONSTANTS.RAM.DARKNET.WORKER + CONSTANTS.RAM.EVAL_ORCHESTRATOR)) {
            //log
            log.info(ns, ns.pid, "Host '" + darknet_hostname +
                "' is already running a worker!: " + JSON.stringify(server_info))
            //no need to do anything: next
            continue
        }
        //get server information
        const server_details = await evaluate.exec(ns, "ns.dnet.getServerDetails('" + darknet_hostname + "')")
        //send information to orchestrator
        await send_information(ns, port_information, hostname_self, darknet_hostname, server_details)
        //wait a little bit
        await ns.sleep(CONSTANTS.TIME.WAIT)
        //ask for password
        const passwords = await ask_for_passwords(ns, port_information, port_password, hostname_self,
            darknet_hostname)
        //check if we have a password
        if (passwords != null || passwords.length > 0) {
            //authenticate
            await authenticate(ns, port_information, hostname_self, darknet_hostname, passwords)
        }
    }
}


async function ask_for_passwords(ns, port_information, port_password, hostname_self, darknet_hostname) {
    //ask for password
    await port_information.tryWrite(JSON.stringify({
        hostname: hostname_self,
        type: CONSTANTS.MESSAGE.DARKNET.PASSWORD_REQUEST,
        data: darknet_hostname
    }))
    //debug
    //log.info(ns, "Darknet_worker", "Sent password request", true)
    //wait for answer
    while (true) {
        //read the data
        var reply = port_password.peek()
        //if there is data
        if (reply != CONSTANTS.PORT.NO_DATA) {
            //format reply
            reply = JSON.parse(reply)
            //check if we are the recipient
            if (hostname_self == reply.worker) {
                //debug
                //log.info(ns, ns.pid, "password reply: '" + JSON.stringify(reply) + "'", true)
                //remove message
                port_password.read()
                //return the passwords
                return reply.password
            }
        }
        //wait a bit
        await ns.sleep(CONSTANTS.TIME.WAIT)
    }
}


//function to gathers and sends information to orchestrator
async function send_information(ns, port_information, hostname_self, darknet_hostname, server_details) {
    //get player charisma
    const charisma_player = await evaluate.exec(ns, "ns.getPlayer().skills.charisma")
    //variable for heartbleed
    var heartbleed = {
        //filler
        code: "000"
    }
    //get more information
    //check if enough charisma for heartbleed
    if (charisma_player >= server_details.requiredCharismaSkill) {
        //debug
        //log.info(ns, ns.pid, "Bleeding '" + darknet_hostname + "' ")
        //heartbleed the server for information
        //Uses an exploit to extract log data from a server by sending a malformed heartbeat request. 
        //Retrieves the most recent logs on the server. 
        //This can be used to get more feedback on authentication attempts. 
        //The retrieved logs are removed from the server, unless the "peek" flag is set to true in the provided HeartbleedOptions.
        //Servers will periodically produce logs themselves, as well, which sometimes are useful, but most times are not.
        //The speed of capture scales with the number of threads used. 
        var result = await evaluate.exec(ns, "ns.dnet.heartbleed('" + darknet_hostname +
            "')") //: HeartbleedOptions): Promise<DarknetResult & { logs: string[] }>;
        //if successfull
        if (result.success) {
            //debug
            log.success(ns, ns.pid, "heartbleed of '" + darknet_hostname + "': " + JSON
                .stringify(result))
            //update heartbleed
            heartbleed = result.logs
        }
    }
    //send information to orchestrator
    await port_information.tryWrite(JSON.stringify({
        hostname: hostname_self,
        type: CONSTANTS.MESSAGE.DARKNET.INFORMATION,
        data: {
            target: darknet_hostname,
            server_details: server_details,
            heartbleed: heartbleed
        }
    }))
}

async function authenticate(ns, port_information, hostname_self, darknet_hostname, passwords) {
    //for each password
    for (const password of passwords) {
        //try to authenticate
        var result_auth = await ns.dnet.authenticate(darknet_hostname, password)
        //if successfull
        if (result_auth.success) {
            //debug
            log.success(ns, ns.pid, "Authentication successfull with '" + darknet_hostname +
                "' using password '" + password + "'", true)
            //send success message
            await port_information.tryWrite(JSON.stringify({
                hostname: hostname_self,
                type: CONSTANTS.MESSAGE.DARKNET.AUTHENTICATED,
                data: darknet_hostname,
                password: password,
            }))
            //start worker
            await start_worker(ns, darknet_hostname)
            //exit function
            return
        }
    }
    //not sucessfull
    //send failure message
    await port_information.tryWrite(JSON.stringify({
        hostname: hostname_self,
        type: CONSTANTS.MESSAGE.DARKNET.AUTHENTICATION_FAILED,
        data: darknet_hostname,
        pid: ns.pid,
    }))
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
    log.info(ns, ns.pid, "server '" + hostname + "' starting: " + JSON.stringify(server_info))
    //if still online / connected
    if (server_info.isOnline) { //} && server_info.isConnectedToCurrentServer) {
        //calc ram costs
        //darkweb server:
        //worker + eval + eval worker
        //the eval worker for the darknet worker needs to scale, therefore it is not counted
        const max_ram_eval_worker = server_info.maxRam - CONSTANTS.RAM.DARKNET.WORKER - CONSTANTS.RAM
            .EVAL_ORCHESTRATOR

        //kill scripts on target server
        //await evaluate.exec(ns, "ns.killall('" + hostname + "')")
        await ns.killall(hostname)

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
            ns.alert(ns, ns.pid, "Failed to start worker on '" + hostname + "' => " + JSON
                .stringify(server_info))
        }
        //indicate success
        log.success(ns, ns.pid, "Launched worker on '" + hostname + "'")
    }
}


//activities that can be performed multiple times, but only by self
async function perform_activities(ns, hostname_self) {
    //Spends time sending out phishing emails, attempting to find some non-technical middle manager to fall for the scam. 
    // Builds charisma. Often the attempt will fail, but success can be increased with crime success rate and charisma stats.
    //The amount of money lifted scales with the number of threads used, if successful. 
    //Very occasionally you can retrieve a cache file from the attempt.
    //Phishing attacks can only be run from scripts on darknet servers.
    var result_phishing = await evaluate.exec(ns, "ns.dnet.phishingAttack()")
    //export type DarknetResult = { success: boolean; code: DarknetResponseCode; message: string };
    log.info(ns, ns.pid, "PhishingAttack: " + JSON.stringify(result_phishing))
    //get files on current server
    const files_cache = await evaluate.exec(ns, "ns.ls('" + hostname_self + "')") //, '.cache')")
    //for each cache file found
    for (const file_name of files_cache) {
        //get the extention
        const file_extension = file_name.split('.').pop()
        //depending on the extention
        switch (file_extension) {
            case CONSTANTS.FILE_EXTENSION.CACHE:
                //collect cache
                const reward = await evaluate.exec(ns, "ns.dnet.openCache('" + file_name + "')")
                //debug
                log.success(ns, ns.pid, "Opened cache: '" + JSON.stringify(reward) + "'", true)
                //stop
                break
            case CONSTANTS.FILE_EXTENSION.TEXT:
            case CONSTANTS.FILE_EXTENSION.LITERATURE:
                //read file
                const file_contents = await evaluate.exec(ns, "ns.read('" + file_name + "')")
                //debug
                log.success(ns, ns.pid, "Found file: '" + file_name + "' => '" + file_contents + "'", true)
                //send success message
                await port_information.tryWrite(JSON.stringify({
                    hostname: hostname_self,
                    type: CONSTANTS.MESSAGE.DARKNET.FILE,
                    data: file_contents,
                    file_name: file_name,
                }))
                //remove the file
                await evaluate.exec(ns, "ns.rm('" + file_name + "','" + hostname_self + "')")
                //stop
                break
            case CONSTANTS.FILE_EXTENSION.EXECUTABLE:
                //what to do?
                log.warning(ns, ns.pid, "Found executable '" + file_extension + "'")
                //stop
                break
            default:
                log.error(ns, ns.pid, "Uncaught condition 'file_extension': '" + file_extension + "'")
        }

        //if type of cache
        //if type of txt or lit

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