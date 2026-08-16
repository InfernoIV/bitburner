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
        //set a default value
        this.next_bitnode = 12
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
        ns.disableLog("singularity.purchaseAugmentation")
        ns.disableLog("singularity.donateToFaction")
        ns.disableLog("singularity.applyToCompany")
        ns.disableLog("singularity.workForFaction")

        //get tools
        const executables = ns.ls(CONSTANTS.SERVER.HOME, CONSTANTS.FILE_EXTENSION.EXECUTABLE)
        this.brute_ssh = executables.includes(CONSTANTS.TOOLS.HACKING.BRUTE_SSH)
        this.ftp_crack = executables.includes(CONSTANTS.TOOLS.HACKING.FTP_CRACK)
        this.relay_smtp = executables.includes(CONSTANTS.TOOLS.HACKING.RELAY_SMTP)
        this.http_worm = executables.includes(CONSTANTS.TOOLS.HACKING.HTTP_WORM)
        this.sql_inject = executables.includes(CONSTANTS.TOOLS.HACKING.SQL_INJECT)
        this.darknet = executables.includes(CONSTANTS.TOOLS.DARKNET)
        //determine next bitnode
        this.next_bitnode = this.determine_next_bitnode(ns)
        //log
        log.info(ns, "Singularity", "Next bitnode target: " + this.next_bitnode, true)
        //debug
        log.info(ns, "Singularity", "Init complete")
    }


    /*
    singularity.connect 2   -> used by root
    manage          0
    upgrade_home    33
    manage_tor      2  
    manage_tools    2
    manage_factions 9
    manage_player   15.5
    */
    async manage(ns, handles) {
        //try to destroy bitnode
        this.destroy_bitnode(ns, handles.hasOwnProperty(CONSTANTS.HANDLE.INTELLIGENCE), handles.hasOwnProperty(
            CONSTANTS.HANDLE.BLADEBURNER))
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
        const travel_blocked = this.manage_player(ns, handles.hasOwnProperty(CONSTANTS.HANDLE.DARKNET), handles
            .hasOwnProperty(CONSTANTS.HANDLE.INTELLIGENCE))
        //check if we can travel
        if (!travel_blocked) {
            //test
            await this.join_stanek(ns, handles.hasOwnProperty(CONSTANTS.HANDLE.STANEK_AVAILABLE))
            //manage player location
            this.manage_location(ns)
        }
        //manage augments
        this.manage_augments(ns, handles.hasOwnProperty(CONSTANTS.HANDLE.INTELLIGENCE))
        //install augments
        this.install_augments(ns, handles.hasOwnProperty(CONSTANTS.HANDLE.STOCK))
    }


    destroy_bitnode(ns, bitnode_multipliers_available, bladeburner_available) {
        //get player
        const level_hacking = ns.getPlayer().skills.hacking
        //check if the red pill in installed
        const augment_red_pill_installed = ns.singularity.getOwnedAugmentations(false).includes(CONSTANTS.AUGMENT
            .TRP)
        //correct if needed
        if (bitnode_multipliers_available) {
            //TODO
            required_level_hacking = ""
        }
        //if we have the red pill installed
        if (augment_red_pill_installed) {
            //variable to keep track if we can destroy
            var can_destroy = false
            //if bladeburner completed the final black op.
            if (false) {
                //set to destroy
                can_destroy = true
            }
            //get world deamon server
            const world_deamon = ns.getServer(CONSTANTS.SERVER.WORLD_DEAMON)
            //if hacking level is sufficient
            if (world_deamon.hasAdminRights) {
                //set to destroy
                can_destroy = true
            }

            //if flag has been set
            if (can_destroy) {
                //replace this script with the destroy script
                ns.spawn(CONSTANTS.SCRIPT.DESTROY, 1, this.next_bitnode)
            }
        }
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
        while (true) {
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
            if (!factions_joined.includes("Ishima") && this.get_augments_left(ns, "Ishima").length > 0 && !
                factions_joined.includes("Sector-12") && !factions_joined.includes("Aevum")) {
                //set target city
                target_city = "Ishima"
                //stop looking
                break
            }
            //if chongqing has not been joined and there are still augments left    (20e6)
            if (!factions_joined.includes("Chongqing") && this.get_augments_left(ns, "Chongqing").length > 0 && !
                factions_joined.includes("Sector-12") && !factions_joined.includes("Aevum")) {
                //set target city
                target_city = "Chongqing"
                //stop looking
                break
            }
            //if new tokyo has not been joined and there are still augments left    (20e6)
            if (!factions_joined.includes("New Tokyo") && this.get_augments_left(ns, "New Tokyo").length > 0 && !
                factions_joined.includes("Sector-12") && !factions_joined.includes("Aevum")) {
                //set target city
                target_city = "New Tokyo"
                //stop looking
                break
            }
            //if volhaven has not been joined and there are still augments left (50e6)
            if (!factions_joined.includes("Volhaven") && this.get_augments_left(ns, "Volhaven").length > 0 && !
                factions_joined.includes("Sector-12") && !factions_joined.includes("Aevum") && !factions_joined
                .includes("Ishima") && !factions_joined.includes("Chongqing") && !factions_joined.includes(
                    "New Tokyo")) {
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
            while (true) {
                //hacking 50, 1e6 money
                if (!factions_joined.includes("Tian Di Hui")) {
                    //check if player is in a correct location
                    if (player.city != "Chongqing" && player.city != "New Tokyo" && player.city != "Ishima") {
                        //set to chongqing
                        target_city = "Chongqing"
                    }
                    break
                }
                //combat 75, karma -18
                if (!factions_joined.includes("Tetrads")) {
                    //check if player is in a correct location
                    if (player.city != "Chongqing" && player.city != "New Tokyo" && player.city != "Ishima") {
                        //set to chongqing
                        target_city = "Chongqing"
                    }
                    break
                }
                //combat 100, karma -90
                if (!factions_joined.includes("The Syndicate")) {
                    //check if player is in a correct location
                    if (player.city != "Sector-12" && player.city != "Aevum") {
                        //set to sector-12
                        target_city = "Sector-12"
                    }
                    break
                }
                //hacking 300, combat 300, kills 5, karma -45
                if (!factions_joined.includes("The Dark Army")) {
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

                //check money
                const money = ns.getServer(CONSTANTS.SERVER.HOME).moneyAvailable
                //check if enough
                if (money >= 200000) {
                    log.info(ns, "Singularity", "Traveling to city: '" + target_city + ", currently in '" + player
                        .city + "'", true)
                    //travel to city
                    ns.singularity.travelToCity(target_city)
                }
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
                if (!ns.singularity.travelToCity(target_city)) {
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
        //work for faction, ignoring favor
        if (this.work_for_faction(ns, formulas_available, true)) return false
        //if we don't have enough kills for certains factions
        if (ns.getPlayer().numPeopleKilled < 30) {
            //commit murder
            if (this.commit_murder(ns)) return false
        }
        //get money
        this.commit_crime(ns)
        //stop
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
    singularity.getAugmentationRepReq       2.5
    singularity.donateToFaction             5

    https://github.com/bitburner-official/bitburner-src/blob/dev/src/Faction/formulas/donation.ts
    */
    //function that manages augments (buying the most expensive one first before going to the next)    
    manage_augments(ns, formulas_available) {
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
                    //get the rep requirement
                    var rep = ns.singularity.getAugmentationRepReq(augment)
                    //set target faction
                    var target_faction = faction
                    //check if we already saves the augment
                    if (augments.has(augment)) {
                        //get the saved faction
                        const saved_faction = augments.get(augment).faction
                        //get rep
                        const rep_new = ns.singularity.getFactionRep(faction)
                        const rep_saved = ns.singularity.getFactionRep(saved_faction)
                        //if the saved faction already has enough rep to buy the augment
                        if (rep_saved >= rep) {
                            //use the saved faction
                            target_faction = saved_faction
                            //if the new faction has enough rep to buy the augment
                        } else if (rep_new >= rep) {
                            //no need to change
                            //if both factions don't have enough rep
                        } else {
                            //get favor of new faction
                            const favor_new = ns.singularity.getFactionFavor(faction)
                            //get favor of saved faction
                            const favor_saved = ns.singularity.getFactionFavor(saved_faction)
                            //if the saved faction has more favor
                            if (favor_saved > favor_new) {
                                //keep the saved faction
                                target_faction = saved_faction
                            }
                        }
                    }
                    //save the price
                    augments.set(augment, {
                        "faction": target_faction,
                        "price": price,
                        "rep": rep,
                    })
                }
            }
        }
        //sort the augments (on key = highest cost)
        const augments_sorted = new Map([...augments.entries()].sort((a, b) => b[1].price - a[1].price))

        //for each augment we have saved
        for (const augment of augments_sorted.keys()) {
            //get the information
            const augment_info = augments_sorted.get(augment)
            //get rep requirement
            const faction_rep = ns.singularity.getFactionRep(augment_info.faction)
            //get the favor of the faction
            const favor = ns.singularity.getFactionFavor(augment_info.faction)

            //if not enough rep (just blindly try to donate)
            if (faction_rep < augment_info.rep) {
                //try to donate to get target rep
                this.donate_to_get_rep(ns, augment_info.faction, augment_info.rep - faction_rep, formulas_available)
            }
            //log.info(ns, "Singularity", "augment: " + augment + " => " + JSON.stringify(augments_sorted.get(augment)), true)  
            //try to buy augment
            const success = ns.singularity.purchaseAugmentation(augment_info.faction, augment)
            //if able to buy most expensive augment
            if (success) {
                //log
                log.success(ns, "Singularity", "Bought augment: '" + augment + "'", true)
                //failed to buy
            } else {
                //stop
                //return
            }
        }
    }


    //function that donates to the faction
    donate_to_get_rep(ns, faction, rep_difference, formulas_available) {
        //variable to fill
        var money = 0
        //if we can use formulas
        if (formulas_available) {
            //just calc
            money = ns.formulas.donationForRep(rep_difference, ns.getPlayer())

            //estimate without taking bitnode multipliers into account...
        } else {
            //stolen from SRC https://github.com/bitburner-official/bitburner-src/blob/dev/src/Faction/formulas/donation.ts
            const DonateMoneyToRepDivisor = 1e6
            //we need to have player multipliers
            const mults_faction_rep = ns.getPlayer().mults.faction_rep
            //calculate the money for the needed rep
            money = (rep_difference * DonateMoneyToRepDivisor) /
                mults_faction_rep //(rep * CONSTANTS.DonateMoneyToRepDivisor) / person.mults.faction_rep * currentNodeMults.FactionWorkRepGain
        }
        //donate to the faction
        ns.singularity.donateToFaction(faction, money)
    }


    //function that checks if we want to install augments
    install_augments(ns, has_stocks) {
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
            //if stocks are available
            if (has_stocks) {
                //sell all stocks
                this.sell_all_stocks(ns)
            }

            //placeholder
            var success = true
            //keep trying
            while (success) {
                //try to buy NFG
                success = ns.singularity.purchaseAugmentation(best_faction, CONSTANTS.AUGMENT.NFG)
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
            return this.perform_action(ns, work_type.STUDY, "Algorithms")

        } else if (skills.strength < this.skill_min) {
            return this.perform_action(ns, work_type.STUDY, "str")

        } else if (skills.defense < this.skill_min) {
            return this.perform_action(ns, work_type.STUDY, "def")

        } else if (skills.dexterity < this.skill_min) {
            return this.perform_action(ns, work_type.STUDY, "dex")

        } else if (skills.agility < this.skill_min) {
            return this.perform_action(ns, work_type.STUDY, "agi")

        } else if (skills.charisma < this.skill_min) {
            return this.perform_action(ns, work_type.STUDY, "Leadership")
        }
        //we have all the stats we need
        return false
    }


    /*
    Singularity.getFactionFavor 1
    */
    work_for_faction(ns, formulas_available, ignore_favor = false) {
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
            //if we ignore favor (aka donate)
            if (ignore_favor) {
                //set as target faction
                target_faction = faction
                //stop
                break
            }
            //get favor
            const favor = ns.singularity.getFactionFavor(faction)
            const rep_to_favor = Math.log1p(rep / 30000) /
                0.019802627296179712 //(rep / 25000) / 0.019802627296179712
            var favor_for_donate = 150
            //if we can use bitnode multipliers
            if (formulas_available) {
                //adjust the number
                favor_for_donate * ns.getBitNodeMultipliers().FavorToDonateToFaction
            }

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
    work_for_company(ns, formulas_available) {
        //faction name, company name, server name
        const company_factions = {
            //jobStatReqOffset: 224            
            "Blade Industries": {
                company: "Blade Industries",
                hostname: "blade"
            }, //exp & money multiplier: 2.75      hacking: 900 <-> 1200 (5 ports) 
            "Bachman & Associates": {
                company: "Bachman & Associates",
                hostname: "b-and-a"
            }, //exp & money multiplier: 2.6       hacking: 900 <-> 1150 (5 ports)     
            "Four Sigma": {
                company: "Four Sigma",
                hostname: "4sigma"
            }, //exp & money multiplier: 2.5       hacking: 900 <-> 1250 (5 ports)
            "OmniTek Incorporated": {
                company: "OmniTek Incorporated",
                hostname: "omnitek"
            }, //exp & money multiplier: 2.25      hacking: 900 <-> 1100 (5 ports)
            "Clarke Incorporated": {
                company: "Clarke Incorporated",
                hostname: "clarkinc"
            }, //exp & money multiplier: 2.25      hacking: 950 <-> 1250 (5 ports)
            "Fulcrum Secret Technologies": {
                company: "Fulcrum Technologies",
                hostname: "fulcrumtech"
            }, //exp & money multiplier: 2         hacking: 950 <-> 1250 (5 ports)
            "KuaiGong International": {
                company: "KuaiGong International",
                hostname: "kuai-gong"
            }, //exp & money multiplier: 2         hacking: 950 <-> 1300 (5 ports)
            //jobStatReqOffset: 249
            "NWO": {
                company: "NWO",
                hostname: "nwo"
            }, //exp & money multiplier: 2.75      hacking: 950 <-> 1300 (5 ports)  
            "ECorp": {
                company: "ECorp",
                hostname: "ecorp"
            }, //exp & money multiplier: 3         hacking: 1050 <-> 1400 (5 ports)
            "MegaCorp": {
                company: "MegaCorp",
                hostname: "megacorp"
            }, //exp & money multiplier: 3         hacking: 1100 <-> 1350 (5 ports)

        }
        //TODO: rank the companies in another order for augments?
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
            const rep_needed = backdoor_installed ? company_reputation_needed_for_faction * 0.75 :
                company_reputation_needed_for_faction
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

    
    commit_murder(ns) {
        //variable for preferred crime
        var best_crime = ""
        //get chrime change
        var crime_chance = ns.singularity.getCrimeChance("Homicide")
        //check for chance
        if (crime_chance >= 0.66) {
            best_crime = "Homicide"
        }
        //get chrime change
        var crime_chance = ns.singularity.getCrimeChance("Assassination")
        //check for chance
        if (crime_chance >= 0.66) {
            best_crime = "Assassination"
        }
        //if we have a crime
        if (best_crime != "") {
            //default to mug for now
            this.perform_action(ns, work_type.CRIME, best_crime)
            //indicate success
            return true
        }
        //indicate failure
        return false
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
    perform_action(ns, type, activity, formulas_available = false) {
        //get player
        var player = ns.getPlayer()
        //flag to keep track if we need to switch
        var flag_switch_work = false
        //get current work
        var current_work = ns.singularity.getCurrentWork()
        //if not working
        if (current_work == null || current_work == undefined) {
            //set flag
            flag_switch_work = true
            //working
        } else {
            //if different work is required
            if (current_work.type != type) {
                //set flag
                flag_switch_work = true
                //doing the same work (high level)
            } else {
                //depending on the type
                switch (type) {
                    case work_type.FACTION:
                        flag_switch_work = (activity != current_work.factionName)
                        break

                    case work_type.COMPANY:
                        //we need to check for promotion
                        flag_switch_work = true
                        //stop
                        break

                    case work_type.CRIME:
                        flag_switch_work = (activity != current_work.crimeType)
                        //stop
                        break

                    case work_type.CREATE_PROGRAM:
                        flag_switch_work = (activity != current_work.programName)
                        //stop
                        break

                    case work_type.STUDY:
                        flag_switch_work = (activity != current_work.classType)
                        //stop
                        break

                    case work_type.GRAFTING:
                        flag_switch_work = (activity != current_work.augmentation)
                        //stop
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
                    //get best work type
                    const work_type_best = this.get_best_work_faction(ns, player, activity, formulas_available)
                    //if not working
                    if (current_work == null) {
                        //work for worktype
                        return ns.singularity.workForFaction(activity, work_type_best, true)
                    }
                    //check if we are working for faction
                    if (current_work.hasOwnProperty("factionWorkType")) {
                        //check if not already working for same worktype
                        if (current_work.factionWorkType != work_type_best) {
                            //work for worktype
                            return ns.singularity.workForFaction(activity, work_type_best, true)
                        }
                    } else {
                        //work for worktype
                        return ns.singularity.workForFaction(activity, work_type_best, true)
                    }

                    //already working for the best type
                    return true

                case work_type.COMPANY:
                    //get best company work   
                    const jobfield = this.get_best_work_company(ns, player)
                    //apply to company or try to get promotion (will cancel current job & job work for another company)
                    ns.singularity.applyToCompany(activity, jobfield)
                    //refresh player
                    player = ns.getPlayer()
                    //update current activity
                    //get current work
                    current_work = ns.singularity.getCurrentWork()
                    //if not doing anything
                    if (activity == null || activity == undefined) {
                        //work for company
                        return ns.singularity.workForCompany(activity, true)
                    }
                    //if we are working for a differnent company but have a job at the target company
                    if (activity != current_work.companyName && player.jobs.hasOwnProperty(activity)) {
                        //work for company
                        return ns.singularity.workForCompany(activity, true)
                    }

                    //we don't have the job, return failure
                    return false

                case work_type.CRIME:
                    //commit crime (calc for best crime has already happened)
                    return ns.singularity.commitCrime(activity, true)

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
                            return ns.singularity.universityCourse(university, "Algorithms", true)


                        case "str":
                            return ns.singularity.gymWorkout(gym, "str", true)

                        case "def":
                            return ns.singularity.gymWorkout(gym, "def", true)


                        case "dex":
                            return ns.singularity.gymWorkout(gym, "dex", true)


                        case "agi":
                            return ns.singularity.gymWorkout(gym, "agi", true)


                        case "charisma":
                        case "Leadership":
                            return ns.singularity.universityCourse(university, "Leadership", true)

                        default:
                            log.error(ns, "Singularity", "Uncaught study activity: '" + JSON.stringify(activity) +
                                "'")
                    }

                case work_type.CREATE_PROGRAM:
                    //ns.singularity.createProgram()
                    return true

                case work_type.GRAFTING:
                    //skip for now
                    return true

                default:
                    log.error(ns, "Singularity", "Uncaught work_type 2: '" + work_type + "'")
            }
            //no need to switch
        } else {
            //indicate success
            return true
        }
    }


    //get the best work for a company
    get_best_work_company(ns, player) { //, formulas_available) {
        //determine job field
        var jobfield = "Software"
        //from https://github.com/bitburner-official/bitburner-src/blob/dev/src/Company/data/CompanyPositionsMetadata.ts            
        //Software -> CTO (Chief Technology Officer)
        //Hacking:  85-85-80-75-75-25-70-65
        //Charisma: 15-15-20-25-25-25-30-35
        var gains_software = (0.75 * player.skills.hacking) + (0.25 * player.skills.charisma)
        //Business -> CEO (Chief Executive Officer)
        //Charisma: 90-85-85-85-90-90
        //Hacking:  10-15-15-15-10-10            
        var gains_business = (0.15 * player.skills.hacking) + (0.85 * player.skills.charisma)
        //if we can use formula's
        /*if(formulas_available) {
            //requires JobName...
            //correct the gains
            gains_software = ns.formulas.companyGains(player,company,"Software",1).reputation
            gains_business = ns.formulas.companyGains(player,company,"Business",1).reputation
        }*/
        //check if business is better
        if (gains_business > gains_business) {
            //set to business
            jobfield = "Business"
        }
        //return the jobfield
        return jobfield
    }


    //get best work for faction
    get_best_work_faction(ns, player, faction, formulas_available) {
        //get faction work types
        const faction_work_types = ns.singularity.getFactionWorkTypes(faction)
        //default to first work type
        var work_type_best = faction_work_types[0]
        //if formulas are available
        if (formulas_available) {
            //save best gains
            var best_rep = -1
            //for each worktype
            for (const work_type of faction_work_types) {
                //get the gains
                const workstats = ns.formulas.factionGains(player, work_type, 1)
                //if better than what we have
                if (workstats.reputation > best_rep) {
                    //save the gains
                    best_rep = workstats.reputation
                    //save the work type
                    work_type_best = work_type
                }
            }
        }
        //return the best work type
        return work_type_best
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


    //function that determines the next bitnode, following the described path
    determine_next_bitnode(ns) {
        //plot a path
        const bitnode_path = [
            //start
            [1,
                1
            ], //This Source-File lets the player start with 32GB of RAM on their home computer when entering a new BitNode
            //increases all of the player's multipliers by: 16%			


            //automation
            [4,
            1], //This Source-File lets you access and use the Singularity functions outside of this BitNode.
            //reduces the RAM cost of singularity functions in other BitNodes: 16x
            [4, 2], //reduces the RAM cost of singularity functions in other BitNodes: 4x
            [4, 3], //reduces the RAM cost of singularity functions in other BitNodes: 1x

            //general boost
            [1, 2], //increases all of the player's multipliers by: 24%
            [1, 3], //increases all of the player's multipliers by: 28%
            //permanent stat
            [5,
                1
            ], //This Source-File grants you a new stat called Intelligence. Intelligence is unique because it is permanent and persistent (it never gets reset back to 1). However, gaining Intelligence experience is much slower than other stats. Higher Intelligence levels will boost your production for many actions in the game.
            //In addition, this Source-File will unlock: getBitNodeMultipliers(), Permanent access to formulas, Access to BitNode multiplier information on the Stats page
            //It will also raise all of your hacking-related multipliers by: 8%
            [15,
            1], //Permanently start with the TOR router and darkscape, and unlock the full dark web on all BitNodes.
            //increase all of your Bladeburner multipliers by: 8%
            [8, 1], //Permanent access to WSE and TIX API
            //increases your hacking growth multipliers by: 12%
            [8, 2], //Ability to short stocks in other BitNodes
            //increases your hacking growth multipliers by: 18%
            [8, 3], //Ability to use limit/stop orders in other BitNodes
            //increases your hacking growth multipliers by: 21%
            [10, 1], //Unlocks Sleeve and Grafting API in other BitNodes. 

            //money
            [2,
            1], //This Source-File allows you to form gangs in other BitNodes once your karma decreases to a certain value. It
            //also increases your crime success rate, crime money, and charisma multipliers by: 24%
            [3,
            1], //This Source-File lets you create corporations on other BitNodes (although some BitNodes will disable this mechanic)
            //increases your charisma and	company salary multipliers by: 8%
            [3, 2], //increases your charisma and	company salary multipliers by: 12%
            [3, 3], //increases your charisma and	company salary multipliers by: 14%
            //permanently unlocks the full API (warehouse & office API)

            [10, 2], //grants extra sleeve
            [10, 3], //grants extra sleeve


            [6, 1], //This Source-File allows you to access the NSA's Bladeburner division in other BitNodes. 
            //raise both the level and experience gain rate of all your combat stats by: 8%

            [9, 1], //Permanently unlocks the Hacknet Server in other BitNodes
            //increases hacknet production and reduces hacknet costs by: 12%
            [9, 2], //You start with 128GB of RAM on your home computer when entering a new BitNode
            //increases hacknet production and reduces hacknet costs by: 18%
            [9,
            3], //Grants a highly-upgraded Hacknet Server when entering a new BitNode	(Note that the Level 3 effect of this Source-File only applies when entering a new BitNode, NOT when installing
            //increases hacknet production and reduces hacknet costs by: 21%

            [11,
                1
            ], //company favor increases BOTH the player's salary and reputation gain rate at that company by 1% per favor (rather than just the reputation gain)
            //increases the player's company salary and reputation gain multipliers by: 32%
            //reduces the price increase for every augmentation bought by: 4%		
            [11, 2], //increases the player's company salary and reputation gain multipliers by: 48%
            //reduces the price increase for every augmentation bought by: 6%
            [11, 3], //increases the player's company salary and reputation gain multipliers by: 56%
            //reduces the price increase for every augmentation bought by: 7%



            [13, 1], //Unlock Stanek's gift

            [15,
            2], //Your charisma level increases job salary and rep gain. Also increases authentication speed by 20%
            [15,
            3], //Your charisma level increases faction work rep gain. Also increases the xp and money gained from .cache files by 50%.

            [2, 2], //increases your crime success rate, crime money, and charisma multipliers by: 36%
            [2, 3], //increases your crime success rate, crime money, and charisma multipliers by: 42%


            [14, 1], //100% increased stat multipliers from Node Power
            //max favor for winstreak: 200k rep equivalent
            //reputation converted to favor for winning two games in a row to: 1000 rep to favor	
            [14, 2], //Permanently unlocks the go.cheat API
            //max favor for winstreak: 300k rep equivalent
            //reputation converted to favor for winning two games in a row to: 1500 rep to favor
            [14, 3], //25% additive increased success rate for the go.cheat API
            //max favor for winstreak: 400k rep equivalent
            //reputation converted to favor for winning two games in a row to: 2000 rep to favor

            //unlocks
            [13, 2], //increases Stanek's size
            [13, 3], //increases Stanek's size

            [6, 2], //raise both the level and experience gain rate of all your combat stats by: 12%
            [6, 3], //raise both the level and experience gain rate of all your combat stats by: 14%

            [7, 1], //This Source-File allows you to access the NSA's Bladeburner division in other BitNodes
            [7, 2], //increase all of your Bladeburner multipliers by: 12%
            [7, 3], //increase all of your Bladeburner multipliers by: 14%
            //immediately receive "BladesSimulacrum" augmentation after joining the Bladeburner division

            //boosts
            [5, 2], //raises all of your hacking-related multipliers by: 12%
            [5, 3], //raises all of your hacking-related multipliers by: 14%

            [12,
                999
            ], //This Source-File lets you start any BitNodes with Neuroflux Governor equal to the level of this Source-File
        ]

        //14: does go winning 2 times in a row changes converts rep to favor, eliminating the need for resets (only for installations of augments?)
        //which factions can do this?
        //can we get away without installing augments? e.g. grafting?


        //get rest information
        const reset_info = ns.getResetInfo()
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
            owned_source_files.set(reset_info.currentNode, new_level)
            //source file is not in owned source files
        } else {
            //add to owned source files
            owned_source_files.set(reset_info.currentNode, 1)
        }
        //debug
        //log.info(ns, "Singularity", "owned_source_files: '" + JSON.stringify([...owned_source_files.entries()]) + "'", true)

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
        if (sum_sf > Math.floor(sf_12_owned * this.sf_12_mult)) {
            //focus SF12
            return 12
        }

        //for each planned step
        for (const step of bitnode_path) {
            //gather the information to check
            const bitnode = step[0]
            const level = step[1]
            //if we don't have this bitnode
            if (!owned_source_files.has(bitnode)) {
                //return this bitnode number
                return bitnode
            }
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
        */
    }


    /*
    ns.stock.hasWseAccount      -> covered in stock
    ns.stock.hasTixApiAccess    -> covered in stock
    ns.stock.getPosition        -> covered in stock
    ns.stock.sellStock          -> covered in stock
    */
    sell_all_stocks(ns) {
        //if we're allowed to trade
        if (ns.stock.hasWseAccount() && ns.stock.hasTixApiAccess()) {
            try {
                //for each order
                for (const symbol of CONSTANTS.STOCK_SYMBOLS) {
                    //get stocks
                    const [sharesLong, avgLongPrice, sharesShort, avgShortPrice] = ns.stock.getPosition(symbol)
                    //if we have longs
                    if (sharesLong > 0) {
                        //just sell
                        const profit = ns.stock.sellStock(symbol, shares)
                    }
                    if (sharesShort > 0) {
                        //TODO
                    }
                }
            } catch (err) {
                log.error(ns, "Singularity", "Error: " + err, true)
            }
        }
    }

    //end of object
}