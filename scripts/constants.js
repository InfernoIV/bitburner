//servers
export const SERVER = {
    HOME: "home",
    DARKWEB: "darkweb"
}

//timing
export const TIME = {
    SAFETY: 20,
    WAIT: 5,
}

//enum of message types
export const MESSAGE = {
    DARKNET: {
        INFORMATION: "I",
        FILE: "F",
        PASSWORD_REQUEST: "P",
        AUTHENTICATED: "A",
        AUTHENTICATION_FAILED: "AF"
    },
}


//enum for script names
export const SCRIPT = {
    LIBRARY: {
        LOG: "scripts/sub/log.js",
        CONSTANTS: "scripts/constants.js",
        EVALUATE: "scripts/sub/evaluate.js",
    },
    SUB: {
        ROOT: "scripts/sub/root.js",
        DARKNET: "scripts/sub/darknet.js",
        HACK: "scripts/sub/hack.js",
        SHARE: "scripts/sub/share.js",
    },
    HACK: {
        GROW: "scripts/exec/grow.js",
        WEAKEN: "scripts/exec/weaken.js",
        HACK: "scripts/exec/hack.js",
        TO_COPY: ["scripts/exec/grow.js", "scripts/exec/weaken.js", "scripts/exec/hack.js"]
    },
    EVAL: {
        ORCHESTRATOR: "scripts/exec/eval_orchestrator.js",
        WORKER: "scripts/exec/eval_worker.js",
    },
    DARKNET: {
        ORCHESTRATOR: "scripts/exec/darknet_orchestrator.js",
        WORKER: "scripts/exec/darknet_worker.js",
        TO_COPY: ["scripts/sub/log.js", "scripts/constants.js", "scripts/sub/evaluate.js",    
            "scripts/exec/darknet_worker.js", "scripts/exec/eval_orchestrator.js", "scripts/exec/eval_worker.js",            
        ]
    },
    SHARE_WORKER: "scripts/exec/share.js",
}


//enum for script ram
//if ending with EVAL, this is the RAM needed for a single EVAL script of that type
//cost for EVAL is Base cost (1.6) + max ram of a function
export const RAM = {
    MAIN: {
        ORCHESTRATOR: 2.9, //1.6 + 1.3 + TODO
        EVAL: 8.0//33.6, //1.6 + 32
    },
    EVAL_ORCHESTRATOR: 2.9, //1.6 + 1.3
    DARKNET: {
        /*
        ORCHESTRATOR: 2.9, //1.6 + 1.3
        ORCHESTRATOR_EVAL: 5.6, //1.6 + 5? (what is max ram for function cost for the orchestrator?)
        */
        WORKER: 4.0, //1.6 + 1.3 (exec) + 0.4 (dnet.authenticate) = 3.3
        WORKER_EVAL: 3.6 //1.6 + 2(3.6) -> +4 = 5.6
    },
    HACK: {
        WEAKEN: 1.75, //1.6 + 0.15 
        GROW: 1.75, //1.6 + 0.15
        HACK: 1.7 //1.6 + 0.1
    },
    SHARE: 4, //1.6 + 2.4 GB
}


//enum for port data
export const PORT = {
    NO_DATA: "NULL PORT DATA",
    //EVAL ports are on PID
    //information from darknet workers to orchestrator
    DARKNET: {
        INFORMATION: 1,
        //information from darknet orchestrator to workers
        PASSWORD: 2
    }
}


//enum to keep track of server status
export const STATE = {
    HACK: {
        HACK: "HACK",
        GROW: "GROW",
        WEAKEN: "WEAKEN"
    }
}

export const PASSWORD_NOT_FOUND = "PASSWORD_NOT_FOUND"

export const TOOLS = {
    //dict of tools (key) and value (cost in dark web & hacking level for creating ourselves) 
    HACKING: {
        BRUTE_SSH: "BruteSSH.exe",
        FTP_CRACK: "FTPCrack.exe",
        RELAY_SMTP: "relaySMTP.exe",
        HTTP_WORM: "HTTPWorm.exe",
        SQL_INJECT: "SQLInject.exe",
        LIST: ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe", ]
    },
    DARKNET: "DarkscapeNavigator.exe",
}

export const FILE_EXTENSION = {
    EXECUTABLE: ".exe",
    CACHE: ".cache",
    TEXT: ".txt",
    LITERATURE: ".lit",
    SCRIPT: ".js",
    CODING_CONTRACT: ".cct",
}

//enum for message formatting
export const FORMAT = {
    INFO: "INFO", //blue
    SUCCESS: "SUCCESS", //green, default color (no extra text needed)
    WARNING: "WARNING",
    ERROR: "ERROR",
}
