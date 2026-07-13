//requires no SF?
//https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.cloud.md

import * as evaluate from 'scripts/sub/eval.js'
import * as log from 'scripts/sub/log.js'


//variables that are set once
var server_max_amount
var server_max_ram
var server_cost_purchase

//map of servers owned (key = hostname, value = ram)
var servers_owned = new Map()

//keep track of the lowest ram (to speed up scripts)
var ram_lowest = 0


//function that gets all information, which only is done once
export async function init(ns) {
    //get information, only done once
    //get the max amount of servers that can be owned
    server_max_amount = await evaluate.exec(ns, "ns.cloud.getServerLimit()")
    //get the max ram of a server
    server_max_ram = await evaluate.exec(ns, "ns.cloud.getRamLimit()")
    //log information
    log.info(ns, "Cloud", "Max of '" + server_max_amount + "' cloud servers, max of '" + server_max_ram + "' ram")

    //empty the map of owned servers
    servers_owned = new Map()
    //check for existing servers
    const servers = await evaluate.exec(ns, "ns.cloud.getServerNames()")
    //check each server
    for (const server of servers) {
        //get the ram
        const ram = await evaluate.exec(ns, "ns.getServerMaxRam('" + server + "')")
        //add to map
        servers_owned.set(server, ram)
        //log information
        log.info(ns, "Cloud", "Found cloud server '" + server + "' with '" + ram + "' ram")
    }
}


//function that manages the cloud servers (buying and upgrading)
export async function manage_servers(ns) {
    //check if we need to upgrade at all
    if (ram_lowest < server_max_ram) {
        //try to upgrade the server
        for (const [server, ram] in servers_owned) {
            //check if we need to upgrade at all
            if (ram < server_max_ram) {
                //just try to upgrade
                var upgraded = await evaluate.exec(ns, "ns.cloud.upgradeServer('" + server + "'," +  ram * 2 + ")")
                //if successfull
                if (upgraded) {
                    //update thes map
                    servers_owned.set(server, ram * 2)
                    //log
                    log.success(ns, "Cloud", "Upgraded '" + server + "' to '" + ram * 2 + "' ram")
                    //try to update the lowest ram
                    var server_ram = servers_owned.values
                    //sort on lowest first
                    server_ram.sort((a, b) => a.value - b.value)
                    //set the lowest ram to the first entry (which should be the lowest)
                    ram_lowest = server_ram[0]
                    //if ram has been maxxed (and all servers bought)
                    if (ram_lowest == server_max_ram && servers_owned.size == server_max_amount) {
                        //log
                        log.success(ns, "Cloud", "Maximized ram of all cloud servers (" + Format.ram(server_max_ram) + ")", true)
                    }
                }
            }
        }
    }
    //if we can still buy servers
    if (servers_owned.size < server_max_amount) {
        //hostname of servers
        const hostname = "cloud-"
        //base ram to start with, set to 2 since the Hack, grow, weaken scripts require 1.75 GB
        const base_ram = 2
        //try to buy new server
        var name = await evaluate.exec(ns, "ns.cloud.purchaseServer('" + hostname + "'," + base_ram + ")")
        //check if successfull
        if (name != "") {
            //add to the local list
            servers_owned.set(name, base_ram)
            //log
            log.success(ns, "Cloud", "Bought '" + name + "' with '" + base_ram + "' ram")
            //if all servers bought)
            if (servers_owned.size == server_max_amount) {
                //log
                log.success(ns, "Bought all cloud servers (" + server_max_amount + ")", true)
            }
            //update lowest ram
            ram_lowest = base_ram            
        }
    }
}


//function that returns the cloud servers
export function get_servers(){
    //return the server map
    return servers_owned
}


/*
getRamLimit()                       0.05    Returns the maximum RAM that a cloud server can have.
getServerLimit()                    0.05    Returns the maximum number of cloud servers you can purchase.
getServerCost(ram)                  0.25    Get cost of purchasing a cloud server.

getServerUpgradeCost(host, ram)     0.1     Get cost of upgrading a cloud server to the given RAM.
purchaseServer(hostname, ram)       2.25    Purchase a cloud server.
upgradeServer(host, ram)            0.25    Upgrade a cloud server's RAM.

renameServer(hostname, newName)     0       Rename a cloud server.
getServerNames(returnOpts)          1.05    Returns an array with the hostnames or IP addresses of all of the cloud servers you have purchased. Returns hostnames by default.
deleteServer(host)                  2.25    Delete a cloud server.
*/
