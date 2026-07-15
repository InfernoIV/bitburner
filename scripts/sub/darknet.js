//requires no SF? Or SF 15?
import * as evaluate from 'scripts/sub/evaluate.js'
import * as log from 'scripts/sub/log.js'
import { script_darknet_orchestrator, scripts_to_copy_darknet, script_darknet_worker } from "scripts/constants.js"


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
		if (servers_darknet.includes(script_darknet_orchestrator)) {
			//copy scripts
			await evaluate.exec(ns, "ns.scp('" + scripts_to_copy_darknet.push(script_darknet_orchestrator) + "','" + script_darknet_orchestrator + "')")
			//TODO: calc threads
			//needed?
			var threads = 1
			//start orchestrator
			ns.exec(script_darknet_orchestrator, server_darkweb, {threads: threads, preventDuplicates: true}, server_darkweb)
			//wait a little bit
			await ns.sleep(100)
			//start worker
			ns.exec(script_darknet_worker, server_darkweb, {preventDuplicates: true}, server_darkweb)
			//signal start is done, to prevent multiple starts
			this.darknet_started = true
			//log
			log.success(ns, "Darkweb", "darkweb orchestrator deployed")
		}
	}
}