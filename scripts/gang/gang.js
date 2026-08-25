//config
import { DISABLE_LOGGING, SKILL_LEVEL_MIN, CLASH_WIN_CHANCE, ASCENSION_MIN_MULT, EQUIPMENT_MIN_PERCENTAGE, MEMBER_NAME } from "./config.js"


//constants
import { EQUIPMENT, TASKS, TASK, KARMA_NEEDED, MEMBERS_MAX, GANG_FOCUS, GANG_FACTION, GANG_NAMES } from "./constants.js"


//functions
import * as log from "scripts/util/log.js"


//25 GB
export class gang_obj {
    constructor() {}


    //set information
    init(ns, handles) {
        //disable logging
        log.disable(ns, DISABLE_LOGGING)
        
        //TODO
        //set the softcap
        //this.GangSoftcap = currentNodeMults.GangSoftcap
        
        //determine the type according to the mults
        this.focus = GANG_FOCUS.combat
        //set hostname
        this.faction = GANG_FACTION.combat
        //if hacking is better in this node?
        if (false) {
            //set focus to hacking
            this.focus = GANG_FOCUS.hacking
            //set hostname
            this.faction = GANG_FACTION.hacking
        }
        //Check if you're in a gang. Does not require API access.
        this.gang_started = ns.gang.inGang()
        //set members to max, to be corrected later
        this.gang_members_amount = 0
        //check if need to check
        if (gang_started) {
            //for each possible member
            for (let i = 0; i < MEMBERS_MAX; i++) {
                //create the member name
                const member_name = MEMBER_NAME + i
                //Get information about a specific gang member.
                const member_information = ns.gang.getMemberInformation(member_name)
                //valid member if not null? TODO: check
                if (member_information != null) {
                    //up the member count
                    this.gang_members_amount += 1
                    //invalid member
                } else {
                    //stop
                    break
                }
            }
        }
        //create letiable to fill
        this.tasks = []
        //for each task
        for (const task of TASKS) {
            //letiable to check if correct task
            let flag_correct_task = false
            //check if correct type
            if (this.focus == GANG_FOCUS.hacking) {
                //copy the letiable to the flag
                flag_correct_task = task.isHacking
                //combat focus
            } else {
                //copy the letiable to the flag
                flag_correct_task = task.isCombat
            }
            //if a correct task
            if (flag_correct_task) {
                //add to task list
                this.tasks.push(task)
            }
        }
        //create letiable to fill
        this.equipment = []
        //for each equipment
        for (const equipment of EQUIPMENT) {
            //letiable to check if correct task
            let flag_correct_equipment = false
            //for hacking: hack & cha
            if (this.focus == GANG_FOCUS.hacking) {
                //check the attributes
                if (hasattr(equipment.mults, "hack") || hasattr(equipment.mults, "cha")) {
                    //copy the letiable to the flag
                    flag_correct_equipment = true
                }
                //combat focus: str & con & dex & def
            } else if (hasattr(equipment.mults, "str") || hasattr(equipment.mults, "def") || hasattr(equipment
                    .mults, "dex") || hasattr(equipment.mults, "agi")) {
                //copy the letiable to the flag
                flag_correct_equipment = true
            }
            //if a correct task
            if (flag_correct_equipment) {
                //add to task list
                this.equipment.push(equipment)
            }
        }
        //calc number of equipment / augments before next task
        this.equipment_min = Math.min(EQUIPMENT_MIN_PERCENTAGE * this.equipment.length)
    }


    //manages the gang
    async manage(ns) {
        //if gang not yet started
        if (!this.gang_started) {
            //Create a gang.
            const gang_created = ns.gang.createGang(this.faction)
            //if gang is created
            if (gang_created) {
                //set flag    
                this.gang_started = true
                //log
                log.success(ns, "Gang", "Started gang with faction '" + this.faction + "' (" + this.focus + ")")
            } else {
                //stop
                return
            }
        }
        //manage the members
        this.manage_members(ns)
        //manage actions
        await this.manage_actions(ns)
    }


    /*
        ns.gang.recruitMember(name)                         2   Recruit a new gang member
        ns.gang.getMemberInformation(name)                  2   Get information about a specific gang member.
    */
    manage_members(ns) {
        //for every recruit available         
        for (let i = this.gang_members_amount; i < MEMBERS_MAX; i++) {
            //Recruit a new gang member.
            //check if successfull
            if (ns.gang.recruitMember(GANG_MEMBER_NAME + i)) {
                //up the count
                this.gang_members_amount += 1
                //not successfull
            } else {
                //stop
                break
            }
        }
        //for each member
        for (let i = 0; i < this.gang_members_amount; i++) {
            //create the member name
            const member_name = GANG_MEMBER_NAME + i
            //Get information about a specific gang member.
            const member_information = ns.gang.getMemberInformation(member_name)
            //ascension
            this.manage_ascension(ns, member_name, member_information)
            //equipment
            this.manage_equipment(ns, member_name, member_information)
        }
    }


