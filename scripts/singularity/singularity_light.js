//config
import { DISABLE_LOGGING, CRIME_CHANCE_MIN, SKILL_MIN } from "./config.js"


//constants
import { GYMS, UNIVERSITIES, WORK_TYPE } from "./constants.js"


//functions
import * as log from "scripts/util/log.js"


export class singularity_light_obj {
    constructor() {
        this.tor_owned = false
        //config
        //min chance for a crime
        this.crime_min_chance = CRIME_CHANCE_MIN //65% chance
        //minimum skill
        this.skill_min = SKILL_MIN

    }


    init(ns, handles) {
        //disable logging
        log.disable(ns, DISABLE_LOGGING)

        //get tools
        const executables = ns.ls(CONSTANTS.SERVER.HOME, CONSTANTS.FILE_EXTENSION.EXECUTABLE)
        this.brute_ssh = executables.includes(CONSTANTS.TOOLS.HACKING.BRUTE_SSH)
        this.ftp_crack = executables.includes(CONSTANTS.TOOLS.HACKING.FTP_CRACK)
        this.relay_smtp = executables.includes(CONSTANTS.TOOLS.HACKING.RELAY_SMTP)
        this.http_worm = executables.includes(CONSTANTS.TOOLS.HACKING.HTTP_WORM)
        this.sql_inject = executables.includes(CONSTANTS.TOOLS.HACKING.SQL_INJECT)
        this.darknet = executables.includes(CONSTANTS.TOOLS.DARKNET)
        //determine next bitnode

        //log
        log.info(ns, "Singularity_light", "Init complete")
    }


    async manage(ns, handles) {
        //upgrade home
        this.upgrade_home(ns)
        //manage player
        this.manage_player(ns, handles.hasOwnProperty(CONSTANTS.HANDLE.DARKNET), handles
            .hasOwnProperty(CONSTANTS.HANDLE.INTELLIGENCE))
    }


    //upgrade home
    upgrade_home(ns) {
        //Upgrade home computer RAM.
        if (ns.singularity.upgradeHomeRam()) {
            //get server
            const server = ns.getServer(CONSTANTS.SERVER.HOME)
            //log
            log.success(ns, "Singularity", "Upgraded home RAM to " + server.maxRam, true)
        }
    }


    

    //function that manages the player (studying, working for factions, working for companies, committing crimes)
    manage_player(ns, darknet_started, formulas_available) {
        //work towards gang: 30 combat (str, def, dex, con) to unlock Slum Snakes, or ?? hacking + ?? tooling to unlock NiteSec
        if (this.study(ns)) return true
        //get money
        this.commit_crime(ns)
        //stop
        return false
    }

   

    /*
    getPlayer   
    */
    study(ns) {
        //get skills
        const skills = ns.getPlayer().skills
        //hacking < combat < charisma
        if (skills.hacking < this.skill_min) {
            return this.perform_action(ns, WORK_TYPE.STUDY, "Algorithms")

        } else if (skills.strength < this.skill_min) {
            return this.perform_action(ns, WORK_TYPE.STUDY, "str")

        } else if (skills.defense < this.skill_min) {
            return this.perform_action(ns, WORK_TYPE.STUDY, "def")

        } else if (skills.dexterity < this.skill_min) {
            return this.perform_action(ns, WORK_TYPE.STUDY, "dex")

        } else if (skills.agility < this.skill_min) {
            return this.perform_action(ns, WORK_TYPE.STUDY, "agi")

        } else if (skills.charisma < this.skill_min) {
            return this.perform_action(ns, WORK_TYPE.STUDY, "Leadership")
        }
        //we have all the stats we need
        return false
    }


    //commit crime
    commit_crime(ns) {
        //save best crime
        let best_crime = "Mug"
        //best score
        let best_score = 0
        //get crimes
        for (const name in ns.enums.CrimeType) {
            //get the actual crime
            const crime = ns.enums.CrimeType[name]
            //get chrime change
            const crime_chance = ns.singularity.getCrimeChance(crime)
            //check for chance
            if (crime_chance >= this.crime_min_chance) {
                //set crime to this (deeper is better)
                best_crime = crime
            }
        }
        //default to mug for now
        this.perform_action(ns, WORK_TYPE.CRIME, best_crime)
    }


    /*
    function that tries to perform the action, if not already performing it (also guarding if work shouldn't be switched (e.g. grafting))
    */
    perform_action(ns, type, activity, formulas_available = false) {
        //get player
        let player = ns.getPlayer()
        //flag to keep track if we need to switch
        let flag_switch_work = false
        //get current work
        let current_work = ns.singularity.getCurrentWork()
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
                    case WORK_TYPE.FACTION:
                        flag_switch_work = (activity != current_work.factionName)
                        break

                    case WORK_TYPE.COMPANY:
                        //we need to check for promotion
                        flag_switch_work = true
                        //stop
                        break

                    case WORK_TYPE.CRIME:
                        flag_switch_work = (activity != current_work.crimeType)
                        //stop
                        break

                    case WORK_TYPE.CREATE_PROGRAM:
                        flag_switch_work = (activity != current_work.programName)
                        //stop
                        break

                    case WORK_TYPE.STUDY:
                        flag_switch_work = (activity != current_work.classType)
                        //stop
                        break

                    case WORK_TYPE.GRAFTING:
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

                case WORK_TYPE.FACTION:
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

                case WORK_TYPE.COMPANY:
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

                case WORK_TYPE.CRIME:
                    //commit crime (calc for best crime has already happened)
                    return ns.singularity.commitCrime(activity, true)

                case WORK_TYPE.STUDY:
                    //get city
                    const city = ns.getPlayer().city
                    //guard clause: if not in a correct city
                    if (city != "Sector-12" && city != "Aevum" && city != "Volhaven") {
                        //stop (for now)
                        return
                    }
                    //get university
                    const university = UNIVERSITIES[city]
                    //get gym
                    const gym = GYMS[city]
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

                case WORK_TYPE.CREATE_PROGRAM:
                    //ns.singularity.createProgram()
                    return true

                case WORK_TYPE.GRAFTING:
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


    //end of object
}
