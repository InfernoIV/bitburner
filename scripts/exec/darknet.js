import * as log from 'scripts/sub/log.js'


const script_darknet = "scripts/exec/darknet.js"
const scripts_to_copy = [script_darknet,  'scripts/sub/log.js']
const PASSWORD_NOT_FOUND = "PASSWORD_NOT_FOUND"

//TODO
//use darkweb server as controller?
//keep list of servers and passwords, which can be used to run ns.dnet.connectToSession(hostName, password)
//then run the worker scripts on those servers, get cache, etc.
//workers have small ram size to maximize threads: scan, phishingAttack and promote stock
/*
Darknet script design considerations

As you design your darknet scripts, here are some ideas to keep in mind as you decide on your approach.
The darknet is unstable, and scripts will sometimes be killed or servers will disappear.

    How can passwords be preserved so that they are not lost if the script holding them is killed?
    How can you watch for neighbor servers that have been restarted?
    How can you recover if many or all of the running scripts are killed?

The darknet is a tangled web that you cannot easily remotely traverse.

    How can you find a path to a server to connect there via terminal?
    How do you update your scripts when a new version of them is made?
    How do you get scripts into parts of the network that aren't connected to areas where you are?

There is a lot of ram on the darknet, but it is harder to access than the standard network.

    What is the best use of all that ram?
    How do you coordinate scripts using that ram when the situation changes?

The darknet is a treasure trove of data, if you know where to look.

    Some data files on darknet servers have authentication info.
    Sometimes a server will authenticate to another server, and those credentials will be visible in the server logs or active packets.
    There are lists of commonly re-used passwords that can be found on some data files.

*/

/*
freezeServer(host)
    Overloads a darknet server with feedback to lock it down. 
    Similar to status link, it will no longer move or go offline, although servers connected to it may still move. 
    However, it also loses all of its max ram, and no longer gives experience.
    This technique is sometimes used to sacrifice a new device that appears on the network to make it easier to probe it for weaknesses and develop scripts against it.
    -> can you unfreeze?

getDarknetInstability()
    Gets the current instability of the darknet caused by excessive backdoor-ing of servers.
    -> instability of backdooring normal servers?

getDepth(host)
    Gets the current depth of the specified server into the darknet. Servers immediately below Darkweb are depth 0, and each visual row in the UI below that increases the depth of the server.
    Returns -1 if the server is offline, not found, or not a darkweb server.
    -> needed?


Stasis: -> needed?
    getStasisLinkedServers(returnByIP)
        Returns the hostnames/IPs of servers that have a stasis link applied.
    
    getStasisLinkLimit()
        Returns the maximum number of stasis links that can be applied globally, based on the player's current status. 
        Stasis link limit can be increased by finding special augmentations in the deep darknet.

    setStasisLink(shouldLink)	
        Applies or removes a stasis link to the script's current server. 
        This will allow you to connectToSession() or exec() to the server remotely, even if it is not directly connected to the server a script is running on. 
        It also allows direct connection to the server via the terminal.
        Stasis links also prevent the server from going offline or moving. 
        It does not prevent other servers from moving or going offline, though, so it does not guarantee that the stasis link server will never lose connections to other servers.
        There is a maximum of stasis links that can be applied globally, which can be seen using getStasisLinkLimit(). 
        This limit can be increased by finding special augmentations in the deep darknet.

unleashStormSeed()
    Executes STORM_SEED.exe, if it is present on the server the script is running on.
    Warning: That exe file creates a webstorm that can cause catastrophic damage to the darknet. Run at your own risk.
*/

//main loop
export async function main(ns) {
    //save our own hostname
    const hostname_self = ns.args[0]
    //stop logging
    ns.disableLog("ALL")
    //loop forever
    while (true) {
        //wait until next mutation
        await ns.dnet.nextMutation()
        //try to spread
        await spread(ns)
        //build charisma
        await perform_activities(ns, hostname_self)
    }
}


