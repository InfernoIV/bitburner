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

//enum for port data
export const PORT = {
    NO_DATA: "NULL PORT DATA",
    CODING_CONTRACT: "1",
}

//enum for script names
export const SCRIPT = {
    BOOT: "scripts/boot.js",
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


export const HANDLE = {                     //SF or BN requirement
    MAIN: "MAIN",                           //0
    RAM: "RAM",                             //0
    ROOT: "ROOT",                           //0
    HACK: "HACK",                           //0
    DARKNET: "DARKNET",                     //0/?
    GO: "GO",                               //0/15
    SINGULARITY: "SINGULARITY",             //4
    INTELLIGENCE: "INTELLIGENCE",           //5
    STANEK_AVAILABLE: "STANEK_AVAILABLE",   //13
    STANEK: "STANEK",                       //13
    SLEEVE: "SLEEVE",                       //10
    GO_ANALYSIS: "GO_ANALYSIS",             //0
    GO_CHEAT: "GO_CHEAT",                   //14.2
    CODING_CONTRACT: "CODING_CONTRACT",     //0
    STOCK: "STOCK",                         //0
    INFILTRATION: "INFILTRATION",           //0
    BLADEBURNER: "BLADEBURNER",             //6/7
    GANG: "GANG",                           //2
    HACKNET: "HACKNET",                     //9
    CORPORATION: "CORPORATION",             //3
    GRAFTING: "GRAFTING",                   //10
}






export const AUGMENT = {
    NFG: "NeuroFlux Governor",
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
    */
    MAIN: 1.60,//4.6,
    /*
    getServer (fn)	2.00GB
    baseCost (misc)	1.60GB
    getResetInfo (fn)	1.00GB
    killall (fn)	0.50GB
    getBitNodeMultipliers (fn)	4.00GB
    */
    RAM: 5.1,

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
    getServer (fn)	        2.00GB -> already covered in main
    exec (fn)	            1.30GB
    hackAnalyzeChance (fn)	1.00GB
    scp (fn)	            0.60GB -> already covered in root
    getHackingLevel (fn)	0.05GB  -> already covered in root
    getHackTime (fn)	    0.05GB
    getWeakenTime (fn)	    0.05GB
    getGrowTime (fn)	    0.05GB
    ns.formulas             0
    */
    HACK: 2.45,

    /*
    ns.getBitNodeMultipliers()  4
    - ns.hackAnalyze            1 
    + ns.hackAnalyzeSecurity    1
    + ns.growthAnalyzeSecurity  1     
    ns.formulas.hackTime    0
    ns.formulas.weakenTime  0
    ns.formulas.growTime    0
    
    - ns.getHackTime      0.05
    - ns.getGrowTime      0.05
    - ns.getWeakenTime    0.05   
    */
    INTELLIGENCE: 5.85,

    /*
    ns.singularity.connect              1   (but implemented in root)
    ns.singularity.installBackdoor      2   (but implemented in root)
    purchaseProgram                     2
    singularity.purchaseTor             2
    singularity.upgradeHomeRam          3   
    ls (fn)	                            0.2 -> already covered in root             

    singularity.getAugmentationsFromFaction 5
    singularity.getOwnedAugmentations       5
    singularity.purchaseAugmentation        5
    singularity.installAugmentations        5
    singularity.getAugmentationPrice        2.5

    */
    SINGULARITY: 63.0,

    /*

    */
    SLEEVE: 0.0,


    /*
    If darknet is available, we don't have to buy TOR: saving 2 GB
    */
    DARKNET_AVAILABLE: -2.0,
    /*
    ns.exec             done by hack
    ns.ls               done by root
    ns.getServer        done by main
    ns.scp              done by root
    ns.dnet.probe       0.2
    
    getServer (fn)	2.00GB
    baseCost (misc)	1.60GB
    exec (fn)	1.30GB
    scp (fn)	0.60GB
    ls (fn)	0.20GB
    dnet.probe (fn)	0.20GB

    */
    DARKNET: 0.2,   //5.90

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
    analysis.getControlledEmptyNodes (fn)	16.00GB
    analysis.getChains (fn)	16.00GB
    analysis.getLiberties (fn)	16.00GB
    analysis.getValidMoves (fn)	8.00GB
    go.getBoardState (fn)	4.00GB
    go.makeMove (fn)	4.00GB
    baseCost (misc)	1.60GB
    cheat.getCheatSuccessChance (fn)	1.00GB
    66.60 GB
    */


    /*
    hacknet.numNodes        0.5
    hacknet.purchaseNode    0.5
    hacknet.getNodeStats    0.5
    hacknet.upgradeRam      0.5
    hacknet.upgradeLevel    0.5
    hacknet.upgradeCore     0.5
    */
    HACKNET: 3.0,

    /*
    cloud.purchaseServer (fn)	2.25GB
    baseCost (misc)	1.60GB
    exec (fn)	1.30GB
    cloud.getServerNames (fn)	1.05GB
    getPlayer (fn)	0.50GB
    cloud.upgradeServer (fn)	0.25GB
    getServerMaxRam (fn)	0.05GB  
    */
    CLOUD: 4.05, //7.00

    /*
    codingcontract.attempt (fn)	10.00GB
    codingcontract.getContractType (fn)	5.00GB
    codingcontract.getData (fn)	5.00GB
    baseCost (misc)	1.60GB
    ls (fn)	0.20GB
    */
    CODING_CONTRACT: 20.0,  //21.80

    /*
    stock.getSymbols    2
    stock.hasWseAccount 0.05
    Stock.sellStock     2.5
    Stock.getPosition   2
    */
    STOCK: 6.55,

    /*
    */
   INFILTRATION: 0.0,

    /*

    */
    BLADEBURNER: 0.0,


    /*
    just to indicate stanek is unlocked, so that we join it asap)
    */
    STANEK_AVAILABLE: 0.0,

    //boost
    /*

    */
    STANEK: 0.0,

    /*
    gang.ascendMember (fn)	4.00GB
    gang.purchaseEquipment (fn)	4.00GB
    gang.getChanceToWinClash (fn)	4.00GB
    gang.getMemberInformation (fn)	2.00GB
    gang.recruitMember (fn)	2.00GB
    gang.getAscensionResult (fn)	2.00GB
    gang.getInstallResult (fn)	2.00GB
    gang.getGangInformation (fn)	2.00GB
    gang.setMemberTask (fn)	2.00GB
    gang.setTerritoryWarfare (fn)	2.00GB
    baseCost (misc)	1.60GB
    exec (fn)	1.30GB
    gang.createGang (fn)	1.00GB
    hack (fn)	0.10GB
    ???
    */
    GANG: 25.0, //30.00

    /*

    */
    CORPORATION: 0.0,   //1.60

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
        getServer (fn)	2.00GB
        dnet.openCache (fn)	2.00GB
        dnet.phishingAttack (fn)	2.00GB
        baseCost (misc)	1.60GB
        exec (fn)	1.30GB
        dnet.memoryReallocation (fn)	1.00GB
        dnet.heartbleed (fn)	0.60GB
        scp (fn)	0.60GB
        rm (fn)	0.60GB
        getPlayer (fn)	0.50GB
        dnet.authenticate (fn)	0.40GB
        dnet.probe (fn)	0.20GB
        ps (fn)	0.20GB
        ls (fn)	0.20GB
        dnet.getServerDetails (fn)	0.10GB
        dnet.unleashStormSeed (fn)	0.10GB

        //TESTING: spawn
        */
        DARKNET: 15.4//13.4,
    },
}