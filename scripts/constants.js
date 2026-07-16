//servers
export const server_home = "home"
export const server_darkweb = "darkweb"


//scripts
//eval
export const script_eval_orchestrator = "scripts/exec/eval_orchestrator.js"
export const script_eval_worker = "scripts/exec/eval_worker.js"
//hack
export const script_weaken = "scripts/exec/weaken.js"
export const script_grow = "scripts/exec/grow.js"
export const script_hack = "scripts/exec/hack.js"
export const script_hack_exec = "scripts/exec/hack_self.js"
export const scripts_to_copy_hack = [script_weaken, script_grow, script_hack]
//darknet
export const script_darknet_orchestrator = "scripts/exec/darknet_orchestrator.js"
export const script_darknet_worker = "scripts/exec/darknet_worker.js"
export const scripts_to_copy_darknet = [script_darknet, script_eval_orchestrator, script_eval_worker,
    "scripts/sub/log.js", "scripts/constants.js", "scripts/sub/eval.js"
]

//ram costs
export const ram_eval_orchestrator = 3 //2.9

export const ram_darknet_orchestrator = 4 //TODO
export const ram_darknet_orchestrator_eval = 4 //TODO

export const ram_darknet_worker = 2
export const ram_darknet_worker_eval = 2

//ports
export const port_no_data = "NULL PORT DATA"
//eval
/*export const port_eval_command = 1
export const port_eval_reply = 2*/
//darknet
export const port_darknet_information = 1 //3 //information send from workers to the orchestrator
export const port_darknet_password = 2 //4 //map of servers and passwords, filled from orchestrator
export const port_darknes_servers_done =
3 //5 //list of servers that are authenticated, filled by workers, edited by orchestrator