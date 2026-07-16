import { port_darknet_information, port_darknet_password, port_darknes_servers_done, ram_darknet_worker } from "scripts/constants.js"
import * as log from 'scripts/sub/log.js'
import * as evaluate from 'scripts/sub/evaluate.js'

/*
ns.dnet.probe()             0.2 GB
ns.dnet.heartbleed()        0.6 GB
ns.dnet.authenticate()      0.4 GB
--
ns.dnet.phishingAttack()    2 GB
ns.dnet.openCache()         2 GB
ns.dnet.promoteStock()      2 GB
???
ns.dnet.labradar()          0 GB
ns.dnet.labreport()         0 GB
*/

/*
export port_darknet_information = 3 //information send from workers to the orchestrator
export const port_darknet_password = 4 //map of servers and passwords, filled from orchestrator
export const port_darknes_servers_done = 5 //list of servers that are authenticated, filled by workers, edited by orchestrator
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
    //create port object for replies
    var port_password = ns.getPortHandle(port_darknet_password)
    //init eval
    evaluate.init(ns, hostname_self, ram_darknet_worker, true, max_ram)
    //endless work
    while (true) {
        //scan servers
        var servers_found = await scan_servers(ns)
        //authenticate servers
        await authenticate_servers(ns, servers_found)
        //phish
        await perform_activities(ns)
        //wait a bit
        await ns.sleep(5)
    }
}
            

//function that scan servers and provides information back to the orchestrator
async function scan_servers(ns) {
    //scan for darknet servers every time, since they might shift
    const servers_darknet_hostnames = await evaluate.exec(ns, "ns.dnet.probe()")
    //create port object
    var port = ns.getPortHandle(port_darknet_information)
    //for each server found
    for (const server_darknet_hostname of servers_darknet_hostnames) {
        //heartbleed the server for information
        //Uses an exploit to extract log data from a server by sending a malformed heartbeat request. 
        //Retrieves the most recent logs on the server. 
        //This can be used to get more feedback on authentication attempts. 
        //The retrieved logs are removed from the server, unless the "peek" flag is set to true in the provided HeartbleedOptions.
        //Servers will periodically produce logs themselves, as well, which sometimes are useful, but most times are not.
        //The speed of capture scales with the number of threads used. 
        //See formulas.dnet.getHeartbleedTime for more information. 
        //Note that you cannot scrape logs from servers whose required charisma is higher than your charisma level.
        //get heartbleed information

        const result, logs = await evaluate.exec(ns, "ns.dnet.heartbleed('" + server_darknet_hostname + "')") //: HeartbleedOptions): Promise<DarknetResult & { logs: string[] }>;
        //export type DarknetResult = { success: boolean; code: DarknetResponseCode; message: string };
        //if there is an message
        if (result.message != "") {
            //log it
            log.info(ns, "Darknet", "heartbleed of '" + server_darknet_hostname + "': '" + result.message + "'")
        }
        /*
        type DarknetResponseCodeType = {
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
}; */

        //provide input to orchestrator (darknet server information can be accessed remotely)
        port.tryWrite(JSON.stringify({
            hostname: server_darknet_hostname,
            result: result,
            logs: logs
        }))
    }
    //return the list of servers
    return servers_darknet_hostnames
}


//function that tries to authenticate adjacent servers, with information provided by the orchestrator
async function authenticate_servers(ns, servers_found) {
    //get server and password information from port
    
    //port_darknet_information, port_darknet_password, port_darknes_servers_done
    var port_servers_done = ns.getPortHandle(port_darknes_servers_done)
    //check which servers are already authenticated (managed by workers, shared on port)
    const servers_authenticated = JSON.parse(port_servers_done.peek())
    //for each server found by scan
    for (const darknet_hostname of servers_found) {
        //if already authenticated
        if(servers_authenticated.includes(darknet_hostname)){
            //go to next
            continue
        }
        //get saved password
        const password_map = JSON.parse(ns.getPortHandle(port_darknet_password).peek())
        //if server in map
        if (password_map.has(darknet_hostname)) {
            //get the password
            const password = password_map.get(darknet_hostname)
            //try to authenticate
            var result = await evaluate.exec("ns.dnet.authenticate('" + darknet_hostname + "','" + password + "')")
            //if successfull
            if (result.success) {
                //get the results
                var servers_authenticated_new = JSON.parse(port_servers_done.read())
                //add the hostname
                servers_authenticated_new.set(darknet_hostname, "")
                //write back to port
                port_servers_done.tryWrite(JSON.stringify(servers_authenticated_new))
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
    log.info(ns, "darknet", "PhishingAttack: " + JSON.stringify(DarknetResult))
    //get files on current server
    const files_cache = await evaluate.exec(ns, "ns.ls('" + hostname_self + "', '.cache')")
    //for each cache file found
    for (const file_name of files_cache) {
        //collect cache
        const reward = await evaluate.exec(ns, "ns.dnet.openCache('" + file_name + "')")
        //debug
        log.success(ns, "Darknet", "Opened cache: '" + JSON.stringify(reward) + "'")
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
    //debug
    log.info(ns, "darknet", "result_radar: " + JSON.stringify(result_radar))
    //Not all who wander are lost.
    var result_report = await ns.dnet.labreport()
    //debug
    log.info(ns, "darknet", "result_report: " + JSON.stringify(result_report))
}
