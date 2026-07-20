//If you are not in BitNode-2, then you must have Source-File 2 in order to use this API.
//Outside BitNode 2, your karma must be less than or equal to 54000.


import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"
import * as evaluate from "scripts/sub/evaluate.js"


// Declaration
export class gang_obj {
    constructor() {}


    //set information
    async init(ns) {
        //Check if you're in a gang. Does not require API access.
        this.gang_started = await evaluate.exec(ns, "ns.gang.inGang()")
        //create variable to fill
        this.tasks = []
        //List member task names.
        const task_names = await evaluate.exec(ns, "ns.gang.getTaskNames()")
        //for each task
        for (const task of task_names) {
            //Get stats of a task.
            const task_stats = await evaluate.exec(ns, "ns.gang.getTaskStats('" + task + "')")
            //add to variable
            this.tasks.push({
                name: task,
                stats: task_stats
            })
        }
        //create variable to fill
        this.equipment = []
        //List equipment names.
        const equipment_names = await evaluate.exec(ns, "ns.gang.getEquipmentNames()")
        //for each equipment
        for (const equipment_name of equipment_names) {
            //Get cost of equipment.
            const equipment_cost = await evaluate.exec(ns, "ns.gang.getEquipmentCost('" + equipment_name + "')")
            //Get stats of an equipment.
            const equipment_stats = await evaluate.exec(ns, "ns.gang.getEquipmentStats('" + equipment_name + "')")
            //Get type of an equipment.
            const equipment_type = await evaluate.exec(ns, "ns.gang.getEquipmentType('" + equipment_name + "')")
            //add to variable
            this.equipment.push({
                name: equipment_name,
                cost: equipment_cost,
                stats: equipment_stats,
                type: equipment_type
            })
        }
        //default members (no gang yet)
        this.members_amount = 0
        //set to empty
        this.focus = ""
        this.faction = ""
        this.clashing = false
        //if gang is started already
        if (this.gang_started) {
            //Get information about your gang.
            const gang_information = await evaluate.exec(ns, "ns.gang.getGangInformation()")
            //default focus to combat
            this.focus = "combat"
            //check type of gang
            if (gang_information.isHacking) {
                //set focus to hacking
                this.focus = "hacking"
            }
            //save faction
            this.faction = gang_information.faction
            //get names
            const gang_member_name = await evaluate.exec(ns, "ns.gang.getMemberNames()")
            //set the amount of members
            this.members_amount = gang_member_name.length
            //set if clashing
            this.clashing = gang_information.territoryWarfareEngaged
        }
    }


    //manages the gang
    async manage(ns) {
        //if gang not yet started
        if (!this.gang_started) {
            //set default focus to combat
            this.focus = "combat"
            this.faction = "Slum Snakes"
            //check if switch to hacking
            if (false) {
                //set focus to hacking
                this.focus = "hacking"
                this.faction = "TODO"
            }
            //Create a gang.
            const gang_created = await evaluate.exec(ns, "ns.gang.createGang('" + this.faction + "')")
            //if gang is created
            if (gang_created) {
                //you always start with 2 members?
                this.members_amount = 2
                //set flag    
                this.gang_started = true
                //log
                log.success(ns, "Gang", "Started gang with faction '" + +"' (" + this.focus + ")")
            } else {
                //stop
                return
            }
        }
        //manage the members
        await manage_members(ns)
        //manage clash
        await manage_clash(ns)
        //manage actions?
        await manage_actions(ns)
    }

    async manage_members(ns) {
        //Check how many gang members you can currently recruit.
        const recruits_available = await evaluate.exec(ns, "ns.gang.getRecruitsAvailable()")
        //for every recruit available         
        for (let i = 0; i < recruits_available; i++) {
            //Recruit a new gang member.
            ns.gang.recruitMember("thug-" + this.members_amount)
            //up the count
            this.members_amount += 1
        }
        //List all gang members.
        const gang_members = await evaluate.exec(ns, "ns.gang.getMemberNames()")
        //for each member
        for (const gang_member of gang_members) {
            //Get information about a specific gang member.
            const member_information = await evaluate.exec(ns, "ns.gang.getMemberInformation('" + gang_member +
                "')")
            //ascension
            await manage_ascension(ns, gang_member, member_information)
            //equipment
            await manage_equipment(ns, gang_member, member_information)
        }
    }


