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
        //scan from home
        const servers_darknet = await evaluate.exec(ns, "ns.dnet.probe() ")
        //if darkweb server is available
        if (servers_darknet.includes(CONSTANTS.SERVER.DARKWEB)) {
            //get server information
            const server_info =  await evaluate.exec(ns, "ns.getServer('" + CONSTANTS.SERVER.DARKWEB + "')")
			//calc ram costs
			//darkweb server:
			//orchestrator + eval + eval worker
			//worker + eval + eval worker
			//the eval worker for the darknet worker needs to scale, therefore it is not counted
			const max_ram_eval_worker = server_info.maxRam - (CONSTANTS.RAM.DARKNET.ORCHESTRATOR + CONSTANTS.RAM.EVAL_ORCHESTRATOR + CONSTANTS.RAM.DARKNET.ORCHESTRATOR_EVAL) - 
			(CONSTANTS.RAM.DARKNET.WORKER - CONSTANTS.RAM.EVAL_ORCHESTRATOR)
            
            for (const script of CONSTANTS.SCRIPT.DARKNET.TO_COPY) {
            //copy scripts
            var results = await evaluate.exec(ns, "ns.scp('" + script + "','" +
                CONSTANTS.SERVER.DARKWEB + "')")
            }

            
                //start orchestrator
            var result = ns.exec(CONSTANTS.SCRIPT.DARKNET.ORCHESTRATOR, CONSTANTS.SERVER.DARKWEB, {
                preventDuplicates: true
            }, CONSTANTS.SERVER.DARKWEB, CONSTANTS.RAM.DARKNET.ORCHESTRATOR_EVAL)

            //check if ok
            if (result == false) {
                //debug
                log.error(ns, "Darknet", "Failed to start orchestrator!")
                //stop
                ns.exit()
            }
            //wait a little bit
            await ns.sleep(CONSTANTS.TIME.WAIT)
            //start worker
            result = ns.exec(CONSTANTS.SCRIPT.DARKNET.WORKER, CONSTANTS.SERVER.DARKWEB, {
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
            log.success(ns, "Darkweb", "darkweb orchestrator deployed")
        }
    }
}
