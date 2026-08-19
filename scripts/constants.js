//servers
export const SERVER = {
    HOME: "home",
    DARKWEB: "darkweb",
    WORLD_DEAMON: "w0r1d_d43m0n"
}
/*
unused for now
  NormalLab: "th3_l4byr1nth",
  CruelLab: "cru3l_l4byr1nth",
  MercilessLab: "m3rc1l3ss_l4byr1nth",
  UberLab: "ub3r_l4byr1nth",
  EternalLab: "et3rn4l_l4byr1nth",
  EndlessLab: "end13ss_l4byr1nth",
  FinalLab: "f1n4l_l4byr1nth",
  BonusLab: "b0nus_l4byr1nth",
*/

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
    HACK_REQUEST: 3,
    HACK_TARGET: 4,
    DARKNET: 5,
}

//enum for script names
export const SCRIPT = {
    BOOT: "scripts/boot.js",
    MAIN: "scripts/main/main.js",
    DESTROY: "scripts/util/destroy_bitnode.js",
    WORKER: {
        //root
        BACKDOOR: "scripts/root/worker_backdoor.js",
        //hack
        GROW: "scripts/hack/worker_grow.js",
        WEAKEN: "scripts/hack/worker_weaken.js",
        HACK: "scripts/hack/worker_hack.js",
        //darknet
        DARKNET: "scripts/darknet/worker_darknet.js",
        //share
        SHARE: "scripts/share/worker_share.js",
        //stanek
        STANEK: "scripts/stanek/worker_stanek.js",
    },
    TO_COPY: {
        HACK: ["scripts/util/log.js", "scripts/constants.js",
            "scripts/hack/constants.js", "scripts/hack/worker_grow.js", "scripts/hack/worker_weaken.js", "scripts/hack/worker_hack.js"],
        DARKNET: ["scripts/util/log.js", "scripts/constants.js", 
            "scripts/darknet/constants.js", "scripts/darknet/worker_darknet.js", ]
    },
}

//hostname for the servers
export const HOSTNAME_CLOUD = "cloud"

//list of (special) augments
export const AUGMENT = {
    NFG: "NeuroFlux Governor",
    TRP: "The Red Pill",
    BS: "BladesSimulacrum",
}

//list of (special) factions
export const FACTION = {
    DAEDALUS: "Daedalus",
}

//list of different tools
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

//list of file extensions
export const FILE_EXTENSION = {
    EXECUTABLE: ".exe",
    CACHE: ".cache",
    TEXT: ".txt",
    LITERATURE: ".lit",
    SCRIPT: ".js",
    CODING_CONTRACT: ".cct",
}
