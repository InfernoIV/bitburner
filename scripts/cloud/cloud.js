//config
import { DISABLE_LOGGING, MONEY_MIN, RAM_BASE } from "./config.js"


//constants
import { SERVERS_AMOUNT_MAX, SERVER_RAM_MAX } from "./constants.js"
import { SERVER } from "scripts/constants/servers.js"


//functions
import * as log from "scripts/util/log.js"
import { scan_servers } from "scripts/root/root.js"


// Declaration
export class cloud_obj {
    constructor() {}


    //init
    init(ns, handles) {
        //disable logging
        log.disable(ns, DISABLE_LOGGING)                
        //map of servers owned
        this.servers_owned = new Map()
        //letiables that are set once
        this.server_max_amount = SERVERS_AMOUNT_MAX //* currentNodeMults.CloudServerLimit
        this.server_max_ram = SERVER_RAM_MAX //* currentNodeMults.CloudServerMaxRam
        //keep track of the lowest ram (to speed up scripts)
        this.ram_lowest = this.server_max_ram        
        //check for existing servers
        let servers = get_cloud_servers(ns) //ns.cloud.getServerNames()
        //check each server
        for (const server of servers) {
            //get the ram
            const ram = ns.getServer(server).maxRam
            //add to map
            this.servers_owned.set(server, ram)
            //update lowest ram
            if (ram < this.ram_lowest) {
                //update
                this.ram_lowest = ram
            }            
        }
        //re-set lowest ram if no servers are found
        if (this.servers_owned.size == 0) {
            //set to 0
            this.ram_lowest = 0
        }
        //log
        log.info(ns, "Cloud", "Init complete, have " + this.servers_owned.size + " cloud servers, min ram: " + this.ram_lowest, true )
    }


    //buy and/or upgrade servers
    manage(ns, handles) {
        //min money to upgrade
        const money_min = MONEY_MIN
        //get player
        const player = ns.getPlayer()
        //check if we have enough money
        if (player.money >= money_min) {
            //check if we need to upgrade at all
            if (this.ram_lowest < this.server_max_ram) {
                //upgrade ram
                this.upgrade_ram(ns)
                //upgrade cores?
            }
            //if we can still buy servers
            if (this.servers_owned.size < this.server_max_amount) {
                //buy servers
                this.purchase_servers(ns)
            }
        }

    }


    //upgrade the ram of the server
    upgrade_ram(ns) {
        //try to upgrade the server
        for (let [server, ram] of this.servers_owned) {
            //check if we need to upgrade at all
            while (ram < this.server_max_ram) {
                //just try to upgrade
                let upgraded = ns.cloud.upgradeServer(server, ram * 2)
                //if successfull
                if (upgraded) {
                    //update the ram letiable
                    ram = ram * 2
                    //update the map
                    this.servers_owned.set(server, ram)
                    //log
                    log.success(ns, "Cloud", "Upgraded '" + server + "' to '" + ram * 2 + "' ram")
                    //toast
                    ns.toast("Upgraded '" + server + "' to '" + ram * 2 + "' ram")
                    //sort
                    this.servers_owned = new Map([...this.servers_owned].sort((a, b) => a[0].localeCompare(b[0])))
                    //set the lowest ram to the first entry (which should be the lowest)
                    this.ram_lowest = [...this.servers_owned][0]
                    //if ram has been maxxed (and all servers bought)
                    if (this.ram_lowest == this.server_max_ram && this.servers_owned.size == this
                        .server_max_amount) {
                        //log
                        /*log.success(ns, "Cloud", "Maximized ram of all cloud servers (" + format.ram(
                            server_max_ram) + ")", true)
                        //toast
                        ns.toast("Maximized ram of all cloud servers (" + Format.ram(server_max_ram) + ")")*/
                    }
                } else {
                    //stop
                    break
                }
            }
        }
    }


    //buy new servers
    purchase_servers(ns) {
        //try to buy new server
        let name = ns.cloud.purchaseServer(SERVER.CLOUD, RAM_BASE)
        //check if successfull
        if (name != "") {
            //add to the local list
            this.servers_owned.set(name, RAM_BASE)
            //log
            log.success(ns, "Cloud", "Bought '" + name + "' with '" + RAM_BASE + "' ram")
            //toast
            ns.toast("Bought '" + name + "' with '" + RAM_BASE + "' ram")
            //if all servers bought)
            if (this.servers_owned.size == this.server_max_amount) {
                //log
                log.success(ns, "Bought all cloud servers (" + this.server_max_amount + ")", true)
                //toast
                ns.toast("Bought all cloud servers (" + this.server_max_amount + ")")
            }
            //update lowest ram
            this.ram_lowest = RAM_BASE
        }
    }
}


//function that returns a list of cloud server names
function get_cloud_servers(ns) {
    //list of cloud servers
    let cloud_servers = []
    //scan servers
    const found_servers = scan_servers(ns)
    //for each server
    for (const server of found_servers) {
        //if it contains the cloud name
        if (server.includes(SERVER.CLOUD)) {
            //add to list
            cloud_servers.push(server)
        }
    }
    //return the list
    return cloud_servers
}