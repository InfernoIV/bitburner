//requires no SF? Or SF 15?
import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"
import * as evaluate from "scripts/sub/evaluate.js"


// Declaration
export class darknet_obj {
    constructor() {
        //flag to keep track of launch
        this.darknet_started = false
    }


    async deploy(ns) {
        //if darkweb started
        if (this.darknet_started) {
            //stop
            return
        }
        //check if we have the tool
        //get server information
        const tools =  await evaluate.exec(ns, "ns.ls('" + CONSTANTS.SERVER.HOME + "','" + CONSTANTS.FILE_EXTENSION.EXECUTABLE + "')")
        //if we have don't have the tool
        if (!tools.includes(CONSTANTS.TOOLS.DARKNET)) {
            //stop
            return
        }
        //scan from home
        const servers_darknet = await evaluate.exec(ns, "ns.dnet.probe() ")
        //if darkweb server is available
        if (servers_darknet.includes(CONSTANTS.SERVER.DARKWEB)) {
            //get server information
            const server_info =  await evaluate.exec(ns, "ns.getServer('" + CONSTANTS.SERVER.DARKWEB + "')")
			//calc ram costs
			const max_ram_eval_worker = server_info.maxRam - CONSTANTS.RAM.DARKNET.WORKER - CONSTANTS.RAM.EVAL_ORCHESTRATOR 
			//copy scripts
            for (const script of CONSTANTS.SCRIPT.DARKNET.TO_COPY) {
            //copy scripts
            var results = await evaluate.exec(ns, "ns.scp('" + script + "','" +
                CONSTANTS.SERVER.DARKWEB + "')")
            }
            //start worker
            var result = ns.exec(CONSTANTS.SCRIPT.DARKNET.WORKER, CONSTANTS.SERVER.DARKWEB, {
                preventDuplicates: true
            }, CONSTANTS.SERVER.DARKWEB, max_ram_eval_worker)
            //check if ok
            if (result == false) {
                //debug
                log.error(ns, "Darknet", "Failed to start worker!")
                //stop
                ns.exit()
            }

			//signal start is done, to speed up execution
            this.darknet_started = true
            //log
            log.success(ns, "Darkweb", "darkweb worker deployed")
        }
    }
}