    /*
    ns.gang.ascendMember(memberName)                    4   Ascend a gang member. 
    ns.gang.getAscensionResult(memberName)              2   Get the result of an ascension without ascending.
    ns.gang.getInstallResult(memberName)                2   Get the effect of an install on ascension multipliers without installing.  
    */
    //manage ascension -> TODO
    manage_ascension(ns, gang_member, member_information) {
        //TODO
        //Get the result of an ascension without ascending.
        ns.gang.getAscensionResult(gang_member)
        //Get the effect of an install on ascension multipliers without installing.
        ns.gang.getInstallResult(gang_member)
        //if the increase if equal or more than we want
        if (false) { //GANG_ASCENSION_MIN_MULT
            //Ascend a gang member.
            ns.gang.ascendMember(gang_member)
        }
    }


    /*
    ns.gang.purchaseEquipment(memberName, equipName)    4   Purchase an equipment for a gang member.
    */
    //manage equipment
    manage_equipment(ns, gang_member, member_information) {
        //for each equipment
        for (const equipment of this.equipment) {
            //if the correct type and if not already owned
            if (!member_information.upgrades.includes(equipment.name)) {
                //Purchase an equipment for a gang member.
                ns.gang.purchaseEquipment(gang_member, equipment.name)
            }
        }
    }


    /*
    ns.gang.setMemberTask(memberName, taskName)         2   Set gang member to task.
    */
    //manage actions of a gang member
    async manage_actions(ns) {
        //get own gang information
        let gang_information = ns.gang.getGangInformation()
        //check if we own all territory
        if (gang_information.territory >= 1) {
            //for each member
            for (let i = 0; i < this.gang_members_amount; i++) {
                //create the name
                const gang_member_name = GANG_MEMBER_NAME + i
                //get information
                const gang_member_information = ns.gang.getMemberInformation(name)
                //get money
                this.work_for_money(ns, gang_member_name, gang_member_information, gang_information)
            }
            //not all territory is owned
        } else {
            //see if need to clash
            if (this.manage_clash(ns) == true) {
                //for each member
                for (let i = 0; i < this.gang_members_amount; i++) {
                    //create the name
                    const gang_member_name = GANG_MEMBER_NAME + i
                    //get information
                    const gang_member_information = ns.gang.getMemberInformation(name)
                    //check if not performing the task
                    if (gang_member_information.task != GANG_TASK.TerritoryWarfare) {
                        //set to territory clash
                        ns.gang.setMemberTask(gang_member_name, GANG_TASK.TerritoryWarfare)
                    }
                }
                //not clashing
            } else {
                //for each member
                for (let i = 0; i < this.gang_members_amount; i++) {
                    //update the information
                    gang_information = ns.gang.getGangInformation()
                    //create the name
                    const gang_member_name = GANG_MEMBER_NAME + i
                    //get information
                    const gang_member_information = ns.gang.getMemberInformation(name)
                    //if the wanted is going up
                    if (gang_information.wantedLevelGainRate > 0) {
                        //set to lower wanted
                        let activity = TASK.VigilanteJustice
                        //if scope is hacking
                        if (this.focus == GANG_FOCUS.hacking) {
                            //set to hacking letaiant
                            activity = TASK.EthicalHacking
                        }
                        //set to lower wanted
                        ns.gang.setMemberTask(gang_member_name, activity)
                        //wait until next update to update the wanted level gain rate
                        await ns.gang.nextUpdate()

                        //wanted level is OK         
                    } else {
                        //TODO: do we need charisma?
                        //calc min stat
                        let stat_min = Math.min(gang_member_information.agi, gang_member_information.def,
                            gang_member_information.dex, gang_member_information.str)
                        //if hacking focussed
                        if (this.focus == GANG_FOCUS.hacking) {
                            //set stats to hacking
                            stat_min = gang_member_information.hack
                        }
                        //get number of equipment owned
                        const equipment_owned = [].concat(gang_member_information.upgrades, gang_member_information.augmentations).length
                    
                        //if stat is too low
                        if (stat_min < SKILL_LEVEL_MIN) {
                            //set activity
                            let activity = TASK.TrainCombat
                            //if scope is hacking
                            if (this.focus == GANG_FOCUS.hacking) {
                                //set to hacking letaiant
                                activity = TASK.TrainHacking
                            }
                            //set to train
                            ns.gang.setMemberTask(gang_member_name, activity)

                            //if not all members are unlocked
                        } else if (this.gang_members_amount < MEMBERS_MAX) {
                            //work on respect
                            this.work_for_respect(ns, gang_member_name, gang_member_information, gang_information)

                            //if not all equipment / augments are bought
                        } else if (equipment_owned < this.equipment_min) {
                            //work for money
                            this.work_for_money(ns, gang_member_name, gang_member_information, gang_information)

                            //all ok, grow power
                        } else {
                            //work on power
                            ns.gang.setMemberTask(gang_member_name, GANG_TASK.TerritoryWarfare)
                        }
                    }
                }
            }
        }
    }


