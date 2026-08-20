import * as CONSTANTS from "./constants.js"
import * as CONFIG from "./config.js"

import * as log from "scripts/util/log.js"

// Declaration
export class cloud_obj {
    constructor() {
        this.available = true
    }


    //
    init(ns, handles) {
        //disable logging
        log.disable(ns, CONFIG.DISABLE_LOGGING)                
        //map of servers owned
        this.servers_owned = new Map()
        //variables that are set once
        this.server_max_amount = CONSTANTS.SERVERS_AMOUNT_MAX //* currentNodeMults.CloudServerLimit
        this.server_max_ram = CONSTANTS.SERVER_RAM_MAX //* currentNodeMults.CloudServerMaxRam
        //keep track of the lowest ram (to speed up scripts)
        this.ram_lowest = this.server_max_ram        
        //check for existing servers
        var servers = ns.cloud.getServerNames() //can we use the normal scan for this?
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
        const money_min = CONFIG.MONEY_MIN
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
        for (var [server, ram] of this.servers_owned) {
            //check if we need to upgrade at all
            while (ram < this.server_max_ram) {
                //just try to upgrade
                var upgraded = ns.cloud.upgradeServer(server, ram * 2)
                //if successfull
                if (upgraded) {
                    //update the ram variable
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
                        log.success(ns, "Cloud", "Maximized ram of all cloud servers (" + Format.ram(
                            server_max_ram) + ")", true)
                        //toast
                        ns.toast("Maximized ram of all cloud servers (" + Format.ram(server_max_ram) + ")")
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
        var name = ns.cloud.purchaseServer(CONSTANTS.HOSTNAME_CLOUD, CONFIG.RAM_BASE)
        //check if successfull
        if (name != "") {
            //add to the local list
            this.servers_owned.set(name, CONFIG.RAM_BASE)
            //log
            log.success(ns, "Cloud", "Bought '" + name + "' with '" + CONFIG.RAM_BASE + "' ram")
            //toast
            ns.toast("Bought '" + name + "' with '" + CONFIG.RAM_BASE + "' ram")
            //if all servers bought)
            if (this.servers_owned.size == this.server_max_amount) {
                //log
                log.success(ns, "Bought all cloud servers (" + this.server_max_amount + ")", true)
                //toast
                ns.toast("Bought all cloud servers (" + this.server_max_amount + ")")
            }
            //update lowest ram
            this.ram_lowest = CONFIG.RAM_BASE
        }
    }
}
