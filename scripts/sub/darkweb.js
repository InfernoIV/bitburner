//requires no SF? Or SF 15?
import * as evaluate from 'scripts/sub/evaluate.js'
import * as log from 'scripts/sub/log.js'

const server_darkweb = "darkweb"
const script_darkweb = "scripts/exec/darkweb.js"
const scripts_to_copy = [script_darkweb, 'scripts/sub/evaluate.js', 'scripts/sub/log.js', "scripts/manage_eval.js", "scripts/run_eval.js"]


// Declaration
export class darkweb_obj {
    constructor() {
		//flag to keep track of launch
		this.darkweb_started = false
	}


	async deploy(ns) {
		//if darkweb started
		if (this.darkweb_started) {
			//stop
			return
		}
		//scan from home
		const servers_darknet = await evaluate.exec(ns, "ns.dnet.probe() ")
		//debug
		log.info(ns, "Darkweb", "Found servers from home: '" + JSON.stringify(servers_darknet) + "'",true)
		//if darkweb server is available
		if (servers_darknet.includes(server_darkweb)) {
			//for each script to copy
			for (const script of scripts_to_copy) {
				//copy scripts
				await evaluate.exec(ns, "ns.scp('" + script + "','" + server_darkweb + "')")
			}
			//TODO: calc threads
			var threads = 1
			//start main script
			ns.exec(script_darkweb, server_darkweb, {threads: threads, preventDuplicates: true})
			//temporary
			ns.exit()
			//signal start is done, to prevent multiple starts
			this.darkweb_started = true
			//log
			log.success(ns, "Darkweb", "darkweb crawler deployed")
		}
	}
}