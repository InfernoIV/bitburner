//You have to be employed in the Bladeburner division and be in BitNode 6/7 or have Source-File 6/7 in order to use this API.
/*
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.bladeburner.md
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.bladeburneractionenumtype.md
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.specialbladeburneractionenumtypeforsleeve.md
*/


import * as CONSTANTS from "scripts/constants.js"
import * as evaluate from 'scripts/sub/evaluate.js'
import * as log from 'scripts/sub/log.js'

const blade_burner_action_type = {
    general: "General",
    contract: "Contracts",
    operation: "Operations",
    black_op: "Black Operations",
}


// Declaration
export class bladeburner_obj {
    constructor() {
        //flag to indicate if we can start
        this.can_start = false
    }



    async init(ns) {
        //list all operations
        this.operations = await evaluate.exec(ns, "ns.bladeburner.getOperationNames()")
        //reverse the order of the operations (higher = better -> lower = better), so you start checking the best contract first
        this.operations.reverse()
        //List all contracts.
        this.contracts = await evaluate.exec(ns, "ns.bladeburner.getContractNames()")
        //reverse the order of the contracts (higher = better -> lower = better), so you start checking the best contract first
        this.contracts.reverse()
        //List all general actions.
        this.general_actions = await evaluate.exec(ns, "ns.bladeburner.getGeneralActionNames()")
        //List all skills.
        this.skills = await evaluate.exec(ns, "ns.bladeburner.getSkillNames()")
        //indicate if player is going to do black op
    }


    //check if we can start bladeburner actions
    async can_start(ns) {
        //if already checked and successfull
        if (this.can_start) {
            //indicate success
            return true
        }

    
        /*Join the Bladeburner division.
        Requirements: All combat stats must be at least level 100.
        If you have SF 7.3, you will immediately receive "The Blade's Simulacrum" augmentation and won't be able to accept Stanek's Gift after joining. 
        If you want to accept Stanek's Gift, you must do that before calling this API.
        */
        const joined_bladeburner = await evaluate.exec(ns, "ns.bladeburner.joinBladeburnerDivision()")
        //if joined
        if (joined_bladeburner) {
            //set flag to speed up checking
            this.can_start = true
        }
        //Join the Bladeburner faction. -> needed?
        //ns.bladeburner.joinBladeburnerFaction()
    }



    //returns if bladeburner actions can be performed independent of other activities
    async can_perform_independent(ns) {
        //get installed augments
        const reset_information = await evaluate.exec(ns, "ns.getResetInfo()")
        //return if the have the augment
        return reset_information.ownedAugs.has("BladesSimulacrum")
    }


