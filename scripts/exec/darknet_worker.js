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
    //stop logging
    ns.disableLog("ALL")
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
    //get player charisma
    const charisma_player = await evaluate.exec(ns, "ns.getPlayer().skills.charisma")
    //for each server found by scan
    for (const darknet_hostname of servers_darknet_hostnames) {
        //get server information
        const server_details = await evaluate.exec(ns, "ns.dnet.getServerDetails('" + darknet_hostname + "')")
        //check if not authenticated
        if (!server_details.hasSession) {

            //send information to orchestrator
            port_information.tryWrite(JSON.stringify({
                hostname: hostname_self,
                type: CONSTANTS.MESSAGE.DARKNET.INFORMATION,
                data: {
                    target: darknet_hostname,
                    server_details: server_details,
                    heartbleed: {code:"000"}
                }
            }))

            //wait a little bit
            await ns.sleep(CONSTANTS.TIME.WAIT)

            //variable to save the password into
            var password = ""
            //ask for password
            port_information.tryWrite(JSON.stringify({
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
                        //get password
                        password = reply.password
                        //stop
                        break
                    }
                }
                //wait a bit
                await ns.sleep(CONSTANTS.TIME.WAIT)
            }
            //debug
            //log.info(ns, "Darknet_worker", "Received password response of '" + JSON.stringify(reply) + "' for '" + darknet_hostname + "'", true)
            //try to authenticate
            var result_auth = await evaluate.exec(ns, "ns.dnet.authenticate('" + darknet_hostname + "','" +
                password + "')")
            //set message type
            //var message_type = CONSTANTS.MESSAGE.DARKNET.AUTHENTICATION_FAILED
            //if successfull
            if (result_auth.success) {
                //debug
                log.success(ns, "Darknet_worker", "Authentication successfull with '" + darknet_hostname +
                    "' using password '" + password + "'", true)
                // //set type to successfull          
                //message_type = 
                //write back to port
                port_information.tryWrite(JSON.stringify({
                    hostname: hostname_self,
                    type: CONSTANTS.MESSAGE.DARKNET.AUTHENTICATED,
                    data: darknet_hostname
                }))

            } else {
                //get more information
                //check if enough charisma
                if (charisma_player >= server_details.requiredCharismaSkill) {
                    //debug
                    log.info(ns, "Darknet_worker", "Bleeding '" + darknet_hostname + "' ")
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
                        log.success(ns, "Darknet_worker", "heartbleed of '" + darknet_hostname + "': " + JSON
                            .stringify(result))
                        //send information to orchestrator
                        port_information.tryWrite(JSON.stringify({
                            hostname: hostname_self,
                            type: CONSTANTS.MESSAGE.DARKNET.INFORMATION,
                            data: {
                                target: darknet_hostname,
                                server_details: server_details,
                                heartbleed: result.logs
                            }
                        }))
                    }
                }
            }
        }
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
    log.info(ns, "darknet", "PhishingAttack: " + JSON.stringify(result_phishing))
    //get files on current server
    const files_cache = await evaluate.exec(ns, "ns.ls('" + hostname_self + "', '.cache')")
    //for each cache file found
    for (const file_name of files_cache) {
        //collect cache
        const reward = await evaluate.exec(ns, "ns.dnet.openCache('" + file_name + "')")
        //debug
        log.success(ns, "Darknet", "Opened cache: '" + JSON.stringify(reward) + "'", true)
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
        log.success(ns, "darknet", "result_radar: " + JSON.stringify(result_radar), true)
    }

    //Not all who wander are lost.
    var result_report = await ns.dnet.labreport()
    if (result_report.success) {
        //debug
        log.success(ns, "darknet", "result_report: " + JSON.stringify(result_report), true)
    }
}