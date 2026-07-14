//This API requires Source-File 4 to use outside of BitNode 4. Additionally, outside of BitNode 4 the RAM cost of all these functions is multiplied by 16/4/1 based on Source-File 4 levels.

/*
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.singularity.md
Singularity		Singularity API
16/4/1 * 32 = 512/128/32 GB
*/

import * as evaluate from 'scripts/sub/eval.js'
import * as log from 'scripts/sub/log.js'

const script_main = "scripts/main.js"

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


//config
//min chance for a crime
const crime_min_chance = 0.65 //65% chance
//ratio of SF12 to other SF (0.5 = 2 other SF for 1 SF12)
const sf_12_mult = 0.5


//function to backdoor a server, to be called by root.js
export async function backdoor_server(ns, neighbour, server) {
    //connect to neighbour server
    await await evaluate.exec(ns, "ns.singularity.connect('" + neighbour + "')")
    //connect to the server
    await await evaluate.exec(ns, "ns.singularity.connect('" + server + "')")
    //Run the backdoor command in the terminal.
    await await evaluate.exec(ns, "ns.singularity.installBackdoor()")
    //go back home
    await await evaluate.exec(ns, "ns.singularity.connect('home')")
}


//function for debugging, intended to only run once
export async function print_faction_requirements(ns) {
    //for each faction possible
    for (const faction of FactionNameEnumType) { //or FactionName?
        //List conditions for being invited to a faction.
        const requirements = await evaluate.exec(ns, "ns.singularity.getFactionInviteRequirements('" + faction +
            "')")
        //print information
        log.info(ns, "Singularity", "faction '" + faction + "' requires: '" + JSON.stringify(requirements) + "'", true)
    }
}


//function for automating the player actions
export async function work(ns) {
    //get player
    const player = ns.getPlayer()
    //manage factions
    var focus = await manage_factions(ns, player)
    //determine work: faction > company > crime
    if (!await work_for_faction(ns, player)) {
        //work for company
        if (!await work_for_company(ns, player)) {
            //perform crime or bladeburner (future)?
            await perform_crime(ns, player, focus)
        }
    }
}


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
        [5,
            1
        ], //This Source-File grants you a new stat called Intelligence. Intelligence is unique because it is permanent and persistent (it never gets reset back to 1). However, gaining Intelligence experience is much slower than other stats. Higher Intelligence levels will boost your production for many actions in the game.
        //In addition, this Source-File will unlock: getBitNodeMultipliers(), Permanent access to formulas, Access to BitNode multiplier information on the Stats page
        //It will also raise all of your hacking-related multipliers by: 8%
        [10, 1], //Unlocks Sleeve and Grafting API in other BitNodes. 
        [9, 1], //Permanently unlocks the Hacknet Server in other BitNodes
        //increases hacknet production and reduces hacknet costs by: 12%
        [9, 2], //You start with 128GB of RAM on your home computer when entering a new BitNode
        //increases hacknet production and reduces hacknet costs by: 18%


        //unlocks
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
        [15,
            1
        ], //Permanently start with the TOR router and darkscape, and unlock the full dark web on all BitNodes.
        [15,
            2
        ], //Your charisma level increases job salary and rep gain. Also increases authentication speed by 20%
        [15,
            3
        ], //Your charisma level increases faction work rep gain. Also increases the xp and money gained from .cache files by 50%.

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

    //14: does go winning 2 times in a row changes converts rep to favor, eliminating the need for resets (installations of augments?)
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
    */
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
        */
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
    */
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
    */


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


/** @param {NS} ns */
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