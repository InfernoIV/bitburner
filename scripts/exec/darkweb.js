import * as evaluate from 'scripts/sub/evaluate.js'
import * as log from 'scripts/sub/log.js'
//do we need to copy these as well?

const server_darkweb = "darkweb"
const script_darkweb = "scripts/exec/darkweb.js"
const scripts_to_copy = [script_darkweb, 'scripts/sub/evaluate.js', 'scripts/sub/log.js', "scripts/manage_eval.js", "scripts/run_eval.js"]


//main loop
export async function main(ns) {
    //stop logging
    ns.disableLog("ALL")
    //loop forever
    while (true) {
        //scan for darknet servers
        const servers_darknet = ns.dnet.probe() //await evaluate.exec(ns, "ns.dnet.probe() ")
        //log information
        //log.info(ns, "Darknet", "Scanning for darknet servers: '" + JSON.stringify(servers_darknet) + "'")
        //for each server found
        for (const server of servers_darknet) {
            //debug
            log.info(ns, "Darknet", "Found darknet server '" + server + "' => '" + JSON.stringify(servers_darknet) + "'", true)
            //check if applicable            
            //get the server details
            const server_details = ns.dnet.getServerDetails(server) //await evaluate.exec(ns, "ns.dnet.getServerDetails('" + server + "')")
            //if we can hack it
            if (server_details.requiredCharismaSkill) {
                //guess the password
                const password = guess_password(ns, server_details)
                // if we could guess the password
                if (password != "NO PASSWORD FOUND") {
                    //try to authenticate
                    const authenticated = await ns.dnet.authenticate(server, password) //await evaluate.exec(ns, "ns.dnet.authenticate('" + server + "','" + password + "')")
                    //if sucessfull
                    if (authenticated) {
                        //debug
                        log.info(ns, "Darknet", "Authenticated to darknet server '" + server + "' with password '" + password + "'")
                        //copy scripts
                        for (const script of scripts_to_copy) {
                            //copy script
                            ns.scp(script, server) //await evaluate.exec(ns, "ns.scp('" + script + "','" + server + "')")
                        }
                        //start main script
                        ns.exec(script_darkweb, server)
                        //log
                        log.success(ns, "Darknet", "Started darknet script on server '" + server + "'")

                    } else {
                        //debug
                        log.info(ns, "Darknet", "Failed to authenticate to darknet server '" + server + "' with password '" + password + "' => '" + + JSON.stringify(servers_darknet) + "'")
                    }
                } else {
                    //debug
                    log.warning(ns, "Darknet", "Could not guess password for darknet server '" + server + "' => '" + + JSON.stringify(servers_darknet) + "'")
                }
            }
        }
        //wait until next mutation
        await ns.dnet.nextMutation() //ns.sleep(1000) 
        //evaluate.exec(ns, "")
    }
}


function guess_password(ns, server) {
    //get the password hint
    const password_hint = server.passwordHint
    //get the password length
    const password_length = server.passwordLength

    if (password_length == 0) {
        log.info(ns, "Darknet", "Server '" + server + "' has no password, no need to guess")
        return ""
    } else if (password_hint == "") {
        //TODO
    }
    return "NO PASSWORD FOUND"
}

/*
Darknet	Found darknet server 'darkweb' with details: '{
	"isOnline":true,
	"isConnectedToCurrentServer":true,
	"hasSession":true,
	"modelId":"ZeroLogon",
	"passwordHint":"There is no password",
	"data":"",
	"logTrafficInterval":31,
	"passwordLength":0,
	"passwordFormat":"numeric",
	"blockedRam":0,
	"difficulty":0,
	"requiredCharismaSkill":1,
	"depth":-1,
	"isStationary":true
}'
*/


