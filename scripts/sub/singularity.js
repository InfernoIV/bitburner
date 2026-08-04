//This API requires Source-File 4 to use outside of BitNode 4. Additionally, outside of BitNode 4 the RAM cost of all these functions is multiplied by 16/4/1 based on Source-File 4 levels.

/*
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.singularity.md
Singularity		Singularity API
*/


import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"


const gyms = {
    "Sector-12": "Powerhouse Gym", //or "Iron Gym"?
    "Aevum": "Crush Fitness Gym", //or "Snap Fitness Gym"?
    "Volhaven": "Millenium Fitness Gym",
}

const universities = {
    "Sector-12": "Rothman University",
    "Aevum": "Summit University",
    "Volhaven": "ZB Institute of Technology",
}

const work_type = {
    FACTION: "FACTION",
    COMPANY: "COMPANY",
    CRIME: "CRIME",
    CREATE_PROGRAM: "CREATE_PROGRAM",
    STUDY: "CLASS",
    GRAFTING: "GRAFTING",
}


const focus_type = {
    MONEY: "money", //How much money is given
    KARMA: "karma", //Amount of karma lost for successfully committing this crime
    KILLS: "kills", //How many people die as a result of this crime
    HACKING: "hacking_exp", //hacking exp gained from crime	
    STRENGTH: "strength_exp", //strength exp gained from crime
    DEXTERITY: "dexterity_exp", //dexterity exp gained from crime
    AGILITY: "agility_exp", //agility exp gained from crime
    DEFENSE: "defense_exp", //defense exp gained from crime
    CHARISMA: "charisma_exp", //charisma exp gained from crime
    INTELLIGENCE: "intelligence_exp" //intelligence exp gained from crime
}

export class singularity_obj {
    constructor() {
        this.available = true
        this.tor_owned = false

        //config
        //min chance for a crime
        this.crime_min_chance = 0.65 //65% chance
        //ratio of SF12 to other SF (0.5 = 2 other SF for 1 SF12)
        this.sf_12_mult = 0.5
        //minimum skill
        this.skill_min = 50
        //minimum augments for reset
        this.augments_for_reset = 5
    }


    /*
    ls  0.2
    */
    init(ns, handles) {
        //disable logging
        ns.disableLog("singularity.installBackdoor")
        ns.disableLog("singularity.purchaseTor")
        ns.disableLog("singularity.purchaseProgram")
        ns.disableLog("singularity.upgradeHomeRam")
        //get tools
        const executables = ns.ls(CONSTANTS.SERVER.HOME, CONSTANTS.FILE_EXTENSION.EXECUTABLE)
        this.brute_ssh = executables.includes(CONSTANTS.TOOLS.HACKING.BRUTE_SSH)
        this.ftp_crack = executables.includes(CONSTANTS.TOOLS.HACKING.FTP_CRACK)
        this.relay_smtp = executables.includes(CONSTANTS.TOOLS.HACKING.RELAY_SMTP)
        this.http_worm = executables.includes(CONSTANTS.TOOLS.HACKING.HTTP_WORM)
        this.sql_inject = executables.includes(CONSTANTS.TOOLS.HACKING.SQL_INJECT)
        this.darknet = executables.includes(CONSTANTS.TOOLS.DARKNET)

        //debug
        log.info(ns, "Singularity", "Init complete")
    }


    /*
    singularity.connect 2   -> used by root
    manage          0
    upgrade_home    3
    manage_tor      2  
    manage_tools    2
    manage_factions 9
    manage_player   15.5
    */
    async manage(ns, handles) {
        //test
        await this.join_stanek(ns, handles.hasOwnProperty(CONSTANTS.HANDLE.STANEK_AVAILABLE))
        //upgrade home
        this.upgrade_home(ns)
        //check if we don't own tor
        if (!this.tor_owned) {
            //try to buy tor
            this.manage_tor(ns, handles.hasOwnProperty(CONSTANTS.HANDLE.DARKNET_AVAILABLE))
            //tor owned
        } else {
            //buy tools from tor
            this.manage_tools(ns)
        }
        //manage (joining of) faction (invites)
        this.manage_factions(ns)
        //manage player actions
        const travel_blocked = this.manage_player(ns, handles.hasOwnProperty(CONSTANTS.HANDLE.DARKNET), handles.hasOwnProperty(CONSTANTS.HANDLE.INTELLIGENCE))
        //check if we can travel
        if(!travel_blocked) {
            //manage player location
            this.manage_location(ns)
        }
        //manage augments
        this.manage_augments(ns)
        //install augments
        this.install_augments(ns)
    }


    /*
    singularity.purchaseTor     2
    */
    //function that buys tor
    manage_tor(ns, darknet_available) {
        //check if it is permanently obtained
        if (darknet_available) {
            //set flag
            this.tor_owned = true
            //darknet is available as well
            this.darknet = true

        //if we can buy / have bought TOR
        } else if (ns.singularity.purchaseTor()) {
            //set flag
            this.tor_owned = true
        }
    }

    /*
    
    singularity.purchaseProgram 2
    */
    manage_tools(ns) {
        //if darknet tools is not yet bought
        if (!this.darknet) {
            //try to buy
            if (ns.singularity.purchaseProgram(CONSTANTS.TOOLS.DARKNET)) {
                //log 
                log.info(ns, "Singularity", "Bought '" + CONSTANTS.TOOLS.DARKNET + "'", true)
                //set flag
                this.darknet = true
            }
        }
        if (!this.brute_ssh) {
            //try to buy
            if (ns.singularity.purchaseProgram(CONSTANTS.TOOLS.HACKING.BRUTE_SSH)) {
                //log 
                log.info(ns, "Singularity", "Bought '" + CONSTANTS.TOOLS.HACKING.BRUTE_SSH + "'", true)
                //set flag
                this.brute_ssh = true
            }
        }
        if (!this.ftp_crack) {
            //try to buy
            if (ns.singularity.purchaseProgram(CONSTANTS.TOOLS.HACKING.FTP_CRACK)) {
                //log 
                log.info(ns, "Singularity", "Bought '" + CONSTANTS.TOOLS.HACKING.FTP_CRACK + "'", true)
                //set flag
                this.ftp_crack = true
            }
        }
        if (!this.relay_smtp) {
            //try to buy
            if (ns.singularity.purchaseProgram(CONSTANTS.TOOLS.HACKING.RELAY_SMTP)) {
                //log 
                log.info(ns, "Singularity", "Bought '" + CONSTANTS.TOOLS.HACKING.RELAY_SMTP + "'", true)
                //set flag
                this.relay_smtp = true
            }
        }
        if (!this.http_worm) {
            //try to buy
            if (ns.singularity.purchaseProgram(CONSTANTS.TOOLS.HACKING.HTTP_WORM)) {
                //log 
                log.info(ns, "Singularity", "Bought '" + CONSTANTS.TOOLS.HACKING.HTTP_WORM + "'", true)
                //set flag
                this.http_worm = true
            }
        }
        if (!this.sql_inject) {
            //try to buy
            if (ns.singularity.purchaseProgram(CONSTANTS.TOOLS.HACKING.SQL_INJECT)) {
                //log 
                log.info(ns, "Singularity", "Bought '" + CONSTANTS.TOOLS.HACKING.SQL_INJECT + "'", true)
                //set flag
                this.sql_inject = true
            }
        }
    }


    /*
    singularity.upgradeHomeRam  3
    */
    //upgrade home
    upgrade_home(ns) {
        //Upgrade home computer RAM.
        if (ns.singularity.upgradeHomeRam()) {
            //get server
            const server = ns.getServer(CONSTANTS.SERVER.HOME)
            //log
            log.success(ns, "Singularity", "Upgraded home RAM to " + server.maxRam, true)
        }
        //Upgrade home computer cores.
        //ns.singularity.upgradeHomeCores()
    }