    //determines action for player
    async determine_action(ns) {
        //upgrade skills first, this increases the chances
        await upgrade_skills(ns)


        /*        type BladeburnerActionEnumType = {
  General: "General";
  Contract: "Contracts";
  Operation: "Operations";
  BlackOp: "Black Operations";
};*/

        //Get Bladeburner stamina.
        const stamina = await evaluate.exec(ns, "ns.bladeburner.getStamina()")

        //black op > op > contract > basic

        //Get an object with the name and rank requirement of the next BlackOp that can be completed.
        const next_black_op = await evaluate.exec(ns, "ns.bladeburner.getNextBlackOp()")
        //if there are no black ops left
        if (next_black_op != null) {
            //Get player bladeburner rank.
            const rank = await evaluate.exec(ns, "ns.bladeburner.getRank()")
            //if we have enough rank
            if (rank >= next_black_op.rank) {
                //Set team size to max?
                //await evaluate.exec(ns, "ns.bladeburner.setTeamSize('" + type + "','"  + name + "'," + size + "')" )
                //Get estimate success chance of an action.
                const chance = await evaluate.exec(ns, "ns.bladeburner.getActionEstimatedSuccessChance('" + blade_burner_action_type.black_op + "','" + BladeburnerBlackOpName + "')")
                //if enough chance
                if (chance >= 1) {
                    //perform black op
                    return {
                        activity_type: blade_burner_action_type.black_op,
                        name: BladeburnerBlackOpName
                    }
                }
            }
        }
        //operations
        for (const operation in this.operations) {
            //Get action count remaining.
            const action_count_remaining = await evaluate.exec(ns, "ns.bladeburner.getActionCountRemaining('" + blade_burner_action_type.operation + "','" + operation + "')")
            //Get estimate success chance of an action.
            const chance_success = await evaluate.exec(ns, "ns.bladeburner.getActionEstimatedSuccessChance('" + blade_burner_action_type.operation + "','" + operation + "')")
            //if we can do it and we have enough chance
            if (action_count_remaining > 0 && chance_success >= 1) {
                //return this action
                return {
                    activity_type: blade_burner_action_type.operation,
                    name: operation
                }
            }
        }
        //contracts
        for (const contract in this.contracts) {
            //Get action count remaining.
            const action_count_remaining = await evaluate.exec(ns, "ns.bladeburner.getActionCountRemaining('" + blade_burner_action_type.contract + "','" + contract + "')")
            //Get estimate success chance of an action.
            const chance_success = await evaluate.exec(ns, "ns.bladeburner.getActionEstimatedSuccessChance('" + blade_burner_action_type.contract + "','" + contract + "')")
            //if we can do it and we have enough chance
            if (action_count_remaining > 0 && chance_success >= 1) {
                //return this action
                return {
                    activity_type: blade_burner_action_type.contract,
                    name: contract
                }
            }
        }
        //general actions
        //TODO: preference?
        for (const general_action in this.general_actions) {
            //Get estimate success chance of an action.
            await evaluate.exec(ns, "ns.bladeburner.getActionEstimatedSuccessChance('" + type + "','" + general_action + "')")
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
    async determine_actions_sleeves(ns, amount_of_sleeves) {
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
        const next_black_op = await evaluate.exec(ns, "ns.bladeburner.getNextBlackOp()")
        //if there are no black ops left
        if (next_black_op != null) {
            //Get player bladeburner rank.
            const rank = await evaluate.exec(ns, "ns.bladeburner.getRank()")
            //if we have enough rank
            if (rank >= next_black_op.rank) {
                //Set team size.
                //ns.bladeburner.setTeamSize(type, next_black_op.name, size)
                //Get estimate success chance of an action.
                const chance = await evaluate.exec(ns, "ns.bladeburner.getActionEstimatedSuccessChance('" + type + "','" + BladeburnerBlackOpName + "')")
                //if enough chance
                if (chance >= 1) {
                    //perform black op
                    return {}
                } else {

                }
            }
        }
    }

    //change city
    //TODO: when to change city?
    async change_city(ns) {
        var city = ""
        //Get current city.
        await evaluate.exec(ns, "ns.bladeburner.getCity()")

        //Get chaos of a city.
        await evaluate.exec(ns, "ns.bladeburner.getCityChaos('" + city + "')")

        //Get number of communities in a city.
        await evaluate.exec(ns, "ns.bladeburner.getCityCommunities('" + city + "')")

        //Get estimated population in city.
        await evaluate.exec(ns, "ns.bladeburner.getCityEstimatedPopulation('" + city + "')")

        //Travel to another city in Bladeburner.
        await evaluate.exec(ns, "ns.bladeburner.switchCity('" + city + "')")
    }


    //function that manages skills
    //TODO: focus on skills?
    async upgrade_skills(ns) {
        //TODO: focus skills?
        //for each skill
        for (const skill in this.skills) {
            //Get skill level.
            await evaluate.exec(ns, "ns.bladeburner.getSkillLevel('" + skill + "')")




            //Get bladeburner skill points.
            await evaluate.exec(ns, "ns.bladeburner.getSkillPoints()")

            //Get cost to upgrade skill.
            await evaluate.exec(ns, "ns.bladeburner.getSkillUpgradeCost('" + skillName + "',1)")

            //Upgrade skill.
            await evaluate.exec(ns, "ns.bladeburner.upgradeSkill('" + skill + "', 1)")
        }
    }


    //returns current action information
    async get_current_action(ns) {
        //Get current action.
        const current_action = await evaluate.exec(ns, "ns.bladeburner.getCurrentAction()")
        //return
        return current_action
    }


    //check to see if black ops are completed (and thus bitnode can be destroyed)
    async all_black_ops_completed(ns) {
        //Get an object with the name and rank requirement of the next BlackOp that can be completed.
        const next_black_op = await evaluate.exec(ns, "ns.bladeburner.getNextBlackOp()")
        //return if null
        return (next_black_op == null)
    }


    //starts actions for player
    async start_action(type, name) {
        //Start an action.
        await evaluate.exec(ns, "ns.bladeburner.startAction('" + type + "','" + name + "')")
    }


    //starts action for a specific sleeve
    async start_action(sleeve_number, type, name) {

    }
}

/*
// Get whether an action is set to autolevel.
ns.bladeburner.getActionAutolevel(type, name)

//Get the current level of an action.
ns.bladeburner.getActionCurrentLevel(type, name)       
               

//Get the maximum level of an action.
ns.bladeburner.getActionMaxLevel(type, name)
		



	


	

	



BladeburnerActionEnumType				Action types of Bladeburner
BladeburnerActionName
BladeburnerActionType
BladeburnerActionTypeForSleeve
BladeburnerBlackOpName
BladeburnerBlackOpNameEnumType			Black Operation names of Bladeburner
BladeburnerContractName
BladeburnerContractNameEnumType			Contract names of Bladeburner
BladeburnerGeneralActionName
BladeburnerGeneralActionNameEnumType	General action names of Bladeburner
BladeburnerOperationName
BladeburnerOperationNameEnumType		Operation names of Bladeburner
BladeburnerSkillName
BladeburnerSkillNameEnumType			Skill names type of Bladeburner




*/