/*
Darknet					Darknet API
DarknetFormulas			Darknet formulas
DarknetInstability		Instability of the darknet caused by excessive backdoor-ing of servers.
DarknetServerDetails	Details about a darknet server

https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.darknet.md

authenticate(host, password, additionalMsec)		Sends a network request to try to authenticate on a darkweb server. The target server must be directly connected to the server that the script is running on. The speed of authentication scales with the number of threads used.
	If successful, grants the current script a session, allowing it to exec() scripts on that server, or scp() files to it. (scp() *from* the server is always allowed.)
	Note that the charisma level on a server is not a requirement for authentication, but authentication takes longer if the player's charisma is below the server's charisma level.
	Note that the session granted is only for the current script instance (by PID) - other running scripts will need to use connectToSession with the correct password to also get a session with the target server.

connectToSession(host, password)		Attempts to connect to a target darkweb server that you have previously authenticated on. Unlike authenticate, connectToSession can be used to get a session on servers at any distance.
	If successful, grants the script a session, allowing it to scp() files to that target. It also allows starting scripts with exec() on that target, if the target is directly connected to the server that the script is running on, or has a backdoor or stasis link.
	If unsuccessful, more detail may be able to be gathered by using heartbleed() to look at the resulting logs on the server.
	Note that the session granted is only for the current script instance (by PID) - other running scripts will need to use connectToSession with the correct password to also get a session with the target server.

freezeServer(host)		Overloads a darknet server with feedback to lock it down. Similar to status link, it will no longer move or go offline, although servers connected to it may still move. However, it also loses all of its max ram, and no longer gives experience.
	This technique is sometimes used to sacrifice a new device that appears on the network to make it easier to probe it for weaknesses and develop scripts against it.

getBlockedRam(host)	Gets the amount of RAM blocked by the server owner's processes. This ram can be freed for use using dnet.memoryReallocation() .

getDarknetInstability()	Gets the current instability of the darknet caused by excessive backdoor-ing of servers.

getDepth(host)	Gets the current depth of the specified server into the darknet. Servers immediately below Darkweb are depth 0, and each visual row in the UI below that increases the depth of the server.
	Returns -1 if the server is offline, not found, or not a darkweb server.

getServerDetails(host)		Returns the darknet-specific details of the server.
	If the darknet server has recently gone offline, the returned object will be a dummy server object with isOnline: false.

getServerRequiredCharismaLevel(host)		Gets the required charisma level to target the server with dnet.heartbleed().
	Insufficient charisma will also cause authentication to take much longer - or, in certain servers deep in the darknet, be impossible.

getStasisLinkedServers(returnByIP)		Returns the hostnames/IPs of servers that have a stasis link applied.

getStasisLinkLimit()		Returns the maximum number of stasis links that can be applied globally, based on the player's current status. Stasis link limit can be increased by finding special augmentations in the deep darknet.

heartbleed(host, options)	Uses an exploit to extract log data from a server by sending a malformed heartbeat request. Retrieves the most recent logs on the server. This can be used to get more feedback on authentication attempts. The retrieved logs are removed from the server, unless the "peek" flag is set to true in the provided HeartbleedOptions.
	Servers will periodically produce logs themselves, as well, which sometimes are useful, but most times are not.
	The speed of capture scales with the number of threads used. See formulas.dnet.getHeartbleedTime for more information. Note that you cannot scrape logs from servers whose required charisma is higher than your charisma level.

induceServerMigration(host)		Increases the chance that the target server will move to other parts of the darknet, by overloading the connections between it and the current server. The target must be a connected, non-stationary, darknet server - scripts cannot target the server they are running on.
	Effect scales with threads and charisma level.

isDarknetServer(host)		Returns whether the server is a darknet server.
	Returns false if the server does not exist or has gone offline recently. This function does not require DarkscapeNavigator.exe.

labradar()		There is more than meets the eye.

labreport()		Not all who wander are lost.

memoryReallocation(host)		Spends some time freeing some of the RAM currently blocked by the server owner. Must target an authenticated and directly connected server.
	The amount of ram recovered scales with charisma and the number of threads used.

nextMutation()		Sleep until the next mutation of the network of darknet servers (which occur frequently). Note that in the majority of cases, whatever changed out on the net (if anything) will not be nearby to, or visible from, the current server.
	Some possible mutations that can occur somewhere on the darknet each cycle:
		Nothing changes.
		Some servers move to other locations on the net, breaking existing connections and forming new ones.
		Some servers go offline, which in many cases is permanent - they are effectively deleted.
		Some servers restart, which kills all running scripts on the server.
		New servers appear on the net (which may be previously offline servers, but cleaned and with a new password).

openCache(filename, suppressToast)		Opens a .cache file on the current server to acquire its valuable contents.

phishingAttack()		Spends time sending out phishing emails, attempting to find some non-technical middle manager to fall for the scam. Builds charisma. Often the attempt will fail, but success can be increased with crime success rate and charisma stats.
	The amount of money lifted scales with the number of threads used, if successful. Very occasionally you can retrieve a cache file from the attempt.
	Phishing attacks can only be run from scripts on darknet servers.

probe(returnByIP)		Returns a list of all darknet servers connected to the script's current server. For example, if called from a script running on home, it will return ["darkweb"]. It will return an empty list if there are no darknet servers connected to the current server.
	Note that there is no guarantee about the order of servers in the returned list.

promoteStock(sym)		Spends some time spreading propaganda about a stock to increase its volatility. This does not actually change the stock's forecasts, but a savvy investor can take advantage of the chaos. The effect scales with charisma and the number of threads used, but degrades over time if left alone.

setStasisLink(shouldLink)		Applies or removes a stasis link to the script's current server. This will allow you to connectToSession() or exec() to the server remotely, even if it is not directly connected to the server a script is running on. It also allows direct connection to the server via the terminal.
	Stasis links also prevent the server from going offline or moving. It does not prevent other servers from moving or going offline, though, so it does not guarantee that the stasis link server will never lose connections to other servers.
	There is a maximum of stasis links that can be applied globally, which can be seen using getStasisLinkLimit(). This limit can be increased by finding special augmentations in the deep darknet.

unleashStormSeed()		Executes STORM_SEED.exe, if it is present on the server the script is running on.
	Warning: That exe file creates a webstorm that can cause catastrophic damage to the darknet. Run at your own risk.

https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.darknetinstability.md

DarknetInstability interface	Instability of the darknet caused by excessive backdoor-ing of servers.

authenticationDurationMultiplier		number		The increase in time that authentication takes, as a decimal
authenticationTimeoutChance				number		The chance that authentication will time out instead of resolving, as a decimal


DarknetServerDetails interface		Details about a darknet server

blockedRam						number		The amount of ram blocked by the server owner
data							string		Data from the passwordHint, if any.
depth							number		The current depth in the darknet of the server
difficulty						number		The difficulty rating of the server, associated with its original depth in the net
hasSession						boolean		True if the current script has authenticated to this server with the right password using authenticate() or connectToSesssion()
isConnectedToCurrentServer		boolean		True if the server is directly connected to the current server
isStationary					boolean		If this darknet server cannot be moved. True for fixed/story servers.
logTrafficInterval				number		The frequency (in seconds) of the server adding its own messages to its logs, visible with heartBleed().
modelId							string		The model of the server. Similar models have similar vulnerabilities. The model list is intentionally undocumented. You are supposed to experiment and discover the models.
passwordFormat					"numeric" | "alphabetic" | "alphanumeric" | "ASCII" | "unicode"		The character set used in the password
passwordHint					string		Static password reminder text set for this server.
passwordLength					number		The number of characters in the password
requiredCharismaSkill			number		The charisma skill required to authenticate on the server



*/