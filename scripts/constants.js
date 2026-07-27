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


//enum for script names
export const SCRIPT = {
    MAIN: "scripts/main.js",
    JUMP: "scripts/jump.js",
    WORKER: {
        GROW: "scripts/worker/grow.js",
        WEAKEN: "scripts/worker/weaken.js",
        HACK: "scripts/worker/hack.js",
        DARKNET: "scripts/worker/darknet.js",
        SHARE: "scripts/worker/share.js",
    },
    TO_COPY: {
        HACK: ["scripts/worker/grow.js", "scripts/worker/weaken.js", "scripts/worker/hack.js"],
        DARKNET: ["scripts/sub/log.js", "scripts/constants.js", "scripts/worker/darknet.js", ]
    },
}


//enum for port data
export const PORT = {
    NO_DATA: "NULL PORT DATA",
    CODING_CONTRACT: "1",
}


//enum to keep track of server status
export const STATE = {
    HACK: {
        HACK: "HACK",
        GROW: "GROW",
        WEAKEN: "WEAKEN"
    }
}


export const TOOLS = {
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


//enum for script ram
export const RAM = {
    //main scripts
    /*
    base                1.6
    ns.getServer        2
    ns.getResetInfo     1
    ns.ramOverride      0
    ns.ui.openTail      0
    ns.sleep            0
    ns.disableLog       0
    ns.atExit           0
    */
    MAIN: 4.6,

    /*
    getServer (fn)	        2.00GB  -> already covered in main
    baseCost (misc)	        1.60GB  -> already covered in main
    scp (fn)	            0.60GB
    scan (fn)	            0.20GB
    ls (fn)	                0.20GB
    getHackingLevel (fn)	0.05GB
    sqlinject (fn)	        0.05GB
    httpworm (fn)	        0.05GB
    relaysmtp (fn)	        0.05GB
    ftpcrack (fn)	        0.05GB
    brutessh (fn)	        0.05GB
    nuke (fn)	            0.05GB
    */
    ROOT: 1.35,

    /*
    getServer (fn)	        2.00GB  -> already covered in main
    baseCost (misc)	        1.60GB -> already covered in main
    exec (fn)	            1.30GB
    hackAnalyzeChance (fn)	1.00GB
    scp (fn)	            0.60GB    -> already covered in root
    getHackTime (fn)	    0.05GB
    getWeakenTime (fn)	    0.05GB
    getGrowTime (fn)	    0.05GB
    getHackingLevel (fn)	0.05GB  -> already covered in root
    ns.formulas             0
    */
    HACK: 2.45,

    /*
    ns.getBitNodeMultipliers()  4
    */
    INTELLIGENCE: 4.0,

    /*
    ns.singularity.connect              1   (but implemented in root)
    ns.singularity.installBackdoor      2   (but implemented in root)
    purchaseProgram                     2
    singularity.purchaseTor             2
    singularity.upgradeHomeRam          3   
    ls (fn)	                            0.2 covered by root)             
    */
    SINGULARITY: 10.0,

    /*

    */
    SLEEVE: 0.0,

    /*
    ns.exec             done by hack
    ns.ls               done by root
    ns.getServer        done by main
    ns.scp              done by root
    ns.dnet.probe       0.2
    */
    DARKNET: 0.2,

    /*
    ns.go.getCurrentPlayer                  0
    ns.go.passTurn                          0
    ns.go.getOpponent                       0
    ns.go.resetBoardState                   0
    ns.go.getGameState                      0
    ns.go.getMoveHistory                    0
    ns.go.makeMove                          4
    ns.go.analysis.getStats                 0
    ns.go.analysis.resetStats               0
    ns.go.getBoardState                     4
    ns.go.analysis.getValidMoves            8
    */
    GO: 16.0,
    
    /*
    ns.go.analysis.getControlledEmptyNodes  16
    ns.go.analysis.getChains                16
    ns.go.analysis.getLiberties             16
    */
    GO_ANALYSIS: 48.0,
    
    /*
    ns.go.cheat.destroyNode                 8
    ns.go.cheat.removeRouter                8    
    ns.go.cheat.repairOfflineNode           8
    ns.go.cheat.playTwoMoves                8
    */
    GO_CHEAT: 24.0,

    /*
    ns.getPlayer    0.5
    getServerNames  1.05    
    purchaseServer  2.25    
    upgradeServer   0.25    
    */
    CLOUD: 4.05,

    /*
    ns.codingcontract.attempt               10
    ns.codingcontract.getContractType       5
    ns.codingcontract.getData               5
    */
    CODING_CONTRACT: 20.0,

    /*
    */
    STOCK: 0.0,

    /*
    */
   INFILTRATION: 0.0,

    /*

    */
    BLADEBURNER: 0.0,

    //boost
    /*

    */
    STANEK: 0.0,

    /*
    ???
    */
    GANG: 25.0,

    /*

    */
    HACKNET: 0.0,

    /*

    */
    CORPORATION: 0.0,

    /*

    */
    GRAFTING: 0.0,

    //worker scripts
    WORKER: {
        /*
        base        1.6
        ns.weaken   1.15
        */
        WEAKEN: 1.75,

        /*
        base    1.6
        ns.grow 0.16
        */
        GROW: 1.75,

        /*
        base    1.6
        ns.hack 0.1    
        */
        HACK: 1.7,
        
        /*
        base    1.6
        share   2.4
        */
        SHARE: 4.0,

        /*
        base                                1.6
        ns.dnet.probe()                     0.2 GB
        ns.dnet.authenticate()              0.4 GB
        ns.dnet.phishingAttack()            2 GB 
        ns.dnet.openCache()                 2 GB
        ns.dnet.unleashStormSeed            0.1 GB
        ns.dnet.labradar()                  0 GB
        ns.dnet.labreport()                 0 GB
        ns.dnet.heartbleed()                0.6 GB
        ns.getServer()                      2 GB
        1.6 + 0.2 + 0.4 + 2 + 2 + 0.1 + 0 + 0 + 0.6 + 2 = 8.9
        */
        DARKNET: 8.9,
    },
}