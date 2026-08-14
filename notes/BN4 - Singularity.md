# BitNode 4
## Introduction
This BitNode unlocks Singularity APIs in the singularity namespace (ns.singularity). Do you hate doing things manually (e.g., buying TOR, buying programs, connecting servers, installing backdoor)? These APIs let you do all of them programmatically.

If you use these APIs outside BitNode 4 and do not have Source-File 4.2 or Source-File 4.3, the RAM cost is multiplied by 4 or 16, respectively. This means that if you want to use this Source-File in other BitNodes, you have to complete this BitNode three times in one go. Otherwise, you will have to pay the massive RAM cost.

This BitNode's multipliers are a bit harsh, especially if you only have Source-File 1. Keep this in mind if you choose it as the second BitNode after completing BitNode 1.


## Bitnode multipliers
ServerMaxMoney: 0.1125,
ServerStartingMoney: 0.75,

CloudServerSoftcap: 1.2,

CompanyWorkMoney: 0.1,
CrimeMoney: 0.2,
HacknetNodeMoney: 0.05,
ScriptHackMoney: 0.2,

ClassGymExpGain: 0.5,
CompanyWorkExpGain: 0.5,
CrimeExpGain: 0.5,
FactionWorkExpGain: 0.5,
HackExpGain: 0.4,

FactionWorkRepGain: 0.75,

GangUniqueAugs: 0.5,

StaneksGiftPowerMultiplier: 1.5,
StaneksGiftExtraSize: 0,

DarknetMoneyMultiplier: 0.4,

WorldDaemonDifficulty: 3,


## Enums
BaseTask					Base interface of all tasks.
CompanyWorkTask				Company Work
CreateProgramWorkTask		Create Program
CrimeTask					Crime
FactionWorkTask				Faction Work
GraftingTask				Grafting Work
PlayerBaseTask				Base interface of all player tasks.
StudyTask					Study



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
*/



/*


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