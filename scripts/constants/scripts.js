//enum for script names
export const SCRIPT = {
    //start
    BOOT: "scripts/boot.js",
    //end
    DESTROY: "scripts/destroy.js",
    //main
    MAIN: "scripts/main/main.js",

    //worker
    WORKER: {
        //root
        BACKDOOR: "scripts/root/worker_backdoor.js",
        //share
        SHARE: "scripts/share/worker_share.js",
        //stanek
        STANEK: "scripts/stanek/worker_stanek.js",

        //hack
        GROW: "scripts/hack/worker_grow.js",
        WEAKEN: "scripts/hack/worker_weaken.js",
        HACK: "scripts/hack/worker_hack.js",

        //darknet
        DARKNET: "scripts/darknet/worker_darknet.js",
    },

    //scripts to be copied to remote servers
    TO_COPY: {
        //hack scripts, runs on normal and cloud servers
        HACK: ["scripts/hack/worker_grow.js", "scripts/hack/worker_weaken.js", "scripts/hack/worker_hack.js"],

        //darknet scripts, runs on darknet servers
        DARKNET: ["scripts/darknet/config.js", "scripts/constants/scripts.js", "scripts/constants/ports.js", 
            "scripts/constants/ram.js", "scripts/constants/.js", "scripts/util/log.js", "scripts/darknet/worker_darknet.js"]
    },
}