    /*
    singularity.travelToCity    
    singularity.goToLocation    5
    */
    //function that manages the travelling of the player to unlock factions
    manage_location(ns) {
        //get player
        const player = ns.getPlayer()
        //get factions
        const factions_joined = player.factions
        //set target city
        var target_city = ""
        
        //TODO: how to manage with infiltrations?

       

        //get augments
        const augments_owned = ns.singularity.getOwnedAugmentations(true)
       

        //city factions
        //loop for ease of breaking
        while(true) {
            //if sector 12 has not been joined and there are still augments left    (15e6)
            if (!factions_joined.includes("Sector-12") && this.get_augments_left(ns, "Sector-12").length > 0) {
                //set target city
                target_city = "Sector-12"
                //stop looking
                break                
            }
            //if aevum has not been joined and there are still augments left    (20e6)
            if (!factions_joined.includes("Aevum") && this.get_augments_left(ns, "Aevum").length > 0) {
                //set target city
                target_city = "Aevum"
                //stop looking
                break
            }
            //if ishma has not been joined and there are still augments left    (20e6)
            if (!factions_joined.includes("Ishima") && this.get_augments_left(ns, "Ishima").length > 0 && !factions_joined.includes("Sector-12") && !factions_joined.includes("Aevum")) {
                //set target city
                target_city = "Ishima"
                //stop looking
                break
            }
            //if chongqing has not been joined and there are still augments left    (20e6)
            if (!factions_joined.includes("Chongqing") && this.get_augments_left(ns, "Chongqing").length > 0 && !factions_joined.includes("Sector-12") && !factions_joined.includes("Aevum")) {
                //set target city
                target_city = "Chongqing"
                //stop looking
                break
            }
            //if new tokyo has not been joined and there are still augments left    (20e6)
            if (!factions_joined.includes("New Tokyo") && this.get_augments_left(ns, "New Tokyo").length > 0 && !factions_joined.includes("Sector-12") && !factions_joined.includes("Aevum")) {
                //set target city
                target_city = "New Tokyo"
                //stop looking
                break
            }            
            //if volhaven has not been joined and there are still augments left (50e6)
            if (!factions_joined.includes("Volhaven") && this.get_augments_left(ns, "Volhaven").length > 0 && !factions_joined.includes("Sector-12") && !factions_joined.includes("Aevum") && !factions_joined.includes("Ishima") && !factions_joined.includes("Chongqing") && !factions_joined.includes("New Tokyo")) {
                //set target city
                target_city = "Volhaven"
                //stop looking
                break
            }
            //exit loop
            break
        }
        
        //if we don't have a target city (set for a city faction)
        if (target_city == "") {
            //loop for ease of breaking
            while(true) {
                //hacking 50, 1e6 money
                if(!factions_joined.includes("Tian Di Hui")){
                    //check if player is in a correct location
                    if (player.city != "Chongqing" && player.city != "New Tokyo" && player.city != "Ishima") {
                        //set to chongqing
                        target_city = "Chongqing"
                    }
                    break
                }
                //combat 75, karma -18
                if(!factions_joined.includes("Tetrads")){   
                    //check if player is in a correct location
                    if (player.city != "Chongqing" && player.city != "New Tokyo" && player.city != "Ishima") {
                        //set to chongqing
                        target_city = "Chongqing"
                    }
                    break
                }
                //combat 100, karma -90
                if(!factions_joined.includes("The Syndicate")){
                    //check if player is in a correct location
                    if (player.city != "Sector-12" && player.city != "Aevum") {
                        //set to sector-12
                        target_city = "Sector-12"
                    }
                    break
                }
                //hacking 300, combat 300, kills 5, karma -45
                if(!factions_joined.includes("The Dark Army")){
                    //check if player is in a correct location
                    if (player.city != "Chongqing") {
                        //set to chongqing
                        target_city = "Chongqing"
                    }
                    break
                }
                //exit loop
                break
            }
        }
        //if we have a target city
        if (target_city != "") {
            //if we are not in the target city
            if (player.city != target_city) {
                //travel to city
                //ns.singularity.travelToCity(target_city)
            }
        }
    }
    

    async join_stanek(ns, stanek_available) {
        //if not available
        if (!stanek_available) {
            //stop
            return
        }
        //get player
        const player = ns.getPlayer()
        //church of the machine god in chongqing with SF13(.1) and augmentations 0
        if (player.factions.includes("Church of the Machine God")) {
            //success
            return true
        //not joined
        } else {    
            //set target city
            const target_city = "Chongqing"
            //if we are not in the target city
            if (player.location != target_city) {
                //if travel to city failed
                if(!ns.singularity.travelToCity(target_city)) {
                    //stop
                    return false
                }
            }
            //move to the church
            ns.singularity.goToLocation("Church of the Machine God")
            //wait a little bit
            await ns.sleep(CONSTANTS.TIME.WAIT)
            //get invites
            const invites = ns.singularity.checkFactionInvitations()
            //if we have the invite we seek
            if (invites.includes("Church of the Machine God")) {
                //join faction
                return ns.singularity.joinFaction("Church of the Machine God")
            }
        }        
        //stop as failsafe if it fails
        return false
    }
    


    //function that returns the augments that are still left
    get_augments_left(ns, faction) {
        //get augments from faction
        const augments = ns.singularity.getAugmentationsFromFaction(faction)
        //get augments owned
        const augments_owned = ns.singularity.getOwnedAugmentations(true)
        //get augments left
        const augments_left = augments.filter(augment => !augments_owned.includes(augment))
        //return augments left
        return augments_left
    }

    //function that manages the player (studying, working for factions, working for companies, committing crimes)
    manage_player(ns, darknet_started, formulas_available) {
        //work towards gang: 30 combat (str, def, dex, con) to unlock Slum Snakes, or ?? hacking + ?? tooling to unlock NiteSec
        if (this.study(ns)) return true
        //if darknet has not been started / obtainted
        if (this.darknet == false) {
            //get money
            this.commit_crime(ns)
            //stop
            return false
        }
        //work for faction (if available)
        if (this.work_for_faction(ns, formulas_available)) return false
        //work for company (if available)
        if (this.work_for_company(ns, formulas_available)) return false
        //get money
        this.commit_crime(ns)
        return false
        /*
        bitnode multipliers can be 
        CompanyWorkMoney: 0,
        CrimeMoney: 0,
        HacknetNodeMoney: 0,
        ManualHackMoney: 0,
        ScriptHackMoney: 0.3,
        ScriptHackMoneyGain: 0,
        CodingContractMoney: 0,
        */
    }

    /*
    singularity.getAugmentationsFromFaction 5
    singularity.getOwnedAugmentations       5
    singularity.purchaseAugmentation        5
    singularity.installAugmentations        5
    singularity.getAugmentationPrice        2.5
    */
    //function that manages augments (buying the most expensive one first before going to the next)    
    manage_augments(ns) {
        //create a list of augments and their prices
        var augments = new Map()
        //get bought augments
        var augments_bought = ns.singularity.getOwnedAugmentations(true)
        //get factions
        const factions = ns.getPlayer().factions
        //for each faction
        for (const faction of factions) {
            //get augments
            const augments_faction = ns.singularity.getAugmentationsFromFaction(faction)
            //for each augment
            for (const augment of augments_faction) {
                //if not owned or is NeuroFlux Governor (can be stacked)
                if (!augments_bought.includes(augment) || augment == CONSTANTS.AUGMENT.NFG) {
                    //get the price
                    var price = ns.singularity.getAugmentationPrice(augment)
                    //save the price
                    augments.set(augment, {"faction": faction, "price": price})
                }
            }
        }
        //sort the augments (on key = highest cost)
        const augments_sorted = new Map([...augments.entries()].sort((a, b) => b[1].price - a[1].price))        
        //for each augment we have saved
        for (const augment of augments_sorted.keys()) {    
            //try to buy augment
            const success = ns.singularity.purchaseAugmentation(augments_sorted.get(augment).faction, augment)
            //if able to buy most expensive augment
            if (success) {
                //log
                log.success(ns, "Singularity", "Bought augment: '" + augment + "'", true)
            //failed to buy
            } else {
                //stop
                return
            }
        }
    }


    //function that checks if we want to install augments
    install_augments(ns) {
        //refresh bought augments
        var augments_bought = ns.singularity.getOwnedAugmentations(true)
        //get augments installed
        var augments_owned = ns.singularity.getOwnedAugmentations(false)
        //if we have bought at least 5 augments
        if ((augments_bought.length - augments_owned.length) >= this.augments_for_reset) {
            //get factions
            const factions = ns.getPlayer().factions
            //get best rep
            var best_rep = 0
            //get best faction
            var best_faction = ""
            //for each faction
            for (const faction of factions) {
                //get rep
                const rep = ns.singularity.getFactionRep(faction)
                //check if better than what we have
                if (rep > best_rep) {
                    //save rep
                    best_rep = rep
                    //save faction
                    best_faction = faction
                }
            }
            //placeholder
            var success = true
            //keep trying
            while (success) {
                //try to buy NFG
                success = ns.singularity.purchaseAugmentation(best_faction, AUGMENT.NFG)
            }
            //install augments
            ns.singularity.installAugmentations(CONSTANTS.SCRIPT.BOOT)
        }
    }


    /*
    getPlayer   
    */
    study(ns) {
        //get skills
        const skills = ns.getPlayer().skills
        //hacking < combat < charisma
        if (skills.hacking < this.skill_min) {
            this.perform_action(ns, work_type.STUDY, "Algorithms")
            return true

        } else if (skills.strength < this.skill_min) {
            this.perform_action(ns, work_type.STUDY, "str")
            return true

        } else if (skills.defense < this.skill_min) {
            this.perform_action(ns, work_type.STUDY, "def")
            return true

        } else if (skills.dexterity < this.skill_min) {
            this.perform_action(ns, work_type.STUDY, "dex")
            return true

        } else if (skills.agility < this.skill_min) {
            this.perform_action(ns, work_type.STUDY, "agi")
            return true

        } else if (skills.charisma < this.skill_min) {
            this.perform_action(ns, work_type.STUDY, "Leadership")
            return true

        } else {
            return false
        }
    }


    /*
    Singularity.getFactionFavor 1
    */
    work_for_faction(ns, formulas_available) {
        //get augments owned
        const augments_owned = ns.singularity.getOwnedAugmentations(true)
        //get factions
        const factions = ns.getPlayer().factions
        //variable to fill
        var target_faction = ""
        //for each faction
        for (const faction of factions) {
            //save highest rep needed
            var rep_highest = 0
            //check if we have enough rep for the augments
            //get augmnets
            const augments = ns.singularity.getAugmentationsFromFaction(faction)
            //for each augment the faction offers
            for (const augment of augments) {
                //if neurflux governor
                if (augment == CONSTANTS.AUGMENT.NFG) {
                    //ignore
                    continue
                }
                //if not owned
                if (!augments_owned.includes(augment)) {
                    //get rep requirement
                    const augment_rep = ns.singularity.getAugmentationRepReq(augment)
                    //if higher than what we have saved
                    if (augment_rep > rep_highest) {
                        //save the rep
                        rep_highest = augment_rep
                    }
                }
            }
            //get rep
            const rep = ns.singularity.getFactionRep(faction)
            //if we have enough rep for all augments
            if (rep >= rep_highest) {
                //go to next
                continue
            }
            //get favor
            const favor = ns.singularity.getFactionFavor(faction)
            const rep_to_favor = Math.log1p(rep / 25000) / 0.019802627296179712
            const favor_for_donate = 150
            const favor_needed = favor_for_donate - favor - rep_to_favor

            //if we need to get more rep or favor
            if (favor_needed > 0) {
                //set as target faction
                target_faction = faction
                //stop
                break
            }
        }
        //if a target faction is set
        if (target_faction != "") {
            //set to work for faction
            this.perform_action(ns, work_type.FACTION, target_faction, formulas_available)
            //indicate sucess
            return true
        }
        //indicate failure
        return false
    }


