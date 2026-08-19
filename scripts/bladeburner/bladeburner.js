import * as CONSTANTS from "constants.js"
import * as CONFIG from "config.js"

import * as log from 'scripts/util/log.js'


// Declaration
export class bladeburner_obj {
    constructor() {}


    /*
    bladeburner.getOperationNames       0
    bladeburner.getContractNames        0
    bladeburner.getGeneralActionNames   0
    bladeburner.getSkillNames()         0
    */
    init(ns) {
        //disable logging
        log.disable(CONFIG.DISABLE_LOGGING)
        //ns.disableLog("")
        //list all operations
        this.operations = ns.bladeburner.getOperationNames()
        //reverse the order of the operations (higher = better -> lower = better), so you start checking the best contract first
        this.operations.reverse()
        //List all contracts.
        this.contracts = ns.bladeburner.getContractNames()
        //reverse the order of the contracts (higher = better -> lower = better), so you start checking the best contract first
        this.contracts.reverse()
        //List all general actions.
        this.general_actions = ns.bladeburner.getGeneralActionNames()
        //List all skills.
        this.skills = ns.bladeburner.getSkillNames()
        //indicate if player is going to do black op
    }


    /*
    bladeburner.joinBladeburnerDivision   4
    */
    //check if we can start bladeburner actions
    check_start(ns) {
        //if already checked and successfull
        if (this.can_start) {
            //indicate success
            return true
        }
        //get skill levels
        const skills = ns.getPlayer().skills
        //if we have enough stats
        if (skills.agility >= CONSTANTS.MIN_COMBAT_LEVEL &&
            skills.defense >= CONSTANTS.MIN_COMBAT_LEVEL &&
            skills.dexterity >= CONSTANTS.MIN_COMBAT_LEVEL &&
            skills.strength >= CONSTANTS.MIN_COMBAT_LEVEL) {
            this.can_start = ns.bladeburner.joinBladeburnerDivision()
        }
    }


    /*
    ns.getResetInfo     1
    */
    //returns if bladeburner actions can be performed independent of other activities
    can_perform_independent(ns) {
        //get installed augments
        const reset_information = ns.getResetInfo()
        //return if the have the augment
        return reset_information.ownedAugs.has(CONSTANTS.AUGMENT.BS)
    }


    /*
    bladeburner.getStamina                      4
    bladeburner.getNextBlackOp                  2   -> can be replaced by keeping track? or how to handle with resets?..
    bladeburner.getRank                         4
    bladeburner.getActionEstimatedSuccessChance 4
    bladeburner.getActionCountRemaining         4
    */
    //determines action for player
    determine_action(ns) {
        //upgrade skills first, this increases the chances
        upgrade_skills(ns)
        //Get Bladeburner stamina.
        const [stamina_current, stamina_max] = ns.bladeburner.getStamina()

        //black op > op > contract > basic

        //Get an object with the name and rank requirement of the next BlackOp that can be completed.
        const next_black_op = ns.bladeburner.getNextBlackOp()
        //if there are no black ops left
        if (next_black_op != null) {
            //Get player bladeburner rank.
            const rank = ns.bladeburner.getRank()
            //if we have enough rank
            if (rank >= next_black_op.rank) {
                //Set team size to max?
                //await evaluate.exec(ns, "ns.bladeburner.setTeamSize('" + type + "','"  + name + "'," + size + "')" )
                //Get estimate success chance of an action.
                const chance = ns.bladeburner.getActionEstimatedSuccessChance(CONSTANTS.BLADE_BURNER_ACTION_TYPE
                    .black_op, next_black_op)
                //if enough chance
                if (chance >= CONFIG.CHANCE_MIN.BLACK_OP) {
                    //perform black op
                    return {
                        activity_type: CONSTANTS.BLADE_BURNER_ACTION_TYPE.black_op,
                        name: next_black_op
                    }
                }
            }
        }
        //operations
        for (const operation in this.operations) {
            //Get action count remaining.
            const action_count_remaining = ns.bladeburner.getActionCountRemaining(CONSTANTS.BLADE_BURNER_ACTION_TYPE
                .OPERATION, operation)
            //Get estimate success chance of an action.
            const chance_success = ns.bladeburner.getActionEstimatedSuccessChance(CONSTANTS.BLADE_BURNER_ACTION_TYPE
                .OPERATION, operation)
            //if we can do it and we have enough chance
            if (action_count_remaining > 0 && chance_success >= CONFIG.CHANCE_MIN.OPERATION) {
                //return this action
                return {
                    activity_type: CONSTANTS.BLADE_BURNER_ACTION_TYPE.OPERATION,
                    name: operation
                }
            }
        }
        //contracts
        for (const contract in this.contracts) {
            //Get action count remaining.
            const action_count_remaining = ns.bladeburner.getActionCountRemaining(CONSTANTS.BLADE_BURNER_ACTION_TYPE
                .CONTRACT, contract)
            //Get estimate success chance of an action.
            const chance_success = ns.bladeburner.getActionEstimatedSuccessChance(CONSTANTS.BLADE_BURNER_ACTION_TYPE
                .CONTRACT, contract)
            //if we can do it and we have enough chance
            if (action_count_remaining > 0 && chance_success >= 1) {
                //return this action
                return {
                    activity_type: CONSTANTS.BLADE_BURNER_ACTION_TYPE.CONTRACT,
                    name: contract
                }
            }
        }
        //general actions
        //TODO: preference?
        for (const general_action in this.general_actions) {
            //Get estimate success chance of an action.
            const chance_success = ns.bladeburner.getActionEstimatedSuccessChance(type, general_action)
        }
        /*
        //Get the time to complete an action.
        ns.bladeburner.getActionTime(type, name)
        //Get the rank gain of an action.
        ns.bladeburner.getActionRankGain(type, name, level)
        */
        //return blank
        return {}
    }


