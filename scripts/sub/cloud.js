//requires no SF?
//https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.cloud.md
import * as CONSTANTS from "scripts/constants.js"
import * as evaluate from 'scripts/sub/evaluate.js'
import * as log from 'scripts/sub/log.js'


// Declaration
export class cloud_obj {
    constructor() {
        this.available = true
    }


    //
    init(ns) {
        /*
        ns.disableLog("upgradeServer")
        ns.disableLog("purchaseServer")
        */
        //map of servers owned
        this.servers_owned = new Map()
        //variables that are set once
        this.server_max_amount = 25 * currentNodeMults.CloudServerLimit
        this.server_max_ram = 1048576 * currentNodeMults.CloudServerMaxRam
        //keep track of the lowest ram (to speed up scripts)
        this.ram_lowest = this.server_max_ram
        //log information
        //log.info(ns, "Cloud", "Max of '" + this.server_max_amount + "' cloud servers, max of '" + this.server_max_ram + "' ram", true)

        //check for existing servers
        const servers = ns.cloud.getServerNames() //can we use the normal scan for this?
        //check each server
        for (const server of servers) {
            //get the ram
            const ram = ns.getServerMaxRam(server)
            //add to map
            this.servers_owned.set(server, ram)
            //update lowest ram
            if (ram < this.ram_lowest) {
                //update
                this.ram_lowest = ram
            }
            //log information
            //log.info(ns, "Cloud", "Found cloud server '" + server + "' with '" + ram + "' ram => '" + this.servers_owned.size + "'", true)
        }
    }


    //buy and/or upgrade servers
    manage(ns) {
        //min money to upgrade
        const money_min = 55000000 //55m
        //get player
        const player = ns.getPlayer()
        //check if we have enough money
        if (player.money >= money_min) {
            //log information
            //log.info(ns, "Cloud", "RAM lowest: '" + this.ram_lowest + "', max is '" + this.server_max_ram + "'")
            //check if we need to upgrade at all
            if (this.ram_lowest < this.server_max_ram) {
                //debug
                //log.info(ns, "Cloud", "Updating ram", true)
                //upgrade ram
                this.upgrade_ram(ns)
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
        //debug
        //log.info(ns, "Cloud", "Owned servers: '" + JSON.stringify(this.servers_owned) + "'", true)
        //try to upgrade the server
        for (var [server, ram] of this.servers_owned) {
            //debug
            //log.info(ns, "Cloud", "Found server '" + server + "' with '" + ram + "' GB of '" + this.server_max_ram + "' GB", true)
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
                    /*
                    //try to update the lowest ram
                    var server_ram = this.servers_owned.values
                    //sort on lowest first
                    server_ram.sort((a, b) => a.value - b.value)
                    */
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
        //hostname of servers
        const hostname = "cloud"
        //base ram to start with, set to 2 since the Hack, grow, weaken scripts require 1.75 GB
        const base_ram = 2
        //try to buy new server
        var name = ns.cloud.purchaseServer(hostname, base_ram)
        //check if successfull
        if (name != "") {
            //add to the local list
            this.servers_owned.set(name, base_ram)
            //log
            log.success(ns, "Cloud", "Bought '" + name + "' with '" + base_ram + "' ram")
            //toast
            ns.toast("Bought '" + name + "' with '" + base_ram + "' ram")
            //if all servers bought)
            if (this.servers_owned.size == this.server_max_amount) {
                //log
                log.success(ns, "Bought all cloud servers (" + this.server_max_amount + ")", true)
                //toast
                ns.toast("Bought all cloud servers (" + this.server_max_amount + ")")
            }
            //update lowest ram
            this.ram_lowest = base_ram
        }
    }
}


/*
ns.getPlayer()
getServerNames(returnOpts)          1.05    Returns an array with the hostnames or IP addresses of all of the cloud servers you have purchased. Returns hostnames by default.
purchaseServer(hostname, ram)       2.25    Purchase a cloud server.
upgradeServer(host, ram)            0.25    Upgrade a cloud server's RAM.

renameServer(hostname, newName)     0       Rename a cloud server.
getRamLimit()                       0.05    Returns the maximum RAM that a cloud server can have.
getServerLimit()                    0.05    Returns the maximum number of cloud servers you can purchase.
getServerUpgradeCost(host, ram)     0.1     Get cost of upgrading a cloud server to the given RAM.
getServerCost(ram)                  0.25    Get cost of purchasing a cloud server.
deleteServer(host)                  2.25    Delete a cloud server.
*/