//function that tries to spreak scripts across servers
async function spread(ns) {
    //scan for darknet servers every time, since they might shift
    const servers_darknet = ns.dnet.probe()
    //for each server found
    for (const hostname of servers_darknet) {
        //get player information
        const charisma_player = ns.getPlayer().skills.charisma
        //get the server details
        const server_details = ns.dnet.getServerDetails(hostname)
        //debug
        log.info(ns, "darknet", "Found darknet server '" + hostname + "' => '" + JSON.stringify(server_details) +
            "'")
        //flag to check if authenticated
        var flag_authenticated = false
        //if the server is online and connected to the current server (which is should?)
        if (server_details.hasSession) {
            //no action needed?
            flag_authenticated = true
            //check charisma? affects timing and or makes it impossible
        } else {
            //guess the password
            const password = guess_password(ns, server_details)
            // if we could not guess the password
            if (password == PASSWORD_NOT_FOUND) {
                //go to next
                continue
            }
            //try to authenticate
            const result = await ns.dnet.authenticate(server, password)
            //set the flag
            flag_authenticated = result.success //if sucessfull
            //debug
            log.info(ns, "darknet", "Authentication for '" + hostname + "' => " + JSON.stringify(result))
        }

        //if authenticated
        if (flag_authenticated) {
            //launch toward this server
            await launch(ns, hostname)
        }
    }
}


//function that tries to derive the password
function guess_password(ns, server) {
    //get the password hint
    const password_hint = server.passwordHint
    //get the password length
    const password_length = server.passwordLength
    //get the password format
    const password_format = server.passwordFormat
    //create a blank password to fill
    var password = ""
    //TODO
    /*
    switch (server.modelId) {
        case "": 
        default:
            log.info(ns, "darknet", "Uncaught model: '" + server.modelId + "'")
    }
            */

    //if no password needed
    if (password_length == 0) {
        //set password to empty
        password = ""
    } else if (password_hint == "Type the numbers to prove you are human") {
        //for each character in the data
        for (const character in server.data) {
            //check if a number
            if (character >= '0' && character <= '9') {
                //add to password
                password += character
            }
        }
    } else if (password_hint.includes("the default password")) {
        //for the lenght of the password
        for (let i = 0; i < password_length; i++) {
            //add zeroes
            password += "0"
        }
    } else if (password_hint.includes("The password is") || password_hint.includes("Remember to use") || password_hint
        .includes("It's set to")) {
        //password are the last characters of the hint
        password = password_hint.substring(password_hint.length - password_length)

    
    //check if we can heart bleed for a password
    } else if (charisma_player >= server_details.requiredCharismaSkill) {
        //try to use 
        const results =  await ns.dnet.heartbleed(hostname)
        // then check server logs for clues
        //TODO: what to do???
        password = PASSWORD_NOT_FOUND
    //no password found or not enough skill
    } else {
        //indicate failure
        return PASSWORD_NOT_FOUND
    }
    //log information
    log.info(ns, "darknet", "Guessed: '" + password + "' for '" + JSON.stringify(server) + "'")
    //return the password
    return password
}


//function that prepares and launched the script to the target server
async function launch(ns, hostname) {
    //copy scripts
    ns.scp(scripts_to_copy, hostname)
    //check if ram need to be freed
    var blocked_ram = ns.dnet.getBlockedRam(hostname)
    //if there is blocked ram
    while (blocked_ram > 0) {
        //free ram
        await ns.dnet.memoryReallocation(hostname)
        //update ram
        blocked_ram = ns.dnet.getBlockedRam(hostname)
    }
    //get server details
    const server = ns.getServer(hostname)
    //get ram cost
    const ram_cost = ns.getScriptRam(script_darknet)

    //calc threads (we assume no scripts are running)
    var threads = Math.floor(server.maxRam / ram_cost)
    //start main script
    ns.exec(script_darknet, hostname, {
        threads: threads,
        preventDuplicates: true
    }, hostname)
    //increase the chance of the server moving
    await ns.dnet.induceServerMigration(hostname)
    //log
    log.success(ns, "darknet", "Started darknet script on server '" + hostname + "'")
}


