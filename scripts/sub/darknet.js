/*
requires no SF (SF 15 unlocks more servers?)
//https://github.com/bitburner-official/bitburner-src/blob/2e456f5a9c179fbb989b6bbc6b8990e259912fbe/src/Documentation/doc/en/programming/darknet.md
//https://github.com/bitburner-official/bitburner-src/blob/2e456f5a9c179fbb989b6bbc6b8990e259912fbe/markdown/bitburner.darknet.md
*/
import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"
import * as evaluate from "scripts/sub/evaluate.js"


// Declaration
export class darknet_obj {
    constructor() {
        //flag to keep track of launch
        this.darknet_started = false
    }

    init(ns) {
        //log
        log.info(ns, "Darknet", "Init complete", true)
    }
 

    manage(ns) {
        //if darkweb started
        if (this.darknet_started) {
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
            if (server_info.ramUsed > 0) {
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
            var results = ns.scp(CONSTANTS.SCRIPT.TO_COPY.DARKNET, CONSTANTS.SERVER.DARKWEB)
            //start worker
            var result = ns.exec(CONSTANTS.SCRIPT.WORKER.DARKNET, CONSTANTS.SERVER.DARKWEB, {
                preventDuplicates: true,
                threads: threads,
            }, CONSTANTS.SERVER.DARKWEB)
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
}
