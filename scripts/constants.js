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
    CODING_CONTRACT: 1,
    BACKDOOR: 2,
}


//enum for script names
export const SCRIPT = {
    BOOT: "scripts/boot.js",
    MAIN: "scripts/main.js",
    JUMP: "scripts/jump.js",
    DESTROY: "scripts/destroy_bitnode.js",
    WORKER: {
        GROW: "scripts/worker/grow.js",
        WEAKEN: "scripts/worker/weaken.js",
        HACK: "scripts/worker/hack.js",
        DARKNET: "scripts/worker/darknet.js",
        SHARE: "scripts/worker/share.js",
        STANEK: "scripts/worker/stanek.js",
        BACKDOOR: "scripts/worker/backdoor.js",
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
    CLOUD: "CLOUD",                         //0
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
    TRP: "The Red Pill",
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


/*
'SINGULARITY' for 6.7 + 63 = 69.7 / 8192 GB (1%)
 'ROOT' for 69.7 + 1.35 = 71.05 / 8192 GB (1%)
'HACK' for 71.05 + 2.45 = 73.5 / 8192 GB (1%)
'DARKNET' for 73.5 + 0.2 = 73.7 / 8192 GB (1%)
'GO' for 73.7 + 16 = 89.7 / 8192 GB (2%)
'GO_ANALYSIS' for 89.7 + 48 = 137.7 / 8192 GB (2%)
'STOCK' for 137.7 + 6.55 = 144.25 / 8192 GB (2%)
*/

//enum for script ram
export const RAM = {
    //main scripts
    /*
    base                1.6
    */
    MAIN: 1.60,//4.6,
    /*
    
    getServer (fn)	2.00GB
    getResetInfo (fn)	1.00GB
    kill (fn)	0.50GB

    baseCost (misc)	1.60GB  -> covered in main
    getBitNodeMultipliers (fn)	4.00GB  -> covered in intelligence
    */
    RAM: 5.1,

    /*
    singularity.destroyW0r1dD43m0n   25
    spawn       2
    base        1.6*/
    DESTROY: 28.6,

    /*
    getPlayer (fn)	0.50GB
    scan (fn)	0.20GB
    ls (fn)	0.20GB
    sqlinject (fn)	0.05GB
    httpworm (fn)	0.05GB
    relaysmtp (fn)	0.05GB
    ftpcrack (fn)	0.05GB
    brutessh (fn)	0.05GB
    nuke (fn)	0.05GB

    getServer (fn)	2.00GB  -> covered in ram
    baseCost (misc)	1.60GB  -> covered in main
    
    */
    ROOT: 1.2,

    /*
    exec (fn)	1.30GB
    hackAnalyzeChance (fn)	1.00GB
    hackAnalyzeSecurity (fn)	1.00GB
    growthAnalyzeSecurity (fn)	1.00GB
    hackAnalyze (fn)	1.00GB
    scp (fn)	0.60GB
    getHackTime (fn)	0.05GB
    getWeakenTime (fn)	0.05GB
    getGrowTime (fn)	0.05GB

    weaken (fn)	0.15GB  -> keyword used, but not the actual function
    grow (fn)	0.15GB  -> keyword used, but not the actual function
    hack (fn)	0.10GB  -> keyword used, but not the actual function
    getPlayer (fn)	0.50GB  -> covered in root
    getServer (fn)	2.00GB  -> covered in ram
    baseCost (misc)	1.60GB  -> covered in main
    */
    HACK: 6.05,



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
    getServer (fn)	2.00GB  -> covered in ram
    baseCost (misc)	1.60GB  -> covered in main
    getPlayer (fn)	0.50GB    -> covered in root
    ls (fn)	0.20GB    -> covered in root

    singularity.getOwnedAugmentations (fn)	5.00GB
    singularity.goToLocation (fn)	5.00GB
    singularity.getAugmentationsFromFaction (fn)	5.00GB
    singularity.purchaseAugmentation (fn)	5.00GB
    singularity.installAugmentations (fn)	5.00GB
    singularity.getAugmentationRepReq       2.5
    singularity.donateToFaction             5

    singularity.getCrimeChance (fn)	5.00GB
    singularity.getCrimeStats (fn)	5.00GB
    singularity.commitCrime (fn)	5.00GB
    singularity.upgradeHomeRam (fn)	3.00GB
    singularity.checkFactionInvitations (fn)	3.00GB

    singularity.joinFaction (fn)	3.00GB
    singularity.workForFaction (fn)	3.00GB
    singularity.applyToCompany (fn)	3.00GB
    singularity.workForCompany (fn)	3.00GB
    singularity.getFactionEnemies (fn)	3.00GB

    singularity.getAugmentationPrice (fn)	2.50GB
    singularity.getAugmentationRepReq (fn)	2.50GB
    singularity.purchaseTor (fn)	2.00GB
    singularity.purchaseProgram (fn)	2.00GB
    singularity.travelToCity (fn)	2.00GB

    singularity.universityCourse (fn)	2.00GB
    singularity.gymWorkout (fn)	2.00GB
    singularity.getFactionRep (fn)	1.00GB
    singularity.getFactionFavor (fn)	1.00GB
    singularity.getCompanyRep (fn)	1.00GB

    singularity.getFactionWorkTypes (fn)	1.00GB
    singularity.getCurrentWork (fn)	0.50GB
    

    */
    SINGULARITY: 88.0,

    /*

    */
    SLEEVE: 0.0,


    /*
    If darknet is available, we don't have to buy TOR: saving 2 GB
    */
    DARKNET_AVAILABLE: -2.0,
    /*
    getServer (fn)	2.00GB    -> covered in ram
    baseCost (misc)	1.60GB  -> covered in main
    exec (fn)	1.30GB  -> covered in hack
    scp (fn)	0.60GB  -> covered in main
    ls (fn)	0.20GB    -> covered in root
    dnet.probe (fn)	0.20GB
    */
    DARKNET: 0.2,  

    /*
    go.getBoardState (fn)	4.00GB
    go.makeMove (fn)	4.00GB

    baseCost (misc)	1.60GB      -> covered in main
    */
    GO: 8.0,
    
    /*
    analysis.getControlledEmptyNodes (fn)	16.00GB
    analysis.getChains (fn)	16.00GB
    analysis.getLiberties (fn)	16.00GB
    analysis.getValidMoves (fn)	8.00GB
    */
    GO_ANALYSIS: 56.0,
    
    /*
    cheat.getCheatSuccessChance (fn)	1.00GB
    */
    GO_CHEAT: 1.0,

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
    getServer (fn)	2.00GB
    exec (fn)	1.30GB
    getPlayer (fn)	0.50GB
    
    cloud.purchaseServer (fn)	2.25GB
    cloud.getServerNames (fn)	1.05GB
    cloud.upgradeServer (fn)	0.25GB
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
    stock.sellStock (fn)	2.50GB
    stock.getSymbols (fn)	2.00GB
    stock.getPosition (fn)	2.00GB
    stock.hasWseAccount (fn)	0.05GB

    baseCost (misc)	1.60GB    -> covered in main
    exec (fn)	1.30GB    -> covered in hack
    */
    STOCK: 6.55,

    /*
    */
   INFILTRATION: 0.0,

    /*
    bladeburner.joinBladeburnerDivision (fn)	4.00GB
    bladeburner.getStamina (fn)	4.00GB
    bladeburner.getRank (fn)	4.00GB
    bladeburner.getActionEstimatedSuccessChance (fn)	4.00GB
    bladeburner.getActionCountRemaining (fn)	4.00GB
    bladeburner.getCityChaos (fn)	4.00GB
    bladeburner.getCityCommunities (fn)	4.00GB
    bladeburner.getCityEstimatedPopulation (fn)	4.00GB
    bladeburner.getCity (fn)	4.00GB
    bladeburner.switchCity (fn)	4.00GB
    bladeburner.getNextBlackOp (fn)	2.00GB
    */
    BLADEBURNER: 0.0,


    /*
    just to indicate stanek is unlocked, so that we join it asap)
    */
    STANEK_AVAILABLE: 0.0,

    //boost
    /*
    "Manager":                          10.45 GB
        ns.stanek.acceptGift            2.0
        ns.stanek.giftHeight            0.4
        ns.stanek.giftWidth             0.4
        ns.stanek.getFragment           2.0
        ns.stanek.fragmentDefinitions   0.0
        ns.stanek.clearGift             0.0   
        ns.stanek.canPlaceFragment      0.5
        ns.stanek.removeFragment        0.15
        ns.stanek.placeFragment         5.0


    */
    STANEK: 10.45,

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
        ns.weaken   0.15
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
        ns.spawn    2
        */
        DARKNET: 15.4,

        /*
        baseCost                    1.6            
        ns.stanek.chargeFragment    0.4
        */
       STANEK: 2.0,

        /*
        baseCost (misc)	1.60GB  -> covered in main
        singularity.connect (fn)	2.00GB  -> covered in singularity
        singularity.installBackdoor (fn)	2.00GB  -> covered in singularity
        scan (fn)	0.20GB
        */
        BACKDOOR: 5.8,
    },
}