    /*
    ns.gang.setTerritoryWarfare(engage)                 2   Enable/Disable territory clashes.
    ns.gang.getChanceToWinClash(gangName)               4   Get chance to win clash with other gang.
    */
    //activate clash when we win all
    manage_clash(ns, gang_information) {
        //keep track of win chance
        let clash_min_chance_win = 1
        //for each gang
        for (const other_gang of GANG_NAMES) {
            //if player's gang
            if (other_gang == this.faction) {
                //do nothing
                continue
            }
            //Get chance to win clash with other gang.
            const chance_win = ns.gang.ns.gang.getChanceToWinClash(other_gang)
            //save the lowest chance
            clash_min_chance_win = Math.min(clash_min_chance_win, chance_win)
        }
        //check if we have enough chance
        const should_clash = (clash_min_chance_win >= CLASH_WIN_CHANCE)
        //set gang to warface according to the chance
        ns.gang.ns.gang.setTerritoryWarfare(should_clash)
        //return if clashing
        return should_clash
    }


    //determines the best activity for money
    work_for_money(ns, gang_member_name, gang_member_information, gang_information) {
        //keep track of best task
        let best_task = TASK.Unassigned
        //keep track of best money
        let best_score = 0
        //for each task
        for (const task of this.tasks) {
            //check if task has money
            if (task.baseMoney > 0) {
                //letiable for calculation
                let statWeight = 0
                //check for each stat
                if (Object.hasOwn(task.params, "hackWeight")) {
                    statWeight += (task.params.hackWeight / 100) * gang_member_information.hack
                }
                if (Object.hasOwn(task.params, "strWeight")) {
                    statWeight += (task.params.strWeight / 100) * gang_member_information.str
                }
                if (Object.hasOwn(task.params, "defWeight")) {
                    statWeight += (task.params.defWeight / 100) * gang_member_information.def
                }
                if (Object.hasOwn(task.params, "dexWeight")) {
                    statWeight += (task.params.dexWeight / 100) * gang_member_information.dex
                }
                if (Object.hasOwn(task.params, "agiWeight")) {
                    statWeight += (task.params.agiWeight / 100) * gang_member_information.agi
                }
                if (Object.hasOwn(task.params, "chaWeight")) {
                    statWeight += (task.params.agiWeight / 100) * gang_member_information.cha
                }
                //adjust by the difficulty
                statWeight -= 3.2 * task.difficulty
                //if useless
                if (statWeight <= 0) {
                    //next
                    continue
                }
                //set default territory mult
                let territoryMult = 0.005
                //if there is territory influence
                if (Object.hasOwn(task.params, "territory")) {
                    //and the influence is on money
                    if (Object.hasOwn(task.params.territory, "money")) {
                        //re-calc territory mult
                        territoryMult = Math.max(0.005, Math.pow(gang_information.territory * 100, task.params
                            .territory.money) / 100)
                    }
                }
                //if useless
                if (territoryMult <= 0) {
                    //next
                    continue
                }
                //calc territory penalty
                const territoryPenalty = (0.2 * gang_information.territory + 0.8) * this.GangSoftcap
                //calc total score
                const score = Math.pow(5 * task.baseMoney * statWeight * territoryMult, territoryPenalty)
                //if better than the one saved
                if (score > best_score) {
                    //overwrite saved
                    best_task = task.name
                    //overwrite score
                    best_score = score
                }
            }
        }
        //work for the best task
        ns.gang.setMemberTask(gang_member_name, best_task)
    }