    //function that determines which company to work for
    //company work is improved by SF11 (if you have at least 1), SF15 (if you have at least 2)
    //jobStatReqOffset: lower is better
    //exp & money multiplier: higher is better
    //TODO: do we need to be in the city to apply for the job? e.g. Backman & Associates is in Aevum, but we are in Sector-12, can we apply for the job?
    work_for_company(ns, formulas_available) {
        //faction name, company name, server name
        const company_factions = {        
            //jobStatReqOffset: 224            
            "Blade Industries": { company: "Blade Industries", hostname: "blade" },                             //exp & money multiplier: 2.75      hacking: 900 <-> 1200 (5 ports) 
            "Bachman & Associates": { company: "Bachman & Associates", hostname: "b-and-a" },                   //exp & money multiplier: 2.6       hacking: 900 <-> 1150 (5 ports)     
            "Four Sigma": { company: "Four Sigma", hostname: "4sigma" },                                        //exp & money multiplier: 2.5       hacking: 900 <-> 1250 (5 ports)
            "OmniTek Incorporated": { company: "OmniTek Incorporated", hostname: "omnitek" },                   //exp & money multiplier: 2.25      hacking: 900 <-> 1100 (5 ports)
            "Clarke Incorporated": { company: "Clarke Incorporated", hostname: "clarkinc" },                    //exp & money multiplier: 2.25      hacking: 950 <-> 1250 (5 ports)
            "Fulcrum Secret Technologies": { company: "Fulcrum Secret Technologies", hostname: "fulcrumtech" }, //exp & money multiplier: 2         hacking: 950 <-> 1250 (5 ports)
            "KuaiGong International": { company: "KuaiGong International", hostname: "kuai-gong" },             //exp & money multiplier: 2         hacking: 950 <-> 1300 (5 ports)
            //jobStatReqOffset: 249
            "NWO": { company: "NWO", hostname: "nwo" },                                                         //exp & money multiplier: 2.75      hacking: 950 <-> 1300 (5 ports)  
            "ECorp": { company: "ECorp", hostname: "ecorp" },                                                   //exp & money multiplier: 3         hacking: 1050 <-> 1400 (5 ports)
            "MegaCorp": { company: "MegaCorp", hostname: "megacorp" },                                          //exp & money multiplier: 3         hacking: 1100 <-> 1350 (5 ports)
            
        }
        //set the required reputation to 400k
        const company_reputation_needed_for_faction = 400000
        //get factions
        const factions_joined = ns.getPlayer().factions
        //variable to fill
        var target_company = ""
        //for each company faction
        for (const faction in company_factions) {
            //get info
            const info = company_factions[faction]
            //if faction is already joined
            if (factions_joined.includes(faction)) {
                //go to next
                continue
            }
            //check if the company server is backdoored
            const backdoor_installed = ns.getServer(info.hostname).backdoorInstalled
            //calc the rep needed (lowered when backdoor is installed)
            const rep_needed = backdoor_installed ? company_reputation_needed_for_faction * 0.75 : company_reputation_needed_for_faction
            //get company
            const company = info.company
            //if the company reputation is not enough 
            if (ns.singularity.getCompanyRep(company) < rep_needed) {
                //set as target
                target_company = company
                //stop
                break
            }
        }
        //if there is an company set
        if (target_company != "") {
            //work for company
            this.perform_action(ns, work_type.COMPANY, target_company, formulas_available)
            //indicate success
            return true
        }
        //indicate failure
        return false
    }


    /*
    getCrimeChance(crime)       5
    getCrimeStats(crime)        5
    commitCrime(crime, focus)   5
    */
    //commit crime
    commit_crime(ns) {
        //save best crime
        var best_crime = "Mug"
        //best score
        var best_score = 0
        //get crimes
        for (const name in ns.enums.CrimeType) {
            //get the actual crime
            const crime = ns.enums.CrimeType[name]
            //get chrime change
            const crime_chance = ns.singularity.getCrimeChance(crime)
            //check for chance
            if (crime_chance >= 0.66) {
                //get crime stats
                const crime_stats = ns.singularity.getCrimeStats(crime)
                //calc score (money / time)
                var score = crime_stats.money / crime_stats.time
                //if better than what we have
                if (score > best_score) {
                    //set score
                    best_score = score
                    //set crime
                    best_crime = crime
                }
            }
        }
        //default to mug for now
        this.perform_action(ns, work_type.CRIME, best_crime)
    }


    /*
    singularity.getCurrentWork      0.5
    singularity.commitCrime         5
    singularity.universityCourse    2
    Singularity.gymWorkout          2
    singularity.workForFaction      3
    singularity.workForCompany      3
    singularity.applyToCompany      3
    singularity.getFactionWorkTypes 1
    19.5
    */
   /*
   function that tries to perform the action, if not already performing it (also guarding if work shouldn't be switched (e.g. grafting))
   */
    perform_action(ns, type, activity, formulas_available=false) {
        //get player
        const player = ns.getPlayer()
        //flag to keep track if we need to switch
        var flag_switch_work = false
        //get current work
        const current_work = ns.singularity.getCurrentWork()
        //if not working
        if (current_work == null) {
            //set flag
            flag_switch_work = true
            //working
        } else {
            //if different work is required
            if (current_work.type != type) {
                //set flag
                flag_switch_work = true
            } else {
                //depending on the type
                switch (type) {
                    case work_type.FACTION:
                        flag_switch_work = (activity != current_work.factionName);
                        break

                    case work_type.COMPANY:
                        flag_switch_work = (activity != current_work.companyName);
                        break

                    case work_type.CRIME:
                        flag_switch_work = (activity != current_work.crimeType);
                        break

                    case work_type.CREATE_PROGRAM:
                        flag_switch_work = (activity != current_work.programName);
                        break

                    case work_type.STUDY:
                        flag_switch_work = (activity != current_work.classType);
                        break

                    case work_type.GRAFTING:
                        flag_switch_work = (activity != current_work.augmentation);
                        break

                    default:
                        log.error(ns, "Singularity", "Uncaught work_type 1: '" + work_type + "'")
                }
            }
        }
        //if we need to switch
        if (flag_switch_work == true) {
            //depending on the type
            switch (type) {
                case work_type.FACTION:
                    //get faction work types
                    const faction_work_type = ns.singularity.getFactionWorkTypes(activity)
                    //TODO: improve by checking which work type is best for the player (e.g. hacking, combat, etc.)
                    if(formulas_available) {
                        //ns.formulas.factionGains(player, faction_work_type[0], 1)
                        //https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.workformulas.factiongains.md
                    }
                    ns.singularity.workForFaction(activity, faction_work_type[0], true)
                    return

                case work_type.COMPANY:                
                    //determine job field
                    var jobfield = "Software" //Software (Hacking 85%, Char 15%) -> CTO (Chief Technology Officer)
                    if(formulas_available) {
                        //ns.formulas.companyGains()
                        //https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.workformulas.factiongains.md
                    }

                    //get player stats
                    const player_stats = ns.getPlayer().skills
                    //if charisma is higher than hacking, then go for business instead: Business (Cha 90%, Hacking 10%) -> CEO (Chief Executive Officer)
                    if (player_stats.charisma > player_stats.hacking) {
                        //set to business
                        jobfield = "Business"
                    }
                    //apply to company or try to get promotion
                    ns.singularity.applyToCompany(activity, jobfield)
                    //work for company
                    ns.singularity.workForCompany(activity, true)
                    //stop
                    return

                case work_type.CRIME:
                    //commit crime (calc for best crime has already happened)
                    ns.singularity.commitCrime(activity, true)
                    //stop
                    return

                case work_type.STUDY:
                    //get city
                    const city = ns.getPlayer().city
                    //guard clause: if not in a correct city
                    if (city != "Sector-12" && city != "Aevum" && city != "Volhaven") {
                        //stop (for now)
                        return
                    }
                    //get university
                    const university = universities[city]
                    //get gym
                    const gym = gyms[city]
                    //check for stats
                    switch (activity) {
                        case "hacking":
                        case "Algorithms":
                            ns.singularity.universityCourse(university, "Algorithms", true)
                            return

                        case "str":
                            ns.singularity.gymWorkout(gym, "str", true)
                            return

                        case "def":
                            ns.singularity.gymWorkout(gym, "def", true)
                            return

                        case "dex":
                            ns.singularity.gymWorkout(gym, "dex", true)
                            return

                        case "agi":
                            ns.singularity.gymWorkout(gym, "agi", true)
                            return

                        case "charisma":
                        case "Leadership":
                            ns.singularity.universityCourse(university, "Leadership", true)
                            return

                        default:
                            log.error(ns, "Singularity", "Uncaught study activity: '" + JSON.stringify(activity) +
                                "'")
                    }

                case work_type.CREATE_PROGRAM:
                    //ns.singularity.createProgram()
                    return

                case work_type.GRAFTING:
                    //skip for now
                    return

                default:
                    log.error(ns, "Singularity", "Uncaught work_type 2: '" + work_type + "'")
            }
        }
    }


