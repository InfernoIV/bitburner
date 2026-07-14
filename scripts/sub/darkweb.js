//requires no SF? Or SF 15?
import * as evaluate from 'scripts/sub/evaluate.js'
import * as log from 'scripts/sub/log.js'

const server_darkweb = "darkweb"
const script_darkweb = "scripts/exec/darkweb.js"
const scripts_to_copy = [script_darkweb, 'scripts/sub/evaluate.js', 'scripts/sub/log.js', "scripts/manage_eval.js", "scripts/run_eval.js"]
var darkweb_started = false

//function that starts the darkweb chain
export async function init(ns) {
	//if darkweb not started yet
	if (!darkweb_started) {
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
			//start main script
			ns.exec(script_darkweb, server_darkweb)
			//signal start is done, to prevent multiple starts
			darkweb_started = true
			//log
			log.success(ns, "Darkweb", "darkweb started")
		}
	}
}