    //determines the best activity for respect
    work_for_respect(ns, gang_member_name, gang_member_information, gang_information) {
        //keep track of best task
        let best_task = TASK.Unassigned
        //keep track of best money
        let best_score = 0
        //for each task
        for (const task of this.tasks) {
            //check if task has money
            if (task.baseRespect > 0) {
                //letiable for calculation
                let statWeight = 0
                //check for each stat
                if (Object.hasOwn(task.params, "hackWeight")) {
                    statWeight += (task.params.hackWeight / 100) * gang_member_information.hack
                }
                if (Object.hasOwn(task.params, "strWeight")) {
                    statWeight += (task.params.strWeight / 100) * gang_member_information.str
                }
                if (Object.hasOwn(task.params, "defWeight")) {
                    statWeight += (task.params.defWeight / 100) * gang_member_information.def
                }
                if (Object.hasOwn(task.params, "dexWeight")) {
                    statWeight += (task.params.dexWeight / 100) * gang_member_information.dex
                }
                if (Object.hasOwn(task.params, "agiWeight")) {
                    statWeight += (task.params.agiWeight / 100) * gang_member_information.agi
                }
                if (Object.hasOwn(task.params, "chaWeight")) {
                    statWeight += (task.params.agiWeight / 100) * gang_member_information.cha
                }
                //adjust by the difficulty
                statWeight -= 4 * task.difficulty
                //if useless
                if (statWeight <= 0) {
                    //next
                    continue
                }
                //set default territory mult
                let territoryMult = 0.005
                //if there is territory influence
                if (Object.hasOwn(task.params, "territory")) {
                    //and the influence is on money
                    if (Object.hasOwn(task.params.territory, "respect")) {
                        //re-calc territory mult
                        territoryMult = Math.max(0.005, Math.pow(gang_information.territory * 100, task.params
                            .territory.respect) / 100)
                    }
                }
                //if useless
                if (territoryMult <= 0) {
                    //next
                    continue
                }
                //calc territory penalty
                const territoryPenalty = (0.2 * gang_information.territory + 0.8) * this.GangSoftcap
                //calc total score
                const score = Math.pow(11 * task.baseMoney * statWeight * territoryMult, territoryPenalty)
                //if better than the one saved
                if (score > best_score) {
                    //overwrite saved
                    best_task = task.name
                    //overwrite score
                    best_score = score
                }
            }
        }
        //work for the best task
        ns.gang.setMemberTask(gang_member_name, best_task)
    }
}


export function get_number_of_gang_members(ns) {
    //letiable to fill
    let gang_members_amount = 0
    //for each possible member
    for (let i = 0; i < MEMBERS_MAX; i++) {
        //create the member name
        const member_name = GANG_MEMBER_NAME + i
        //Get information about a specific gang member.
        const member_information = ns.gang.getMemberInformation(member_name)
        //valid member if not null? TODO: check
        if (member_information != null) {
            //up the member count
            gang_members_amount += 1
            //invalid member
        } else {
            //stop
            break
        }
    }
    //return the number
    return gang_members_amount
}


/*
Total = 1 + 18 + 6 = 25 GB

Mandatory = 1
    ns.gang.inGang()                                    0   Check if you're in a gang. Does not require API access.
    ns.gang.createGang(faction)                         1   Create a gang.

member (recruit / equipment / install / ascend) = 18
    ns.gang.recruitMember(name)                         2   Recruit a new gang member.
    ns.gang.setMemberTask(memberName, taskName)         2   Set gang member to task.
    ns.gang.getMemberInformation(name)                  2   Get information about a specific gang member.
    ns.gang.getAscensionResult(memberName)              2   Get the result of an ascension without ascending.
    ns.gang.getInstallResult(memberName)                2   Get the effect of an install on ascension multipliers without installing.
    ns.gang.purchaseEquipment(memberName, equipName)    4   Purchase an equipment for a gang member.
    ns.gang.ascendMember(memberName)                    4   Ascend a gang member.   

clash = 6
    ns.gang.setTerritoryWarfare(engage)                 2   Enable/Disable territory clashes.
    ns.gang.getChanceToWinClash(gangName)               4   Get chance to win clash with other gang.


needed?
    ns.gang.getGangInformation()                        2   Get information about your gang.


Not used:
    ns.gang.nextUpdate()                                0   Sleeps until the next Gang update has happened.
    ns.gang.getBonusTime()                              0   Get bonus time.
    ns.gang.renameMember(memberName, newName)           0   Rename a Gang member to a new unique name.


//just hardcode the names and try to recruit
    ns.gang.respectForNextRecruit()                     1   Check the amount of Respect needed for your next gang recruit.
    ns.gang.getMemberNames()                            1   List all gang members.
    ns.gang.getRecruitsAvailable()                      1   Check how many gang members you can currently recruit.
    ns.gang.canRecruitMember()                          1   Check if you can recruit a new gang member.


//hardcode the following:
    ns.gang.getAllGangInformation()                     2   Get information about all gangs.

    ns.gang.getEquipmentCost(equipName)                 2   Get cost of equipment.
    ns.gang.getEquipmentNames()                         0   List equipment names.
    ns.gang.getEquipmentStats(equipName)                2   Get stats of an equipment.
    ns.gang.getEquipmentType(equipName)                 2   Get type of an equipment.

    ns.gang.getTaskStats(name)                          1   Get stats of a task.
    ns.gang.getTaskNames()                              0   List member task names.
*/
