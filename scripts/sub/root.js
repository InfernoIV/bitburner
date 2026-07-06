import * as evaluate from 'scripts/sub/eval.js'

export async function init(ns) {
    //get the servers    
    var servers_found = await scan_servers(ns) 
    //for each server
    for (const server of servers_found){
        //if not home server
        if (server == "home") {
            continue        
        }
        //kill all scripts
        ns.killall(server)
    }
}


export async function exec(ns, servers_rooted) {
    //get the servers    
    var servers_found = await scan_servers(ns) 
    //root the servers
    await root_servers(ns, servers_found, servers_rooted)
    return servers_rooted
}

/** @param {NS} ns */
async function root_servers(ns, servers_found, servers_rooted) {
  //for each neighbour found
  for (const server of servers_found) { //await evaluate.exec(ns, "ns.scan('" + server_name + "')")") {
    //if we already did this server
    if (!servers_rooted.includes(server)) {
      //check if we can hack it
      if (await evaluate.exec(ns, "ns.getHackingLevel()") >= await evaluate.exec(ns, "ns.getServerRequiredHackingLevel('" + server + "')")) {
        //1st tool: hacking 50
        await evaluate.exec(ns, "ns.brutessh('" + server + "')")
        //2nd tool: hacking 100
        await evaluate.exec(ns, "ns.ftpcrack('" + server + "')")
        //3rd tool: hacking 250
        await evaluate.exec(ns, "ns.relaysmtp('" + server + "')")
        //4th toool: hacking 500
        await evaluate.exec(ns, "ns.httpworm('" + server + "')")
        //5th toool: hacking 750
        await evaluate.exec(ns, "ns.sqlinject('" + server + "')")
        //nuke to get root access
        if (await evaluate.exec(ns, "ns.nuke('" + server + "')")) {
          /*
          //connect to the server
          await evaluate.exec(ns, "ns.singularity.connect('" + server_name + "')")
          //connect to the actual server
          await evaluate.exec(ns, "ns.singularity.connect('" + neighbour + "')")
          //install the backdoor
          await evaluate.exec(ns, "ns.singularity.installBackdoor()")
          //connect to home, TODO: is it possible to do directly? 
          await evaluate.exec(ns, "ns.singularity.connect('" + home + "')")          
          */
          //debug           
          ns.toast("Rooted '" + server + "'")
          ns.print("Rooted '" + server + "'")
          //add to handled servers
          servers_rooted.push(server)
        }
      }
    }
  } 
}

async function scan_servers(ns) {
    //create a list of servers
    var servers_found = ["home"]
    //start scanning from home
    await scan_server(ns, servers_found, "home")
    //return the list
    return servers_found
}

async function scan_server(ns, servers_found, server_name) {
    //get neighbours
    const neighbours = await evaluate.exec(ns, "ns.scan('" + server_name + "')")
    //for each neighbour found
    for (const neighbour of neighbours) {
        //if server is not yet found
        if (!servers_found.includes(neighbour)) {
            //add server to list
            servers_found.push(neighbour)
            //start scanning from this server
            await scan_server(ns, servers_found, neighbour)
        }
    }
}