    //determines actions for sleeves
    determine_actions_sleeves(ns, amount_of_sleeves) {
        //Get estimate success chance of an action.
        //await evaluate.exec(ns, "ns.bladeburner.getActionEstimatedSuccessChance(type, name, sleeveNumber)")

        //return blank
        return [{}]
        //todo: what does SupportMainSleeve do?
        /*
        type SpecialBladeburnerActionEnumTypeForSleeve = {
        InfiltrateSynthoids: "Infiltrate Synthoids";
        SupportMainSleeve: "Support main sleeve";
        TakeOnContracts: "Take on contracts";
        };
        */
    }


    //function that checks if a black op can be performed
    async can_perform_next_black_op(ns) {
        //Get an object with the name and rank requirement of the next BlackOp that can be completed.
        const next_black_op = ns.bladeburner.getNextBlackOp()
        //if there are no black ops left
        if (next_black_op != null) {
            //Get player bladeburner rank.
            const rank = ns.bladeburner.getRank()
            //if we have enough rank
            if (rank >= next_black_op.rank) {
                //Set team size.
                //ns.bladeburner.setTeamSize(type, next_black_op.name, size)
                //Get estimate success chance of an action.
                const chance = ns.bladeburner.getActionEstimatedSuccessChance(type, BladeburnerBlackOpName)
                //if enough chance
                if (chance >= 1) {
                    //perform black op
                    return {}
                } else {

                }
            }
        }
    }


    /*
    bladeburner.getCityChaos                4
    bladeburner.getCityCommunities
    bladeburner.getCityEstimatedPopulation
    bladeburner.getCity                     4
    bladeburner.switchCity
    */
    //determine if to change city
    async change_city(ns) {
        //TODO: enum of cities
        var cities = "TODO"
        //variable to save information into
        var city_information = {}
        //for each city
        for (const city of cities) {
            //Get chaos of a city.
            const city_chaos = ns.bladeburner.getCityChaos(city)
            //Get number of communities in a city.
            const city_communities = ns.bladeburner.getCityCommunities(city)
            //Get estimated population in city.
            const city_population = ns.bladeburner.getCityEstimatedPopulation(city)
            //add to overview
            city_information[city] = {
                chaos: city_chaos,
                communities: city_communities,
                population: city_population
            }
        }
        //TODO: check stats and determine what to do
        const target_city = ""
        //Get current city
        const city_current = ns.bladeburner.getCity()
        //if not in the target city
        if (target_city != city_current) {
            //Travel to another city in Bladeburner.
            ns.bladeburner.switchCity(target_city)
        }
    }


    //function that manages skills
    //TODO: focus on skills?
    async upgrade_skills(ns) {
        //TODO: focus skills?
        //for each skill
        for (const skill in this.skills) {
            //Get skill level.
            ns.bladeburner.getSkillLevel(skill)

            //Get bladeburner skill points.
            ns.bladeburner.getSkillPoints()

            //Get cost to upgrade skill.
            ns.bladeburner.getSkillUpgradeCost(skillName)

            //Upgrade skill.
            ns.bladeburner.upgradeSkill(skill)
        }
    }


    //returns current action information
    async get_current_action(ns) {
        //Get current action
        const current_action = ns.bladeburner.getCurrentAction()
        //return
        return current_action
    }


    //check to see if black ops are completed (and thus bitnode can be destroyed)
    async all_black_ops_completed(ns) {
        //Get an object with the name and rank requirement of the next BlackOp that can be completed.
        ns.bladeburner.getNextBlackOp()
        //return if null
        return (next_black_op == null)
    }


    //starts actions for player
    async start_action(type, name) {
        //Start an action.
        ns.bladeburner.startAction(type, name)
        //TODO: stub
    }


    //starts action for a specific sleeve
    async start_action(sleeve_number, type, name) {
        //TODO: stub
    }
}
