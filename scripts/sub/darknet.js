//requires no SF? Or SF 15?
import * as evaluate from 'scripts/sub/evaluate.js'
import * as log from 'scripts/sub/log.js'

const server_darkweb = "darkweb"
const script_darknet = "scripts/exec/darknet.js"
const scripts_to_copy = [script_darknet, 'scripts/sub/log.js']


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
		//debug
		log.info(ns, "Darknet", "Found servers from home: '" + JSON.stringify(servers_darknet) + "'",true)
		//if darkweb server is available
		if (servers_darknet.includes(server_darkweb)) {
			//copy scripts
			await evaluate.exec(ns, "ns.scp('" + scripts_to_copy + "','" + server_darkweb + "')")
			//TODO: calc threads
			var threads = 1
			//start main script, prevent duplicates
			ns.exec(script_darknet, server_darkweb, {threads: threads, preventDuplicates: true}, server_darkweb)
			//signal start is done, to prevent multiple starts
			this.darknet_started = true
			//log
			log.success(ns, "Darkweb", "darkweb crawler deployed")
		}
	}
}