    /*
    singularity.checkFactionInvitations     3
    singularity.joinFaction                 3
    singularity.getFactionEnemies           3
    */
    manage_factions(ns) {
        //get augments owned
        const augments_owned = ns.singularity.getOwnedAugmentations(true) //ns.getResetInfo().ownedAugs
        //for each invite
        for (const invite of ns.singularity.checkFactionInvitations()) {
            //get enemies
            const enemies = ns.singularity.getFactionEnemies(invite)
            //log.info(ns, "Singularity", "enemies: '" + JSON.stringify(enemies) + "' (" + + ")")
            //check for no enemies
            if (enemies.length > 1) {
                //set flag to keep track
                var flag_augments_remaining = false
                //get augmnets
                const augments = ns.singularity.getAugmentationsFromFaction(invite)
                //for each augment the faction offers
                for (const augment of augments) {
                    //if neurflux governor
                    if (augment == CONSTANTS.AUGMENT.NFG) {
                        //ignore
                        continue
                    }
                    //if not owned
                    if (!augments_owned.includes(augment)) {
                        //set flag
                        flag_augments_remaining = true
                        //stop
                        break
                    }
                }
                //if no augments are remaining
                if (flag_augments_remaining == false) {
                    //go to next faction
                    continue
                }
            }
            //join faction
            ns.singularity.joinFaction(invite)
        }
    }

    //end of object
}