    //manage ascension
    async manage_ascension(ns, gang_member, member_information) {
        //TODO: tune to good multiplier
        const multiplier_min = 3
        //Get the result of an ascension without ascending.
        await evaluate.exec(ns, "ns.gang.getAscensionResult('" + gang_member + "')")
        //Get the effect of an install on ascension multipliers without installing.
        await evaluate.exec(ns, "ns.gang.getInstallResult('" + gang_member + "')")
        //Ascend a gang member.
        await evaluate.exec(ns, "s.gang.ascendMember('" + gang_member + "')")
    }


    //manage equipment
    //what about augmentations?
    async manage_equipment(ns, gang_member, member_information) {
        //for each equipment
        for (const equipment of this.equipment) {
            //if the correct type and if not already owned
            if (this.focus == equipment.type && !member_information.upgrades.includes(equipment)) {
                //just try to buy?
                //Purchase an equipment for a gang member.
                await evaluate.exec(ns, "ns.gang.purchaseEquipment('" + gang_member + "','" + equipment + "')")
            }
        }
    }


    //activate clash when we win all
    async manage_clash(ns) {
        //if already clashing
        if (this.clashing) {
            //stop
            return
        }
        //keep track of win chance
        var clash_min_chance_win = 1
        //Get information about all gangs.
        const gang_others_information = await evaluate.exec(ns, "ns.gang.ns.gang.getAllGangInformation()")
        //for each gang
        for (const other_gang of gang_others_information) {
            //if player's gang
            if (other_gang == this.faction) {
                //do nothing
                continue
            }
            //Get chance to win clash with other gang.
            const chance_win = await evaluate.exec(ns, "ns.gang.ns.gang.getChanceToWinClash('" + other_gang + "')")
            //save the lowest chance
            clash_min_chance_win = Math.min(clash_min_chance_win, chance_win)
        }
        //if we can win all at 100%
        if (clash_min_chance_win == 1) {
            //Enable territory clashes.
            await evaluate.exec(ns, "ns.gang.ns.gang.setTerritoryWarfare(true)")
            //set flag
            this.clashing = true
        }
    }


    //manage actions of a gang member
    async manage_actions(ns, gang_member, member_information) {
        //if clashing
        if (false) {//this.clashing) {
            //set to specific task    
            const best_task = ""
            //if the new task is different
            if (best_task != member_information.task) {
                //Set gang member to task.
                await evaluate.exec(ns, "ns.gang.setMemberTask('" + gang_member + "','" + best_task + "')")
            }
            //stop
            return
        } else {
            //TODO: how to set focus?
            //default to money focus
            var task_focus = "money"
            //task_focus = "respect"
            //task_focus = "wanted"
            //variable to keep track
            var best_task = ""
            var best_value = 0


            //TODO: factor in stat weights?
            for (const task of this.tasks) {
                //check if we can execute
                if ((task.stats.isCombat && this.focus != "hacking") || (task.stats.isHacking && this.focus ==
                        "hacking")) {
                    //set value
                    var value = 0
                    //if focus on respect
                    if (task_focus == "respect") {
                        value = task.stats.baseRespect
                        //if focus on wanted
                    } else if (task_focus = "wanted") {
                        value = task.stats.baseWanted
                        //if focus on money
                    } else {
                        value = task.stats.baseMoney
                    }
                    //if better than what we have
                    if (value > best_value) {
                        //update best value
                        best_value = value
                        //update best task
                        best_task = task.name

                    }
                }
            }

            //if the new task is different
            if (best_task != member_information.task) {
                //Set gang member to task.
                await evaluate.exec(ns, "ns.gang.setMemberTask('" + gang_member + "','" + best_task + "')")
            }
        }
    }
}

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