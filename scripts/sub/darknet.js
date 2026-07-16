//requires no SF? Or SF 15?
import * as evaluate from 'scripts/sub/evaluate.js'
import * as log from 'scripts/sub/log.js'
import {
    server_darkweb,
    scripts_to_copy_darknet,
    script_darknet_worker
} from "scripts/constants.js"


// Declaration
export class darkweb_obj {
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
        if (servers_darknet.includes(server_darkweb)) {
            //get server information
            const server_info =  await evaluate.exec(ns, "ns.getServer('" + server_darkweb + "')")
			//calc ram costs
            const max_ram_eval_orchestrator = 4 
			const max_ram_eval_worker = server_info.maxRam - (ram_darknet_orchestrator + ram_eval_orchestrator + ram_darknet_orchestrator_eval) - (ram_darknet_worker - ram_eval_orchestrator)
            //copy scripts
            await evaluate.exec(ns, "ns.scp('" + scripts_to_copy_darknet.push(script_darknet_orchestrator) + "','" +
                script_darknet_orchestrator + "')")
            
				//start orchestrator
            ns.exec(script_darknet_orchestrator, server_darkweb, {
                preventDuplicates: true
            }, server_darkweb, max_ram_eval_orchestrator)

            //wait a little bit
            await ns.sleep(100)

            //start worker
            ns.exec(script_darknet_worker, server_darkweb, {
                preventDuplicates: true
            }, server_darkweb, max_ram_eval_worker)
            
			//signal start is done, to prevent multiple starts
            this.darknet_started = true
            //log
            log.success(ns, "Darkweb", "darkweb orchestrator deployed")
        }
    }
}