/*

/*
Faction 'Illuminati': '[{"type":"numAugmentations","numAugmentations":30},{"type":"money","money":150000000000},{"type":"skills","skills":{"hacking":1500}},{"type":"skills","skills":{"strength":1200}},{"type":"skills","skills":{"defense":1200}},{"type":"skills","skills":{"dexterity":1200}},{"type":"skills","skills":{"agility":1200}}]'
Faction 'Daedalus': '[{"type":"numAugmentations","numAugmentations":30},{"type":"money","money":100000000000},{"type":"someCondition","conditions":[{"type":"skills","skills":{"hacking":2500}},{"type":"skills","skills":{"strength":1500,"defense":1500,"dexterity":1500,"agility":1500}}]}]'
Faction 'The Covenant': '[{"type":"numAugmentations","numAugmentations":20},{"type":"money","money":75000000000},{"type":"skills","skills":{"hacking":850}},{"type":"skills","skills":{"strength":850}},{"type":"skills","skills":{"defense":850}},{"type":"skills","skills":{"dexterity":850}},{"type":"skills","skills":{"agility":850}}]'

Faction 'ECorp': '[{"type":"employedBy","company":"ECorp"},{"type":"companyReputation","company":"ECorp","reputation":400000}]'
Faction 'MegaCorp': '[{"type":"employedBy","company":"MegaCorp"},{"type":"companyReputation","company":"MegaCorp","reputation":400000}]'
Faction 'Bachman & Associates': '[{"type":"employedBy","company":"Bachman & Associates"},{"type":"companyReputation","company":"Bachman & Associates","reputation":400000}]'
Faction 'Blade Industries': '[{"type":"employedBy","company":"Blade Industries"},{"type":"companyReputation","company":"Blade Industries","reputation":400000}]'
Faction 'NWO': '[{"type":"employedBy","company":"NWO"},{"type":"companyReputation","company":"NWO","reputation":400000}]'
Faction 'Clarke Incorporated': '[{"type":"employedBy","company":"Clarke Incorporated"},{"type":"companyReputation","company":"Clarke Incorporated","reputation":400000}]'
Faction 'OmniTek Incorporated': '[{"type":"employedBy","company":"OmniTek Incorporated"},{"type":"companyReputation","company":"OmniTek Incorporated","reputation":400000}]'
Faction 'Four Sigma': '[{"type":"employedBy","company":"Four Sigma"},{"type":"companyReputation","company":"Four Sigma","reputation":400000}]'
Faction 'KuaiGong International': '[{"type":"employedBy","company":"KuaiGong International"},{"type":"companyReputation","company":"KuaiGong International","reputation":400000}]'
Faction 'Fulcrum Secret Technologies': '[{"type":"employedBy","company":"Fulcrum Technologies"},{"type":"companyReputation","company":"Fulcrum Technologies","reputation":400000},{"type":"backdoorInstalled","server":"fulcrumassets"}]'

Faction 'BitRunners': '[{"type":"backdoorInstalled","server":"run4theh111z"}]'
Faction 'The Black Hand': '[{"type":"backdoorInstalled","server":"I.I.I.I"}]'
Faction 'NiteSec': '[{"type":"backdoorInstalled","server":"avmnite-02h"}]'
Faction 'CyberSec': '[{"type":"backdoorInstalled","server":"CSEC"}]'

Faction 'Aevum': '[{"type":"city","city":"Aevum"},{"type":"money","money":40000000}]'
Faction 'Chongqing': '[{"type":"city","city":"Chongqing"},{"type":"money","money":20000000}]'
Faction 'Ishima': '[{"type":"city","city":"Ishima"},{"type":"money","money":30000000}]'
Faction 'New Tokyo': '[{"type":"city","city":"New Tokyo"},{"type":"money","money":20000000}]'
Faction 'Sector-12': '[{"type":"city","city":"Sector-12"},{"type":"money","money":15000000}]'
Faction 'Volhaven': '[{"type":"city","city":"Volhaven"},{"type":"money","money":50000000}]'

Faction 'Speakers for the Dead': '[{"type":"not","condition":{"type":"employedBy","company":"Central Intelligence Agency"}},{"type":"not","condition":{"type":"employedBy","company":"National Security Agency"}},{"type":"skills","skills":{"hacking":100}},{"type":"skills","skills":{"strength":300}},{"type":"skills","skills":{"defense":300}},{"type":"skills","skills":{"dexterity":300}},{"type":"skills","skills":{"agility":300}},{"type":"numPeopleKilled","numPeopleKilled":30},{"type":"karma","karma":-45}]'
Faction 'The Dark Army': '[{"type":"city","city":"Chongqing"},{"type":"not","condition":{"type":"employedBy","company":"Central Intelligence Agency"}},{"type":"not","condition":{"type":"employedBy","company":"National Security Agency"}},{"type":"skills","skills":{"hacking":300}},{"type":"skills","skills":{"strength":300}},{"type":"skills","skills":{"defense":300}},{"type":"skills","skills":{"dexterity":300}},{"type":"skills","skills":{"agility":300}},{"type":"numPeopleKilled","numPeopleKilled":5},{"type":"karma","karma":-45}]'
Faction 'The Syndicate': '[{"type":"someCondition","conditions":[{"type":"city","city":"Aevum"},{"type":"city","city":"Sector-12"}]},{"type":"not","condition":{"type":"employedBy","company":"Central Intelligence Agency"}},{"type":"not","condition":{"type":"employedBy","company":"National Security Agency"}},{"type":"money","money":10000000},{"type":"skills","skills":{"hacking":200}},{"type":"skills","skills":{"strength":200}},{"type":"skills","skills":{"defense":200}},{"type":"skills","skills":{"dexterity":200}},{"type":"skills","skills":{"agility":200}},{"type":"karma","karma":-90}]'
Faction 'Silhouette': '[{"type":"someCondition","conditions":[{"type":"jobTitle","jobTitle":"Chief Technology Officer"},{"type":"jobTitle","jobTitle":"Chief Financial Officer"},{"type":"jobTitle","jobTitle":"Chief Executive Officer"}]},{"type":"money","money":15000000},{"type":"karma","karma":-22}]'
Faction 'Tetrads': '[{"type":"someCondition","conditions":[{"type":"city","city":"Chongqing"},{"type":"city","city":"New Tokyo"},{"type":"city","city":"Ishima"}]},{"type":"skills","skills":{"strength":75}},{"type":"skills","skills":{"defense":75}},{"type":"skills","skills":{"dexterity":75}},{"type":"skills","skills":{"agility":75}},{"type":"karma","karma":-18}]'
Faction 'Slum Snakes': '[{"type":"skills","skills":{"strength":30}},{"type":"skills","skills":{"defense":30}},{"type":"skills","skills":{"dexterity":30}},{"type":"skills","skills":{"agility":30}},{"type":"money","money":1000000},{"type":"karma","karma":-9}]'

Faction 'Tian Di Hui': '[{"type":"someCondition","conditions":[{"type":"city","city":"Chongqing"},{"type":"city","city":"New Tokyo"},{"type":"city","city":"Ishima"}]},{"type":"skills","skills":{"hacking":50}},{"type":"money","money":1000000}]'


Faction 'Bladeburners': '[{"type":"someCondition","conditions":[{"type":"someCondition","conditions":[{"type":"bitNodeN","bitNodeN":6},{"type":"sourceFile","sourceFile":6}]},{"type":"someCondition","conditions":[{"type":"bitNodeN","bitNodeN":7},{"type":"sourceFile","sourceFile":7}]}]},{"type":"bladeburnerRank","bladeburnerRank":25}]'
Faction 'Church of the Machine God': '[{"type":"someCondition","conditions":[{"type":"bitNodeN","bitNodeN":13},{"type":"sourceFile","sourceFile":13}]},{"type":"numAugmentations","numAugmentations":0},{"type":"location","location":"Church of the Machine God"}]'
Faction 'Shadows of Anarchy': '[{"type":"numInfiltrations","numInfiltrations":1}]'
*






//function that checks for bitnode destruction
export async function perform_destruction(ns) {
    //check if we are able to start destroying at all
    if (ns.singularity.getOwnedAugmentations(purchased).includes("The Red Pill")) {
        //get hacking level
        const hacking_level = ns.getHackingLevel()
        //calc the required hacking level
        const required_hacking_level = await evaluate.exec(ns, "ns.getBitNodeMultipliers()").WorldDaemonDifficulty *
            5000
        //get the next black op (standard not null)
        const next_black_op = "."
        //get the map of source files owned
        var owned_source_files = await evaluate.exec(ns, "ns.getResetInfo()").ownedSF
        //if we have access to the bladeburner API
        if (owned_source_files.has(6) || owned_source_files.has(7)) {
            //get the next black op
            next_black_op = await evaluate.exec(ns, "ns.Bladeburner.getNextBlackOp()")
        }
        //check for hacking level or bladeburner final black op complete
        if (hacking_level >= required_hacking_level || next_black_op == null) {
            //get next target bitnode
            const next_bitnode = await determine_next_bitnode(ns)
            //destroy bitnode
            await evaluate.exec(ns, "ns.singularity.destroyW0r1dD43m0n(" + next_bitnode + ", '" + script_main + "'")
        }
    }
    //otherwise try to reset
    await perform_reset(ns)
}


//function that determines the next bitnode, following the described path
async function determine_next_bitnode(ns) {
    //plot a path
    const bitnode_path = [
        //start
        [1,
            1
        ], //This Source-File lets the player start with 32GB of RAM on their home computer when entering a new BitNode
        //increases all of the player's multipliers by: 16%			


        //automation
        [4, 1], //This Source-File lets you access and use the Singularity functions outside of this BitNode.
        //reduces the RAM cost of singularity functions in other BitNodes: 16x
        [4, 2], //reduces the RAM cost of singularity functions in other BitNodes: 4x
        [4, 3], //reduces the RAM cost of singularity functions in other BitNodes: 1x
        [9, 1], //Permanently unlocks the Hacknet Server in other BitNodes
        //increases hacknet production and reduces hacknet costs by: 12%
        [9, 2], //You start with 128GB of RAM on your home computer when entering a new BitNode
        //increases hacknet production and reduces hacknet costs by: 18%
        [5,
            1
        ], //This Source-File grants you a new stat called Intelligence. Intelligence is unique because it is permanent and persistent (it never gets reset back to 1). However, gaining Intelligence experience is much slower than other stats. Higher Intelligence levels will boost your production for many actions in the game.
        //In addition, this Source-File will unlock: getBitNodeMultipliers(), Permanent access to formulas, Access to BitNode multiplier information on the Stats page
        //It will also raise all of your hacking-related multipliers by: 8%
        [10, 1], //Unlocks Sleeve and Grafting API in other BitNodes. 


        //unlocks
        [15,1], //Permanently start with the TOR router and darkscape, and unlock the full dark web on all BitNodes.
        [2, 1], //This Source-File allows you to form gangs in other BitNodes once your karma decreases to a certain value. It
        //also increases your crime success rate, crime money, and charisma multipliers by: 24%
        [3, 1], //This Source-File lets you create corporations on other BitNodes (although some BitNodes will disable this mechanic)
        //increases your charisma and	company salary multipliers by: 8%
        [6, 1], //This Source-File allows you to access the NSA's Bladeburner division in other BitNodes. 
        //raise both the level and experience gain rate of all your combat stats by: 8%
        [7, 1], //This Source-File allows you to access the NSA's Bladeburner division in other BitNodes
        //increase all of your Bladeburner multipliers by: 8%
        [8, 1], //Permanent access to WSE and TIX API
        //increases your hacking growth multipliers by: 12%
        [8, 2], //Ability to short stocks in other BitNodes
        //increases your hacking growth multipliers by: 18%
        [8, 3], //Ability to use limit/stop orders in other BitNodes
        //increases your hacking growth multipliers by: 21%
        [11,
            1
        ], //company favor increases BOTH the player's salary and reputation gain rate at that company by 1% per favor (rather than just the reputation gain)
        //increases the player's company salary and reputation gain multipliers by: 32%
        //reduces the price increase for every augmentation bought by: 4%		
        [13, 1], //Unlock Stanek's gift
        [15, 2], //Your charisma level increases job salary and rep gain. Also increases authentication speed by 20%
        [15, 3], //Your charisma level increases faction work rep gain. Also increases the xp and money gained from .cache files by 50%.

        //boosts
        [1, 2], //increases all of the player's multipliers by: 24%
        [1, 3], //increases all of the player's multipliers by: 28%

        [2, 2], //increases your crime success rate, crime money, and charisma multipliers by: 36%
        [2, 3], //increases your crime success rate, crime money, and charisma multipliers by: 42%

        [3, 2], //increases your charisma and	company salary multipliers by: 12%
        [3, 3], //increases your charisma and	company salary multipliers by: 14%
        //permanently unlocks the full API (?)

        [5, 2], //raises all of your hacking-related multipliers by: 12%
        [5, 3], //raises all of your hacking-related multipliers by: 14%

        [6, 2], //raise both the level and experience gain rate of all your combat stats by: 12%
        [6, 3], //raise both the level and experience gain rate of all your combat stats by: 14%

        [7, 2], //increase all of your Bladeburner multipliers by: 12%
        [7, 3], //increase all of your Bladeburner multipliers by: 14%
        //immediately receive "BladesSimulacrum" augmentation after joining the Bladeburner division

        [9, 3], //Grants a highly-upgraded Hacknet Server when entering a new BitNode	(Note that the Level 3 effect of this Source-File only applies when entering a new BitNode, NOT when installing
        //increases hacknet production and reduces hacknet costs by: 21%

        [10, 2], //grants extra sleeve
        [10, 3], //grants extra sleeve

        [11, 2], //increases the player's company salary and reputation gain multipliers by: 48%
        //reduces the price increase for every augmentation bought by: 6%
        [11, 3], //increases the player's company salary and reputation gain multipliers by: 56%
        //reduces the price increase for every augmentation bought by: 7%

        [13, 2], //increases Stanek's size
        [13, 3], //increases Stanek's size

        [14, 1], //100% increased stat multipliers from Node Power
        //max favor for winstreak: 200k rep equivalent
        //reputation converted to favor for winning two games in a row to: 1000 rep to favor	
        [14, 2], //Permanently unlocks the go.cheat API
        //max favor for winstreak: 300k rep equivalent
        //reputation converted to favor for winning two games in a row to: 1500 rep to favor
        [14, 3], //25% additive increased success rate for the go.cheat API
        //max favor for winstreak: 400k rep equivalent
        //reputation converted to favor for winning two games in a row to: 2000 rep to favor

        [12,
            999
        ], //This Source-File lets you start any BitNodes with Neuroflux Governor equal to the level of this Source-File
    ]

    //14: does go winning 2 times in a row changes converts rep to favor, eliminating the need for resets (only for installations of augments?)
    //which factions can do this?
    //can we get away without installing augments? e.g. grafting?


    //get rest information
    const reset_info = await evaluate.exec(ns, "ns.getResetInfo()")
    //get the map of source files owned
    var owned_source_files = reset_info.ownedSF
    //if we already have an entry for this source file
    if (owned_source_files.has(reset_info.currentNode)) {
        //add to existing index
        var new_level = owned_source_files.get(reset_info.currentNode) + 1
        //check if we need to limit (12 is unlimited
        if (new_level > 3 && reset_info.currentNode != 12) {
            //cap to 3
            new_level = 3
        }
        //save the new level
        owned_source_files(reset_info.currentNode, new_level)
        //source file is not in owned source files
    } else {
        //add to owned source files
        owned_source_files.set(reset_info.currentNode, 1)
    }
    //get the number of SF 12 owned
    const sf_12_owned = 0
    //check if focus is on 12
    if (owned_source_files.has(12)) {
        //we need to have at least 1x 12
        sf_12_owned = owned_source_files.get(12)
    }
    //keep track of sum of all owned SF
    var sum_sf = 0
    //for each source files
    for (var sf of owned_source_files.keys()) {
        //add it to the sum
        sum_sf += owned_source_files[sf]
    }
    //reduce by SF 12
    sum_sf -= sf_12_owned
    //if we foresee the need for a SF 12
    if (sum_sf > Math.floor(sf_12_owned * sf_12_mult)) {
        //focus SF12
        return 12
    }
    //for each planned step
    for (const step of bitnode_path) {
        //gather the information to check
        const bitnode = step[0]
        const level = step[1]
        //check if we have a target
        if (owned_source_files.get(bitnode) < level) {
            //return this bitnode number
            return bitnode
        }
    }
    //default to 12 (endless) if no steps found
    return 12

    /*
    bitNodeOptions		BitNodeOptions			Current BitNode options
    currentNode			number					The current BitNode
    lastAugReset		number					Numeric timestamp (from Date.now()) of last augmentation reset
    lastNodeReset		number					Numeric timestamp (from Date.now()) of last BitNode reset
    ownedAugs			Map<string, number>		A map of owned augmentations to their levels. Keyed by the augmentation name. Map values are the augmentation level (e.g. for NeuroFlux governor).
    ownedSF				Map<number, number>		A map of owned source files. Its keys are the SF numbers. Its values are the active SF levels. This map takes BitNode options into account.
    For example, let's say you have SF 1.3, but you overrode the active level of SF1 and set it to level 1. In this case, this map contains this entry: Key: 1 => Value: 1.
    If the active level of a source file is 0, that source file won't be included in the result.
    *
}


//function to check when to install augments
export async function perform_reset(ns) {
    //check when we want to install
    if (false) {
        //install augments
        await evaluate.exec(ns, "ns.singularity.installAugmentations('" + script_main + "')")
    }
}


//function that joins factions, and sets goal for a stat to work to
async function manage_factions(ns, player) {
    //TODO: city factions and eastern criminal factions
    //TODO: company factions

    //List all current faction invitations.
    const invites = await evaluate.exec(ns, "ns.singularity.checkFactionInvitations()")
    //for each invite
    for (const faction of invites) {
        //get enemies
        const enemies = await evaluate.exec(ns, "ns.singularity.getFactionEnemies('" + faction + "')")
        //if there are enemies of this faction
        if (enemies.length > 0) {
            //if we still need to get augumentations from this faction
            if (false) {
                //Get a list of owned augmentation.
                //ns.singularity.getOwnedAugmentations(true)
                //Get a list of augmentation available from a faction. (string array)
                //ns.singularity.getAugmentationsFromFaction(faction)
                //Join a faction.
                await evaluate.exec(ns, "ns.singularity.joinFaction('" + faction + "')")
            }
            //no enemies
        } else {
            //Join a faction.
            await evaluate.exec(ns, "ns.singularity.joinFaction('" + faction + "')")
        }
    }
    //keep track of the LOWEST stat
    var lowest_stat = 9999
    //keep track of the focus stat
    var focus_stat = focus_type.money
    //for each faction possible
    for (const faction of FactionNameEnumType) { //or FactionName?
        //if faction is not already joined 
        if (!player.factions.includes(faction)) {
            //get enemies
            const enemies = await evaluate.exec(ns, "ns.singularity.getFactionEnemies('" + faction + "')")
            //keep track if enemy has been joined
            var flag_enemy_joined = false
            //for each enemy
            for (const enemy of enemies) {
                //if we already joined an enemy
                if (player.factions.includes(enemy)) {
                    //set flag
                    flag_enemy_joined = true
                    //stop
                    break
                }
            }
            //if an enemy has been joined
            if (flag_enemy_joined) {
                //do nothing
                continue
            }
            //List conditions for being invited to a faction.
            const requirements = await ns.singularity.getFactionInviteRequirements(faction)
            //go over each requirement?
            for (const requirement of requirements) {
                //do something?
                switch (requirement.type) {
                    case "money":
                        break //do nothing
                    case "skills":
                        var skill = requirement.skills.keys()[0]
                        var required_stat = requirement.skills[skill]
                        //if the current skill is lower than the target, and more easily fulfilled
                        if (player.skills[skill] < required_stat && required_stat < lowest_stat) {
                            lowest_stat = required_stat
                            focus_stat = skill + "_exp"
                        }
                        break
                    case "karma":
                        //if the current karma is higher than the target, and more easily fulfilled
                        if (player.skills[skill] > requirement.karma && -requirement.karma < lowest_stat) {
                            lowest_stat = -requirement.karma
                            focus_stat = focus_type.KARMA
                        }
                        break
                    case "not":
                        break //to check
                    case "someCondition":
                        //city conditions?
                        //company conditions?
                        break //to check
                        //others?
                    default:
                }
            }
        }
        //return the focus
        return focus_stat
        /*
          toString(): string {
        	if (n < -1000) return "An extensive criminal record";
        	else if (n < -40) return "A criminal reputation";
        	else if (n < -20) return "A disregard for the law";
        	else if (n < -10) return "A history of violence";
        	else return "Street cred";
        	},
        */