//activities that can be performed multiple times
async function perform_activities(ns, hostname_self) {
    //Spends time sending out phishing emails, attempting to find some non-technical middle manager to fall for the scam. 
    // Builds charisma. Often the attempt will fail, but success can be increased with crime success rate and charisma stats.
    //The amount of money lifted scales with the number of threads used, if successful. 
    //Very occasionally you can retrieve a cache file from the attempt.
    //Phishing attacks can only be run from scripts on darknet servers.
    var result_phishing = await ns.dnet.phishingAttack()
    //export type DarknetResult = { success: boolean; code: DarknetResponseCode; message: string };
    log.info(ns, "darknet", "PhishingAttack: " + JSON.stringify(DarknetResult))
    //get files on current server
    const files_cache = ns.ls(hostname_self, ".cache")
    //for each cache file found
    for (const file_name of files_cache) {
        //collect cache
        const reward = ns.dnet.openCache(file_name)
        //debug
        log.success(ns, "Darknet", "Opened cache: '" + JSON.stringify(reward) + "'")
    }

    //TODO: how to check which stock we own and how to communicate this?
    //var result_promote = await ns.dnet.promoteStock(sym)
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

/*
DarknetResponseCodeType type

Errors:

    DirectConnectionRequired: The target server is not directly connected to the current server. This may be caused by a user error (specifying the wrong neighbor host's hostname) or a network change (the target server was moved).

    AuthFailure: Authentication failed. The password is incorrect.

    NotFound: The API requires a specific resource (e.g., an exe file), but it does not exist on the server.

    RequestTimeOut: The request failed (though the password may or may not have been correct). Caused by network instability.

    ServiceUnavailable: The server is offline.

Signature:

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
};


*/

/*
Darknet	Found darknet server 'darknet' with details: '{
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

authenticate(host, password, additionalMsec)		Sends a network request to try to authenticate on a darknet server. The target server must be directly connected to the server that the script is running on. The speed of authentication scales with the number of threads used.
	If successful, grants the current script a session, allowing it to exec() scripts on that server, or scp() files to it. (scp() *from* the server is always allowed.)
	Note that the charisma level on a server is not a requirement for authentication, but authentication takes longer if the player's charisma is below the server's charisma level.
	Note that the session granted is only for the current script instance (by PID) - other running scripts will need to use connectToSession with the correct password to also get a session with the target server.

connectToSession(host, password)		Attempts to connect to a target darknet server that you have previously authenticated on. Unlike authenticate, connectToSession can be used to get a session on servers at any distance.
	If successful, grants the script a session, allowing it to scp() files to that target. It also allows starting scripts with exec() on that target, if the target is directly connected to the server that the script is running on, or has a backdoor or stasis link.
	If unsuccessful, more detail may be able to be gathered by using heartbleed() to look at the resulting logs on the server.
	Note that the session granted is only for the current script instance (by PID) - other running scripts will need to use connectToSession with the correct password to also get a session with the target server.

freezeServer(host)		Overloads a darknet server with feedback to lock it down. Similar to status link, it will no longer move or go offline, although servers connected to it may still move. However, it also loses all of its max ram, and no longer gives experience.
	This technique is sometimes used to sacrifice a new device that appears on the network to make it easier to probe it for weaknesses and develop scripts against it.

getBlockedRam(host)	Gets the amount of RAM blocked by the server owner's processes. This ram can be freed for use using dnet.memoryReallocation() .

getDarknetInstability()	Gets the current instability of the darknet caused by excessive backdoor-ing of servers.

getDepth(host)	Gets the current depth of the specified server into the darknet. Servers immediately below darknet are depth 0, and each visual row in the UI below that increases the depth of the server.
	Returns -1 if the server is offline, not found, or not a darknet server.

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

probe(returnByIP)		Returns a list of all darknet servers connected to the script's current server. For example, if called from a script running on home, it will return ["darknet"]. It will return an empty list if there are no darknet servers connected to the current server.
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