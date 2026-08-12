//config

//minimum skill level before working
export const GANG_SKILL_LEVEL_MIN = 50 //50 or 200?TODO: tune
//minimal chance to win clash
export const GANG_CLASH_WIN_CHANCE = 0.55 //55% TODO: tune
//minimal multiplier increase before ascending
export const GANG_ASCENSION_MIN_MULT = 10 //TODO: tune
//minimal amount of equipement before switching to gaining power
export const GANG_EQUIPMENT_MIN_PERCENTAGE = 0.75 //75%, total = combat: 24 -> 18, hack: 8 -> 6


//constants
export const GANG_KARMA_NEEDED = -54000
//default name of gang members
export const GANG_MEMBER_NAME = "Thug-"
//maximum number of gang members
export const GANG_MEMBERS_MAX = 12
//focus of the gang
export const GANG_FOCUS = {
    combat: "combat",
    hacking: "hacking",
}
//faction of the gang (easiest to joing per focus)
export const GANG_FACTION = {
    combat: "Slum Snakes",
    hacking: "NiteSec",
}
/*
ns.gang.getAllGangInformation()                     2   Get information about all gangs.
only the names are used?
*/
//list of gang names
export const GANG_NAMES = [
    "Slum Snakes",              //combat    combat: 30, karma: -1, money: 1m
    "Tetrads",                  //combat    combat: 75, karma: -18, City: Chongqing | NewTokyo | Ishima
    "The Syndicate",            //combat    combat: 200, hacking: 200, karma: -90, money: 10m, city: Aevum | Sector12, not employed: CIA & NSA
    "The Dark Army",            //combat    combat: 300, hacking: 300, karma: -45, kills: 5, city: Chongqing, not employed: CIA & NSA
    "Speakers for the Dead",    //combat    combat: 300, hacking: 100, karma: -45, kills: 30, not employed: CIA & NSA
    "NiteSec",                  //hacking   hacking: ??? => haveBackdooredServer(SpecialServers.NiteSecServer)
    "The Black Hand",           //hacking   hacking: ??? => haveBackdooredServer(SpecialServers.TheBlackHandServer)
]
//tasks for gang members
export const GANG_TASK = {
    Unassigned: "Unassigned",                           //idle
    //hacking
    Ransomware: "Ransomware",                           //Diff: 1 - Earns money (3) - Slightly increases respect (0.00005) - Slightly increases wanted level (0.0001)"
    Phishing: "Phishing",                               //Diff: 3.5 - Earns money (7.5) - Slightly increases respect (0.00008) - Slightly increases wanted level (0.003)"
    IdentityTheft: "Identity Theft",
    DDoSAttacks: "DDoS Attacks",
    PlantVirus: "Plant Virus",
    FraudAndCounterfeiting: "Fraud & Counterfeiting",
    MoneyLaundering: "Money Laundering",
    Cyberterrorism: "Cyberterrorism",
    EthicalHacking: "Ethical Hacking",
    //combat
    MugPeople: "Mug People",
    DealDrugs: "Deal Drugs",
    StrongarmCivilians: "Strongarm Civilians",
    RunACon: "Run a Con",
    ArmedRobbery: "Armed Robbery",
    TraffickIllegalArms: "Traffick Illegal Arms",
    ThreatenAndBlackmail: "Threaten & Blackmail",
    HumanTrafficking: "Human Trafficking",
    Terrorism: "Terrorism",
    VigilanteJustice: "Vigilante Justice",
    //training
    TrainCombat: "Train Combat",
    TrainHacking: "Train Hacking",
    TrainCharisma: "Train Charisma",
    //warfare
    TerritoryWarfare: "Territory Warfare",
}
/*
ns.gang.getTaskStats(name)                          1   Get stats of a task.
ns.gang.getTaskNames()                              0   List member task names.
*/
//tasks with data
export const GANG_TASKS = [{
    name: "Ransomware",
    desc: "Assign this gang member to create and distribute ransomware. Earns money - Slightly increases respect - Slightly increases wanted level",
    isCombat: false,
    isHacking: true,
    params: {
        baseRespect: 0.00005,
        baseWanted: 0.0001,
        baseMoney: 3,
        hackWeight: 100,
        difficulty: 1,
    },
}, {
    name: "Phishing",
    desc: "Assign this gang member to attempt phishing scams and attacks. Earns money - Slightly increases respect - Slightly increases wanted level",
    isCombat: false,
    isHacking: true,
    params: {
        baseRespect: 0.00008,
        baseWanted: 0.003,
        baseMoney: 7.5,
        hackWeight: 85,
        chaWeight: 15,
        difficulty: 3.5,
    },
}, {
    name: "Identity Theft",
    desc: "Assign this gang member to attempt identity theft. Earns money - Increases respect - Increases wanted level",
    isCombat: false,
    isHacking: true,
    params: {
        baseRespect: 0.0001,
        baseWanted: 0.075,
        baseMoney: 18,
        hackWeight: 80,
        chaWeight: 20,
        difficulty: 5,
    },
}, {
    name: "DDoS Attacks",
    desc: "Assign this gang member to carry out DDoS attacks. Increases respect - Increases wanted level",
    isCombat: false,
    isHacking: true,
    params: {
        baseRespect: 0.0004,
        baseWanted: 0.2,
        hackWeight: 100,
        difficulty: 8,
    },
}, {
    name: "Plant Virus",
    desc: "Assign this gang member to create and distribute malicious viruses. Increases respect - Increases wanted level",
    isCombat: false,
    isHacking: true,
    params: {
        baseRespect: 0.0006,
        baseWanted: 0.4,
        hackWeight: 100,
        difficulty: 12,
    },
}, {
    name: "Fraud & Counterfeiting",
    desc: "Assign this gang member to commit financial fraud and digital counterfeiting. Earns money - Slightly increases respect - Slightly increases wanted level",
    isCombat: false,
    isHacking: true,
    params: {
        baseRespect: 0.0004,
        baseWanted: 0.3,
        baseMoney: 45,
        hackWeight: 80,
        chaWeight: 20,
        difficulty: 20,
    },
}, {
    name: "Money Laundering",
    desc: "Assign this gang member to launder money. Earns money - Increases respect - Increases wanted level",
    isCombat: false,
    isHacking: true,
    params: {
        baseRespect: 0.001,
        baseWanted: 1.25,
        baseMoney: 360,
        hackWeight: 75,
        chaWeight: 25,
        difficulty: 25,
    },
}, {
    name: "Cyberterrorism",
    desc: "Assign this gang member to commit acts of cyberterrorism. Greatly increases respect - Greatly increases wanted level",
    isCombat: false,
    isHacking: true,
    params: {
        baseRespect: 0.01,
        baseWanted: 6,
        hackWeight: 80,
        chaWeight: 20,
        difficulty: 36,
    },
}, {
    name: "Ethical Hacking",
    desc: "Assign this gang member to be an ethical hacker for corporations. Earns money - Lowers wanted level",
    isCombat: false,
    isHacking: true,
    params: {
        baseWanted: -0.001,
        baseMoney: 3,
        hackWeight: 90,
        chaWeight: 10,
        difficulty: 1,
    },
}, {
    name: "Mug People",
    desc: "Assign this gang member to mug random people on the streets. Earns money - Slightly increases respect - Very slightly increases wanted level",
    isCombat: true,
    isHacking: false,
    params: {
        baseRespect: 0.00005,
        baseWanted: 0.00005,
        baseMoney: 3.6,
        strWeight: 25,
        defWeight: 25,
        dexWeight: 25,
        agiWeight: 10,
        chaWeight: 15,
        difficulty: 1,
    },
}, {
    name: "Deal Drugs",
    desc: "Assign this gang member to sell drugs. Earns money - Slightly increases respect - Slightly increases wanted level - Scales slightly with territory",
    isCombat: true,
    isHacking: false,
    params: {
        baseRespect: 0.00006,
        baseWanted: 0.002,
        baseMoney: 15,
        agiWeight: 20,
        dexWeight: 20,
        chaWeight: 60,
        difficulty: 3.5,
        territory: {
            money: 1.2,
            respect: 1,
            wanted: 1.15,
        },
    },
}, {
    name: "Strongarm Civilians",
    desc: "Assign this gang member to extort civilians in your territory. Earns money - Slightly increases respect - Increases wanted - Scales heavily with territory",
    isCombat: true,
    isHacking: false,
    params: {
        baseRespect: 0.00004,
        baseWanted: 0.02,
        baseMoney: 7.5,
        hackWeight: 10,
        strWeight: 25,
        defWeight: 25,
        dexWeight: 20,
        agiWeight: 10,
        chaWeight: 10,
        difficulty: 5,
        territory: {
            money: 1.6,
            respect: 1.1,
            wanted: 1.5,
        },
    },
}, {
    name: "Run a Con",
    desc: "Assign this gang member to run cons. Earns money - Increases respect - Increases wanted level",
    isCombat: true,
    isHacking: false,
    params: {
        baseRespect: 0.00012,
        baseWanted: 0.05,
        baseMoney: 45,
        strWeight: 5,
        defWeight: 5,
        agiWeight: 25,
        dexWeight: 25,
        chaWeight: 40,
        difficulty: 14,
    },
}, {
    name: "Armed Robbery",
    desc: "Assign this gang member to commit armed robbery on stores, banks and armored cars. Earns money - Increases respect - Increases wanted level",
    isCombat: true,
    isHacking: false,
    params: {
        baseRespect: 0.00014,
        baseWanted: 0.1,
        baseMoney: 114,
        hackWeight: 20,
        strWeight: 15,
        defWeight: 15,
        agiWeight: 10,
        dexWeight: 20,
        chaWeight: 20,
        difficulty: 20,
    },
}, {
    name: "Traffick Illegal Arms",
    desc: "Assign this gang member to traffick illegal arms. Earns money - Increases respect - Increases wanted level - Scales heavily with territory",
    isCombat: true,
    isHacking: false,
    params: {
        baseRespect: 0.0002,
        baseWanted: 0.24,
        baseMoney: 174,
        hackWeight: 15,
        strWeight: 20,
        defWeight: 20,
        dexWeight: 20,
        chaWeight: 25,
        difficulty: 32,
        territory: {
            money: 1.4,
            respect: 1.3,
            wanted: 1.25,
        },
    },
}, {
    name: "Threaten & Blackmail",
    desc: "Assign this gang member to threaten and blackmail high-profile targets. Earns money - Slightly increases respect - Slightly increases wanted level",
    isCombat: true,
    isHacking: false,
    params: {
        baseRespect: 0.0002,
        baseWanted: 0.125,
        baseMoney: 72,
        hackWeight: 25,
        strWeight: 25,
        dexWeight: 25,
        chaWeight: 25,
        difficulty: 28,
    },
}, {
    name: "Human Trafficking",
    desc: "Assign this gang member to engage in human trafficking operations. Earns money - Increases respect - Increases wanted level - Scales heavily with territory",
    isCombat: true,
    isHacking: false,
    params: {
        baseRespect: 0.004,
        baseWanted: 1.25,
        baseMoney: 360,
        hackWeight: 30,
        strWeight: 5,
        defWeight: 5,
        dexWeight: 30,
        chaWeight: 30,
        difficulty: 36,
        territory: {
            money: 1.5,
            respect: 1.5,
            wanted: 1.6,
        },
    },
}, {
    name: "Terrorism",
    desc: "Assign this gang member to commit acts of terrorism. Greatly increases respect - Greatly increases wanted level - Scales heavily with territory",
    isCombat: true,
    isHacking: false,
    params: {
        baseRespect: 0.01,
        baseWanted: 6,
        hackWeight: 20,
        strWeight: 20,
        defWeight: 20,
        dexWeight: 20,
        chaWeight: 20,
        difficulty: 36,
        territory: {
            money: 1,
            respect: 2,
            wanted: 2,
        },
    },
}, {
    name: "Vigilante Justice",
    desc: "Assign this gang member to be a vigilante and protect the city from criminals. Decreases wanted level",
    isCombat: true,
    isHacking: true,
    params: {
        baseWanted: -0.001,
        hackWeight: 20,
        strWeight: 20,
        defWeight: 20,
        dexWeight: 20,
        agiWeight: 20,
        difficulty: 1,
        territory: {
            money: 1,
            respect: 1,
            wanted: 0.9, // Gets harder with more territory
        },
    },
}, {
    name: "Train Combat",
    desc: "Assign this gang member to increase their combat stats (str, def, dex, agi)",
    isCombat: true,
    isHacking: true,
    params: {
        strWeight: 25,
        defWeight: 25,
        dexWeight: 25,
        agiWeight: 25,
        difficulty: 100,
    },
}, {
    name: "Train Hacking",
    desc: "Assign this gang member to train their hacking skills",
    isCombat: true,
    isHacking: true,
    params: {
        hackWeight: 100,
        difficulty: 45
    },
}, {
    name: "Train Charisma",
    desc: "Assign this gang member to train their charisma",
    isCombat: true,
    isHacking: true,
    params: {
        chaWeight: 100,
        difficulty: 8
    },
}, {
    name: "Territory Warfare",
    desc: "Members assigned to this task increase your gang's power. They will also fight for territory if 'Territory Clashes' are enabled. Gang members performing this task can be killed during clashes.",
    isCombat: true,
    isHacking: true,
    params: {
        hackWeight: 15,
        strWeight: 20,
        defWeight: 20,
        dexWeight: 20,
        agiWeight: 20,
        chaWeight: 5,
        difficulty: 5,
    },
}, ]
/*
ns.gang.getEquipmentCost(equipName)                 2   Get cost of equipment.
ns.gang.getEquipmentNames()                         0   List equipment names.
ns.gang.getEquipmentStats(equipName)                2   Get stats of an equipment.
ns.gang.getEquipmentType(equipName)                 2   Get type of an equipment.
*/
//list of gang equipment
export const GANG_EQUIPMENT = [
    //weapons
    {
        name: "Baseball Bat",
        upgType: "Weapon",
        cost: 1e6,
        mults: {
            str: 1.04,
            def: 1.04
        },
    }, {
        name: "Katana",
        upgType: "Weapon",
        cost: 12e6,
        mults: {
            str: 1.08,
            def: 1.08,
            dex: 1.08
        },
    }, {
        name: "Malorian-3516",
        upgType: "Weapon",
        cost: 25e6,
        mults: {
            str: 1.1,
            def: 1.1,
            dex: 1.1,
            agi: 1.1
        },
    }, {
        name: "Hansen-HA7",
        upgType: "Weapon",
        cost: 50e6,
        mults: {
            str: 1.12,
            def: 1.1,
            agi: 1.1
        },
    }, {
        name: "Arasaka-HJSH18",
        upgType: "Weapon",
        cost: 60e6,
        mults: {
            str: 1.2,
            def: 1.15
        },
    }, {
        name: "Militech-M251s",
        upgType: "Weapon",
        cost: 100e6,
        mults: {
            str: 1.25,
            def: 1.2
        },
    }, {
        name: "Nokota-D5",
        upgType: "Weapon",
        cost: 150e6,
        mults: {
            str: 1.3,
            def: 1.25
        },
    }, {
        name: "Techtronika-SPT32",
        upgType: "Weapon",
        cost: 225e6,
        mults: {
            str: 1.3,
            dex: 1.25,
            agi: 1.3
        },
    },

    //armor
    {
        name: "Bulletproof Vest",
        upgType: "Armor",
        cost: 2e6,
        mults: {
            def: 1.04
        },
    }, {
        name: "Full Body Armor",
        upgType: "Armor",
        cost: 5e6,
        mults: {
            def: 1.08
        },
    }, {
        name: "Liquid Body Armor",
        upgType: "Armor",
        cost: 25e6,
        mults: {
            def: 1.15,
            agi: 1.15
        },
    }, {
        name: "Graphene Plating Armor",
        upgType: "Armor",
        cost: 40e6,
        mults: {
            def: 1.2
        },
    },

    //vehicles
    {
        name: "Herrera Outlaw GTS",
        upgType: "Vehicle",
        cost: 3e6,
        mults: {
            agi: 1.04,
            cha: 1.04
        },
    }, {
        name: "Yaiba ASM-R250 Muramasa",
        upgType: "Vehicle",
        cost: 9e6,
        mults: {
            agi: 1.08,
            cha: 1.08
        },
    }, {
        name: "Rayfield Caliburn",
        upgType: "Vehicle",
        cost: 18e6,
        mults: {
            agi: 1.12,
            cha: 1.12
        },
    }, {
        name: "Quadra Sport R-7",
        upgType: "Vehicle",
        cost: 30e6,
        mults: {
            agi: 1.16,
            cha: 1.16
        },
    },

    //rootkits
    {
        name: "NUKE Rootkit",
        upgType: "Rootkit",
        cost: 5e6,
        mults: {
            hack: 1.05
        },
    }, {
        name: "Soulstealer Rootkit",
        upgType: "Rootkit",
        cost: 25e6,
        mults: {
            hack: 1.1
        },
    }, {
        name: "Demon Rootkit",
        upgType: "Rootkit",
        cost: 75e6,
        mults: {
            hack: 1.15
        },
    }, {
        name: "Hmap Node",
        upgType: "Rootkit",
        cost: 40e6,
        mults: {
            hack: 1.12
        },
    }, {
        name: "Jack the Ripper",
        upgType: "Rootkit",
        cost: 75e6,
        mults: {
            hack: 1.15
        },
    },

    //augmentations
    {
        name: "Bionic Arms",
        upgType: "Augmentation",
        cost: 10e9,
        mults: {
            str: 1.3,
            dex: 1.3
        },
    }, {
        name: "Bionic Legs",
        upgType: "Augmentation",
        cost: 10e9,
        mults: {
            agi: 1.6
        },
    }, {
        name: "Bionic Spine",
        upgType: "Augmentation",
        cost: 15e9,
        mults: {
            str: 1.15,
            def: 1.15,
            dex: 1.15,
            agi: 1.15
        },
    }, {
        name: "BrachiBlades",
        upgType: "Augmentation",
        cost: 20e9,
        mults: {
            str: 1.4,
            def: 1.4
        },
    }, {
        name: "Nanofiber Weave",
        upgType: "Augmentation",
        cost: 12e9,
        mults: {
            str: 1.2,
            def: 1.2
        },
    }, {
        name: "Synthetic Heart",
        upgType: "Augmentation",
        cost: 25e9,
        mults: {
            str: 1.5,
            agi: 1.5
        },
    }, {
        name: "Synfibril Muscle",
        upgType: "Augmentation",
        cost: 15e9,
        mults: {
            str: 1.3,
            def: 1.3
        },
    }, {
        name: "BitWire",
        upgType: "Augmentation",
        cost: 5e9,
        mults: {
            hack: 1.05
        },
    }, {
        name: "Neuralstimulator",
        upgType: "Augmentation",
        cost: 10e9,
        mults: {
            hack: 1.15
        },
    }, {
        name: "DataJack",
        upgType: "Augmentation",
        cost: 7.5e9,
        mults: {
            hack: 1.1
        },
    }, {
        name: "Graphene Bone Lacings",
        upgType: "Augmentation",
        cost: 50e9,
        mults: {
            str: 1.7,
            def: 1.7
        },
    },
]
/*
EquipmentStats		Object representing data representing a gang member equipment.
GangTaskStats		Object representing data representing a gang member task.

    agiWeight   number          Agility skill impact on task scaling
    baseMoney   number          Base money earned   
    baseRespect number          Base respect earned
    baseWanted  number          Base wanted earned
    chaWeight   number          Charisma skill impact on task scaling
    defWeight   number          Defense skill impact on task scaling
    desc        string          Task Description
    dexWeight   number          Dexterity skill impact on task scaling
    difficulty  number          Number representing the difficulty of the task
    hackWeight  number          Hacking skill impact on task scaling
    isCombat    boolean         Is a task of a combat gang
    isHacking   boolean         Is a task of a hacking gang
    name        string          Task name
    strWeight   number          Strength skill impact on task scaling
    territory   GangTerritory   Territory impact on task scaling

*/