/*
ns.singularity.getFactionInviteRequirements("The Syndicate");

[
  { "type": "someCondition", "conditions": [
	  { "type": "city", "city": "Aevum" },
	  { "type": "city", "city": "Sector-12" }
	]
  },
  { "type": "not", "condition": {
	  "type": "employedBy", "company": "Central Intelligence Agency"
	}
  },
  { "type": "not", "condition": {
	  "type": "employedBy", "company": "National Security Agency"
	}
  },
  { "type": "money", "money": 10000000 },
  { "type": "skills", "skills": { "hacking": 200 } },
  { "type": "skills", "skills": { "strength": 200 } },
  { "type": "skills", "skills": { "defense": 200 } },
  { "type": "skills", "skills": { "dexterity": 200 } },
  { "type": "skills", "skills": { "agility": 200 } },
  { "type": "karma", "karma": -90 }
]
*/

/*

donateToFaction(faction, amount)							Donate to a faction.
*/

//player karma
//player.karma
//player kills
//player.numPeopleKilled
/*
        const focus_type = {
        	MONEY: "money",						//How much money is given
        	KARMA: "karma",						//Amount of karma lost for successfully committing this crime
        	KILLS: "kills",						//How many people die as a result of this crime
        	HACKING: "hacking_exp",				//hacking exp gained from crime	
        	STRENGTH: "strength_exp",			//strength exp gained from crime
        	DEXTERITY: "dexterity_exp",			//dexterity exp gained from crime
        	AGILITY: "agility_exp",				//agility exp gained from crime
        	DEFENSE: "defense_exp",				//defense exp gained from crime
        	CHARISMA: "charisma_exp",			//charisma exp gained from crime
        	INTELLIGENCE: "intelligence_exp"	//intelligence exp gained from crime
        }
        
        CityName
        CityNameEnumType	Names of all cities
        *
    }
}


//function that handles working for factions
async function work_for_faction(ns, player) {
    //get the favor need
    const favor_target = ns.getFavorToDonate()
    //for each joined faction
    for (faction in player.factions) {
        //get favor of this faction
        const faction_favor = ns.singularity.getFactionFavor(faction)
        //if we don't have enough favor
        if (faction_favor < favor_target) {
            //check the rep needed for the favor needed
            const rep_needed = ReputationFormulas.calculateFavorToRep(favor_target - faction_favor)
            //get the faction rep
            const faction_rep = ns.singularity.getFactionRep(faction)
            //if we don't have enough rep
            if (faction_rep < rep_needed) {
                //Get the work types of a faction.
                const work_types = await ns.singularity.getFactionWorkTypes(faction)
                //determine best work type, default to the first available
                var best_work_type = work_types[0]
                //keep track of best stats
                var best_average_stats = -1
                //determine work type
                for (const work_type of work_types) {
                    //keep track of the calculated stat
                    var stat = -1
                    //decide what to do
                    switch (work_type) {
                        case FactionWorkType.hacking:
                            //((p.skills.hacking + p.skills.intelligence / 3 + getDarknetCharismaBonus(p, 0.1)) / CONSTANTS.MaxSkillLevel) * calculateCurrentShareBonus()
                            stat = player.skills.hacking + (player.skills.intelligence / 3)
                            break
                        case FactionWorkType.field:
                            //(0.9 * (p.skills.strength +         p.skills.defense +         p.skills.dexterity +          p.skills.agility +         getDarknetCharismaBonus(p, 0.3) + (p.skills.hacking + p.skills.intelligence) * calculateCurrentShareBonus()) ) /    CONSTANTS.MaxSkillLevel / 4.5;
                            stat = (0.9 * (player.skills.strength + player.skills.defense + player
                                .skills.dexterity + player.skills.agility + player.skills
                                .hacking)) / 4.5
                            break
                        case FactionWorkType.security:
                            //(0.9 * (p.skills.strength + p.skills.defense + p.skills.dexterity + p.skills.agility + p.skills.charisma + (p.skills.hacking + p.skills.intelligence + getDarknetCharismaBonus(p, 0.3))  * calculateCurrentShareBonus()) ) /    CONSTANTS.MaxSkillLevel /    5.5;
                            stat = ((0.9 * (player.skills.strength + player.skills.defense + player
                                .skills.dexterity + player.skills.agility + player
                                .skills.hacking + player.skills.charisma)) / 5.5)
                            break
                        default:
                            break
                    }
                    //check if this is better than what we have
                    if (stat > best_average_stats) {
                        //save the stat
                        best_average_stats = stat
                        //save the work type
                        best_work_type = work_type
                    }
                }
                //work
                perform_action(ns, player, work_type.FACTION, best_work_type, faction)
                //indicate work needed
                return true
            }
        }
    }
    //indicate no work needed
    return false
}


//function that checks which company to work for, applies for job & promotion, and works for the company
async function work_for_company(ns, player) {

    /*
    CompanyName
    CompanyNameEnumType	Names of all companies
    player.jobs	Partial<Record<CompanyName, JobName>>
    applyToCompany(companyName: CompanyName, field: JobField): JobName | null;
    This function will automatically try to apply to the specified company for a position in the specified field. This function can also be used to apply for promotions by specifying the company and field you are already employed at.

    This function will return the job name if you successfully get a job/promotion, and null otherwise. Note that if you are trying to use this function to apply for a promotion and don’t get one, the function will return null.
    *
}


//function that selects the best crime for the focus and starts it
async function perform_crime(ns, player, focus = focus_type.MONEY) { //other focus is karma or kills
    //get the best crime for the focus
    var best_crime = await determine_crime(ns, player, focus)
    //perform action
    await perform_action(ns, player, work_type.CRIME, best_crime)

    /*
    
    									
    
    CrimeStats
    	agility_exp					agility exp gained from crime
    	charisma_exp				charisma exp gained from crime
    	defense_exp					defense exp gained from crime
    	dexterity_exp				dexterity exp gained from crime
    	hacking_exp					hacking exp gained from crime	
    	intelligence_exp			intelligence exp gained from crime
    	strength_exp				strength exp gained from crime
    	karma						Amount of karma lost for successfully committing this crime
    	kills						How many people die as a result of this crime
    	money						How much money is given
    	
    	
    	time						Milliseconds it takes to attempt the crime
    	type						Description of the crime activity
    	
    	difficulty					Number representing the difficulty of the crime. Used for success chance calculations
    	agility_success_weight		Impact of agility level on success chance of the crime
    	charisma_success_weight		Impact of charisma level on success chance of the crime
    	defense_success_weight		Impact of defense level on success chance of the crime
    	dexterity_success_weight	Impact of dexterity level on success chance of the crime
    	hacking_success_weight		Impact of hacking level on success chance of the crime
    	strength_success_weight		Impact of strength level on success chance of the crime
    	

    CrimeEnumType
    type CrimeEnumType = {
    	shoplift: "Shoplift";
    	robStore: "Rob Store";
    	mug: "Mug";
    	larceny: "Larceny";
    	dealDrugs: "Deal Drugs";
    	bondForgery: "Bond Forgery";
    	traffickArms: "Traffick Arms";
    	homicide: "Homicide";
    	grandTheftAuto: "Grand Theft Auto";
    	kidnap: "Kidnap";
    	assassination: "Assassination";
    	heist: "Heist";
    };

    CrimeType
    *


}


//function to determine the best crime for the focus
async function determine_crime(ns, player, focus = focus_type.MONEY) {
    //keep track of best crime
    var best_crime = CrimeType.shoplift //or CrimeEnumType ?
    //keep track of best stat
    var best_rate = -1
    //for each crime
    for (const crime of CrimeEnumType) {
        //Get stats related to a crime.
        const stats = await evaluate.exec(ns, "ns.singularity.getCrimeStats('" + crime + "')")
        //if this increases the focus
        if (stats[focus] > 0) {
            //Get chance to successfully commit a crime.
            const chance = await evaluate.exec(ns, "ns.singularity.getCrimeChance('" + crime + "')")
            //if we have enough chance
            if (chance >= crime_min_chance) {
                //calc best rate for the focus
                const rate = chance * (stats.focus / stats.time)
                //check if this is better than what we have
                if (rate > best_rate) {
                    //update best rate
                    best_rate = rate
                    //update best crime
                    best_crime = crime
                }
            }
        }
    }
    //if focus is not money, and there is no best rate (due to low chance?)
    if (focus != focus_type.MONEY && best_rate == -1) {
        //return the best crime for money
        return await determine_crime(ns, player, focus_type.MONEY)
    }
    //we found a target crime
    return best_crime
}


//function that tries to start an action
async function perform_action(ns, player, work_type, activity, group = "") {
    //set player focus
    const focus = false
    //if the player is doing something
    if (await evaluate.exec(ns, "ns.singularity.isBusy()")) {
        //Get the current work the player is doing.
        const current_task = await evaluate.exec(ns, "ns.singularity.getCurrentWork()")
        //check if it matches with what we want
        if (current_task.type == work_type) {
            //what to check?
            switch (work_type) {
                case work_type.GRAFTING:
                    return //finish crafting
                case work_type.FACTION:
                    if (current_task.factionName == group && current_task.factionWorkType ==
                        activity) {
                        return
                    }
                    break
                case work_type.COMPANY:
                    if (current_task.companyName == group) {
                        return
                    }
                    break //only look at the company?
                case work_type.CRIME:
                    if (current_task.activity == activity) {
                        return
                    }
                    break //only look at the crime
                case work_type.STUDY:
                    if (current_task.classType == activity) {
                        return
                    }
                    break //only look at the type (location doesn't matter)
                case work_type.CREATE_PROGRAM:
                    return //finish program 	if (current_task.programName == activity) { return }
                default:
                    log.error(ns, "Singularit", "Uncaught case of 'work_type': " + work_type);
                    break
            }
            //we want to do something different but we are grafting or creating a program
        } else if (current_task.type == work_type.GRAFTING || current_task.type == work_type
            .CREATE_PROGRAM) {
            //don't change
            return
        }
    }
    //check which function to call to start work
    switch (work_type) {
        case work_type.FACTION:
            await evaluate.exec(ns, "ns.singularity.workForFaction('" + group + "','" + activity +
                "'," + focus + ")");
            break
        case work_type.COMPANY:
            await evaluate.exec(ns, "ns.singularity.workForCompany('" + group + "'," + focus + ")");
            break
        case work_type.CRIME:
            await evaluate.exec(ns, "ns.singularity.commitCrime('" + activity + "'," + focus + ")");
            break
        case work_type.STUDY:
            await evaluate.exec(ns, "ns.singularity.universityCourse('" + group + "','" + activity +
                "'," + focus + ")");
            break //universityName, courseName, focus)
        case work_type.CREATE_PROGRAM:
            await evaluate.exec(ns, "createProgram('" + activity + "'," + focus + ")");
            break
        case work_type.GRAFTING:
            break //TODO

        default:
            log.error(ns, "Singularity", "Uncaught case 'work_type': " + work_type)
    }
}


//function to travel to a city
async function travel_to_city(ns, player, city) {
    //if we are not in the target city
    if (player.location != city) {
        //travel to city
        await evaluate.exec(ns, "ns.singularity.travelToCity('" + city + "')")
    }
}


//var ram_script
var tools_owned = []


/** @param {NS} ns *
async function manage_tools(ns) {
    //dict of tools (key) and value (cost in dark web & hacking level for creating ourselves) 
    const hacking_tools = new Map(
        ["BruteSSH.exe", 0], //augment: x
        ["FTPCrack.exe", 0], //augment: x
        ["relaySMTP.exe", 250], //augment: x
        ["HTTPWorm.exe", 500], //augment: x
        ["SQLInject.exe", 750] //augment: x
    )

    //check if we need to execute this function at all
    //if we don't have all the tools
    if (tools_owned.length < hacking_tools.size) {
        //check which tools still needs to be done
        var tools_to_get = hacking_tools
        //get the available executables on home
        var files = await evaluate.exec(ns, "ns.ls('home', '.exe')")
        //for each file found
        for (const file in files) {
            //if this is a hacking tool and not already found
            if (hacking_tools.has(file)) {
                //if not yet in the owned list
                if (!tools_owned.includes(file)) {
                    //add to the list
                    tools_owned.push(file)
                }
                //if this is a hacking tool
                if (tools_to_get.has(file)) {
                    //remove from TODO list
                    tools_to_get.delete(file)
                }
            }
        }

        //if we have access to the dark web (TODO: how to get automatically?)
        if (!await evaluate.exec(ns, "ns.hasTorRouter()")) {
            //buy tor
            await evaluate.exec(ns, "ns.singularity.purchaseTor()")
            //stop for now
            return
            //we have TOR
        } else {
            //buy the tools if possible
            //check per hacking level and tool
            for (const tool of tools_to_get.keys()) {
                //try to buy
                if (await evaluate.exec(ns, "ns.singularity.purchaseProgram('" + tool + "')")) {
                    //if we bought the tool, remove from todo list
                    tools_to_get.delete(tool)
                }
            }
        }
        //try to create manually
        //get hacking level
        const hacking_level = await evaluate.exec(ns, "ns.getHackingLevel()")
        //check per hacking level and tool
        for (const tool of tools_to_get.keys()) {
            //get the hacking requirement 
            const required_hacking_level = tools_to_get[tool]
            //if we can create
            if (hacking_level >= required_hacking_level) {
                //create tool
                await evaluate.exec(ns, "ns.singularity.createProgram('" + tool + "')")
            }
        }
    }
}


/*
Company
	applyToCompany(companyName, field)							Apply for a job at a company.
	getCompanyFavor(companyName)								Get company favor.
	getCompanyFavorGain(companyName)							Get company favor gain.
	getCompanyPositionInfo(companyName, positionName)			Get Requirements for Company Position.
	getCompanyPositions(companyName)							Get List of Company Positions.
	getCompanyRep(companyName)									Get company reputation.
	
Factions
	checkFactionInvitations()									List all current faction invitations.
	donateToFaction(faction, amount)							Donate to a faction.
	getFactionEnemies(faction)									Get a list of enemies of a faction.
	getFactionFavor(faction)									Get faction favor.
	getFactionFavorGain(faction)								Get faction favor gain.
	getFactionInviteRequirements(faction)						List conditions for being invited to a faction.
	getFactionRep(faction)										Get faction reputation.
	getFactionWorkTypes(faction)								Get the work types of a faction.
	joinFaction(faction)										Join a faction.
	
Augmentations
	getAugmentationBasePrice(augName)							Get base price of an augmentation.
	getAugmentationFactions(augName)							Get a list of faction(s) that have a specific Augmentation.
	getAugmentationPrereq(augName)								Get the pre-requisite of an augmentation.
	getAugmentationPrice(augName)								Get price of an augmentation.
	getAugmentationRepReq(augName)								Get reputation requirement of an augmentation.
	getAugmentationsFromFaction(faction)						Get a list of augmentation available from a faction.
	getAugmentationStats(name)									Get the stats of an augmentation.
	getOwnedAugmentations(purchased)							Get a list of owned augmentation.
	installAugmentations(cbScript)								Install your purchased augmentations.
	purchaseAugmentation(faction, augmentation)					Purchase an augmentation
	
Bitnode
	b1tflum3(nextBN, callbackScript, bitNodeOptions)			b1t_flum3 into a different BN.
	destroyW0r1dD43m0n(nextBN, callbackScript, bitNodeOptions)	Destroy the w0r1d_d43m0n and move on to the next BN.
	getOwnedSourceFiles()										Get a list of acquired Source-Files.

Activities
	getCurrentWork()											Get the current work the player is doing.
	commitCrime(crime, focus)									Commit a crime.
	getCrimeChance(crime)										Get chance to successfully commit a crime.
	getCrimeStats(crime)										Get stats related to a crime.
	workForFaction(faction, workType, focus)					Work for a faction.
	isBusy()													Check if the player is busy.
	isFocused()													Check if the player is focused.
	goToLocation(locationName)									Go to a location.
	gymWorkout(gymName, stat, focus)							Workout at the gym.
	hospitalize()												Hospitalize the player.
	setFocus(focus)												Set the players focus.
	stopAction()												Stop the current action.
	travelToCity(city)											Travel to another city.
	universityCourse(universityName, courseName, focus)			Take university class.
	workForCompany(companyName, focus)							Work for a company.
	quitJob(companyName)										Quit jobs by company.
	
Servers
	connect(host)												Connect to a server.
	installBackdoor()											Run the backdoor command in the terminal.
	
	getHackingLevelRequirementOfProgram(programName)			Get the hacking level requirement of a program.
	createProgram(programName, focus)							Create a program.
	cat(filename)												Displays the content of a file on the currently connected server.
	getDarkwebProgramCost(programName)							Check the price of an exploit on the dark web
	getDarkwebPrograms()										Get a list of programs offered on the dark web.
	getCurrentServer(returnOpts)								Get the current server. Returns the hostname by default.
	getUpgradeHomeCoresCost()									Get the price of upgrading home cores.
	getUpgradeHomeRamCost()										Get the price of upgrading home RAM.
	
	manualHack()												Run the hack command in the terminal.
	purchaseProgram(programName)								Purchase a program from the dark web.
	purchaseTor()												Purchase the TOR router.
	upgradeHomeCores()											Upgrade home computer cores.
	upgradeHomeRam()											Upgrade home computer RAM.
	
Other
	exportGame()												Backup game save.
	exportGameBonus()											Returns Backup save bonus availability.
	getSaveData()												This function returns the save data.
	getUnlockedAchievements()									Get a list of all unlocked achievements.
	softReset(cbScript)											Soft reset the game.
	
	
	https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.nsenums.md
	
	NSEnums type

Signature:

type NSEnums = {
  CityName: CityNameEnumType;
  CrimeType: CrimeEnumType;
  FactionWorkType: FactionWorkEnumType;
  GymType: GymEnumType;
  JobName: JobNameEnumType;
  JobField: JobFieldEnumType;
  LocationName: LocationNameEnumType;
  ToastVariant: ToastVariantEnumType;
  UniversityClassType: UniversityClassEnumType;
  CompanyName: CompanyNameEnumType;
  FactionName: FactionNameEnumType;
  CodingContractName: CodingContractNameEnumType;
  PositionType: PositionEnumType;
  OrderType: OrderEnumType;
  BladeburnerActionType: BladeburnerActionEnumType;
  SpecialBladeburnerActionTypeForSleeve: SpecialBladeburnerActionEnumTypeForSleeve;
  FragmentType: FragmentEnumType;
  DarknetResponseCode: DarknetResponseCodeType;
  ProgramName: ProgramNameEnumType;
  GangTaskName: GangTaskNameEnumType;
};

References: CityNameEnumType, CrimeEnumType, FactionWorkEnumType, GymEnumType, JobNameEnumType, JobFieldEnumType, LocationNameEnumType, ToastVariantEnumType, UniversityClassEnumType, CompanyNameEnumType, FactionNameEnumType, CodingContractNameEnumType, PositionEnumType, OrderEnumType, BladeburnerActionEnumType, SpecialBladeburnerActionEnumTypeForSleeve, FragmentEnumType, DarknetResponseCodeType, ProgramNameEnumType, GangTaskNameEnumType

*/

