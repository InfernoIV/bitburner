import * as CONSTANTS from "./constants.js"
import * as CONFIG from "./config.js"

import * as log from "scripts/util/log.js"


// Declaration
export class darknet_obj {
    constructor() {
        //flag to keep track of launch
        this.darknet_started = false
        //create a map for passwords
        this.passwords = new Map()
    }


    init(ns) {
        //disable logging
        log.disable(ns, CONFIG.DISABLE_LOGGING)
        //create port object
        this.port = ns.getPortHandle(CONSTANTS.PORT.DARKNET)
        //empty the port
        this.port.clear()
        //log
        log.info(ns, "Darknet", "Init complete")
    }


    manage(ns) {
        //if darkweb started
        if (this.darknet_started) {
            //handle port
            this.handle_port(ns)
            //stop
            return
        }
        //check if we have the tool
        //get server information
        const tools = ns.ls(CONSTANTS.SERVER.HOME, CONSTANTS.FILE_EXTENSION.EXECUTABLE)
        //if we have don't have the tool
        if (!tools.includes(CONSTANTS.TOOLS.DARKNET)) {
            //stop
            return
        }
        //scan from home
        const servers_darknet = ns.dnet.probe()
        //if darkweb server is available
        if (servers_darknet.includes(CONSTANTS.SERVER.DARKWEB)) {
            //get server information
            const server_info = ns.getServer(CONSTANTS.SERVER.DARKWEB)
            //check if already something running (e.g. with save + exit)
            if (server_info.ramUsed > 0.0) {
                //signal start is done, to speed up execution
                this.darknet_started = true
                //log
                log.success(ns, "Darkweb", "Initial darkweb already running")
                //stop
                return
            }
            //calc ram costs
            const threads = Math.floor(server_info.maxRam / CONSTANTS.RAM.WORKER.DARKNET)
            //copy scripts
            var result = ns.scp(CONSTANTS.SCRIPT.TO_COPY.DARKNET, CONSTANTS.SERVER.DARKWEB)
            //start worker
            result = ns.exec(CONSTANTS.SCRIPT.WORKER.DARKNET, CONSTANTS.SERVER.DARKWEB, {
                preventDuplicates: true,
                threads: threads,
            }, CONSTANTS.SERVER.DARKWEB, threads)
            //check if ok
            if (result == false) {
                //debug
                log.error(ns, "Darknet", "Failed to start initial worker!", true)
                //stop
                return
            }
            //signal start is done, to speed up execution
            this.darknet_started = true
            //log
            log.success(ns, "Darkweb", "Initial darkweb worker deployed")
        }
    }
    

    handle_port(ns) {
        //while there is data on the port
        while (!this.port.empty()) {
            //set raw
            let raw = ""
            //failsafe
            try {
                //get the data
                raw = this.port.peek()
                //parse the data
                const data = raw //JSON.parse(raw)
                //if we are NOT the recipient
                if (data.target != "Darknet") {
                    //stop
                    return
                }
                //depending on the type
                switch (data.type) {
                    //check if we have a password
                    case "get":
                        //password to return    
                        var password = ""
                        //check if we have a password
                        if (this.passwords.has(data.hostname)) {
                            //set password
                            password = this.passwords.get(data.hostname)
                        }
                        //send the data back
                        this.port.tryWrite({
                            "target": data.sender,
                            "hostname": data.hostname,
                            "password": password,
                        })
                        //next
                        break

                    //password correct: save
                    case "set":
                        //save the password
                        this.passwords.set(data.hostname, data.password)
                        //next
                        break

                    //password incorrect: delete
                    case "delete":
                        //delete password 
                        this.passwords.delete(data.hostname)
                        //next
                        break

                    //uncaught
                    default:
                        log.error(ns, "Darknet", "Uncaught data.type: " + data.type, true)
                }
                //remove data 
                this.port.read()
                
            //if error occurred
            } catch (err) {
                //log
                log.error(ns, "Darknet", "handle_port, raw: " + raw + ", err: " + err, true)
            }
        }
    }
}