/*
Below are some of the stats that will increase with play and reset during augmentation installs as you progress through the game. Your stats can be found in the Overview panel, the Stats subpage of the side menu, or with API methods like ns.getPlayer().
Hack Skill

For many aspects of Bitburner, increasing your Hack skill will be an important goal. Primarily affected by the efficiency of your hacking strategies, you will also be offered Augmentations that greatly enhance your Hack Skill level and how effective its results are.

Affects:

    Time needed to execute hack, grow, or weaken and similar methods
    Your chance to successfully hack a server
    Percent of a server's money stolen when hacking it
    Success rate of certain crimes
    Time needed to create a Program
    Faction Reputation gain when carrying out Hacking Contracts or Field Work
    Company Reputation gain for certain jobs

Gain Hack experience by:

    Manually hacking servers through the Terminal
    Using ns.hack(), ns.grow(), or ns.weaken() through scripts
    Committing certain crimes
    Carrying out Hacking Contracts or doing Field work for Factions
    Some Company jobs and other types of work
    Studying at a university

Combat Skills
Strength, Defense, Dexterity, and Agility

These represent your physical skill and attributes, including your ability to sneak, inflict or endure damage, and pull off high precision tasks. Similar to your Hack skill, you will be offered Faction Augmentations to multiplicatively enhance your Combat Skills and exp gain.

Affects:

    HP scales with Defense. Infiltration and some jobs may cause you to take damage.
    Success rate of certain crimes
    Faction Reputation gain for Security and Field Work
    Company Reputation gain for certain jobs

Gain experience by:

    Working out at a gym
    Committing certain crimes
    Doing Security or Field Work for a Faction
    Working certain jobs at a Company

Charisma

Rarely as useful as Hacking and Physical skills, Charisma can help get a company job, gain trust, or calm chaos in social situations.

Charisma can also be enhanced with Augmentations.

Affects:

    Success rate of certain crimes
    Faction Reputation gain for Field Work
    Company Reputation gain for most jobs

Gain experience by:

    Committing certain crimes
    Studying at a university
    Working certain jobs at a Company
    Doing Field work for a Faction

Other Stats and abilities are available in later stages of the game.
*/

/*
Reputation

In order to acquire Augmentations from Factions, you need to earn their trust.

This can be done in a variety of ways, but the most common is offering your services to a Faction. Another option is to give them intel from Infiltrations.

When installing Augmentations, all your reputation gets converted to favor. Favor increases the rate at which reputation is gained with that faction.

With enough favor, donations are unlocked. Donations allow you to spend money to acquire reputation directly. Without working for the faction. This feature is particularly useful when a very large amount of reputation is needed for an augmentation.
*/

/*
Factions
    Throughout the game you may receive invitations from factions. 
    There are many different factions, and each faction has different criteria for determining its potential members. 
    Joining a faction and furthering its cause is crucial to progressing in the game and unlocking endgame content.
    It is possible to join multiple factions if you receive invitations from them. 
    However, note that joining a faction may prevent you from joining other rival factions. 
    (Don't worry, this usually isn't the case. Also, it would only be temporary since resetting the game by installing Augmentations will clear all your factions)
    The Factions link on the menu brings up a list of all factions that you have joined. 
    You can select a Faction on this list to go to that Faction page. 
    This page displays general information about the Faction and also lets you perform work for the faction. 
    Working for a Faction is similar to working for a Company except that you don't get paid a salary. You will only earn Reputation in your Faction and train your Stats.
    Earning Reputation for a Faction unlocks powerful Augmentations. 
    Purchasing and installing these Augmentations will upgrade your abilities. 
    The Augmentations that are available to unlock vary from Faction to Faction.
    See also the complete List of Factions and their Requirements (contains spoilers).
*/

/*
Crimes
    Committing crimes is an active gameplay mechanic that allows the player to train their Stats and potentially earn money. 
    It also reduces your karma, and having low karma is a requirement of some factions.
    The player can attempt to commit crimes by visiting The Slums through the City tab (Alt + w). The Slums is available in every city.
    
    Basic Mechanics
        When you visit The Slums you will see a list of buttons that show all of the available crimes. 
        Simply select one of the options to begin attempting that crime. 
        Attempting to commit a crime takes a certain amount of time. This time varies between crimes.
        While doing crimes, you can click Do something else simultaneously to be able to do things while you continue to do crimes in the background. 
        There is a 20% penalty to the related gains. Clicking the Focus button under the overview will return you to the current task.
        Crimes are not always successful. Your rate of success is determined by your Stats and Augmentations. 
        The odds can be seen on the crime-selection page. If you are unsuccessful at committing a crime you will gain EXP, but you will not earn money. 
        If you are successful at committing the crime you will gain extra EXP (4x of what an unsuccessful attempt would give) and earn money.
        Harder crimes are typically more profitable, and also give more EXP.
*/

/*
Companies
    When exploring the World, you can visit various companies. At these companies, you can apply for jobs.
    Working a job lets you earn money, experience, and Reputation with that company.
    While working for a company, you can click Do something else simultaneously to be able to do things while you continue to work in the background. 
    There is a 20% penalty to the related gains. Clicking the Focus button under the overview will return you to the current work.
    If you've been hired to do a job you can click that Apply for X Job button again to get a promotion if you meet the requirements. 
    You can see the requirements by hovering your cursor over the button. Higher positions give increased rewards.
*/

/*
Augmentations
    Advances in science and medicine have led to powerful new technologies that allow people to augment themselves beyond normal human capabilities. 
    There are many different types of Augmentations, ranging from cybernetic to genetic to biological. 
    Acquiring these Augmentations enhances the user's physical and mental faculties.
    Augmentations provide persistent upgrades in the form of multipliers. 
    These multipliers apply to a wide variety of things such as stats, experience gain, and hacking, just to name a few. 
    The effects of Augmentations stack multiplicatively. Your multipliers can be viewed in the Character pages.

How to acquire Augmentations
    Because of how powerful Augmentations are, the technology behind them is kept private and secret by the corporations and organizations that create them. 
    Therefore, the only way for the player to obtain Augmentations is through Factions. 
    After joining a Faction and earning enough Reputation in it, you will be able to purchase its Augmentations. 
    Different Factions offer different Augmentations. Augmentations must be purchased in order to be installed, and they are fairly expensive. 
    They also require Reputation with a Faction before they will let you purchase their Augmentations.

Installing Augmentations
    You will not gain the benefits of your purchased Augmentations until you install them. You can choose to install Augmentations through the Augmentations menu tab, found under Character.
    Unfortunately, installing Augmentations has side effects. You will lose most of the progress you've made, including your skills, stats, and money. You will have to start over, but you will have all of the Augmentations you have installed to help you progress. This is the game's "soft reset" or "prestige" mechanic.
    To summarize, here is a list of everything you will LOSE when you install an Augmentation:
        Stats/Skills
        Money
        Scripts on all servers EXCEPT your home computer
        Cloud servers
        Hacknet Nodes
        Company / Faction Reputation, but you gain Favor.
        Jobs and Faction memberships
        Programs
        Stocks
        TOR router

Here is everything you will KEEP when you install an Augmentation:
    Every Augmentation you have previously installed
    Scripts on your home computer
    RAM / Core Upgrades on your home computer
    World Stock Exchange account and TIX API Access

Purchasing Multiple Augmentations
    You do not have to install an Augmentation right after you purchase it. 
    You can purchase as many Augmentations as you'd like before you choose to install them. 
    When you install your purchased Augmentations they will ALL get installed at once.
    There are a few drawbacks to this, however. 
    First, obviously, you won't gain the benefits of your purchased Augmentations until after you install them. 
    Second, purchasing multiple Augmentations before installing them will cause the Augmentations to get progressively more expensive. 
    When you purchase an Augmentation, the price of purchasing another Augmentation doubles. This multiplier stacks for each Augmentation you purchase. 
    Once you install your purchased Augmentations, their costs are reset back to the original prices. 
    You can only purchase each augmentation once, with the exception of NeuroFlux Governor, which can be purchased infinitely at increasing cost.
*/