import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"
import {
    get_number_of_hacking_tools_owned
} from "scripts/sub/root.js"
import {
    GANG_MEMBERS_MAX,
    GANG_MEMBER_NAME,
} from "scripts/data/gang.js"



// Declaration
export class ui_obj {
    constructor() {
        //map to save functions into to use
        this.functions = new Map()
        //list of added rows (id's)
        this.rows = []
        //starting index to add data
        this.index = 9
        //font to be used
        this.font = "16px JetBrainsMono"
        //border format
        this.border = "solid #cfcfcf"
    }


    //TODO: how to handle added handles (e.g. home grows in ram and another functionality is launched) -> how to trigger / add?
    init(ns, handles) {
        const doc = eval("document")
        //align text left
        doc.getElementById("overview-money-hook").style.textAlign = "left"
        doc.getElementById("overview-hack-hook").style.textAlign = "left"
        doc.getElementById("overview-str-hook").style.textAlign = "left"
        doc.getElementById("overview-def-hook").style.textAlign = "left"
        doc.getElementById("overview-dex-hook").style.textAlign = "left"
        doc.getElementById("overview-agi-hook").style.textAlign = "left"

        //log.info(ns, "UI", "Font: " + doc.getElementById("overview-agi-hook").style,true)
        //clear the page
        ns.atExit(() => {
            //get document
            const doc = eval("document")
            //reset static information
            doc.getElementById("overview-money-hook").innerText = ""
            doc.getElementById("overview-hack-hook").innerText = ""
            doc.getElementById("overview-str-hook").innerText = ""
            doc.getElementById("overview-def-hook").innerText = ""
            doc.getElementById("overview-dex-hook").innerText = ""
            doc.getElementById("overview-agi-hook").innerText = ""
            //remove custom rows
            for (const key of this.functions.keys()) {
                //get the custom element
                const element = document.getElementById(key.toLowerCase())
                //remove the element
                element.remove()
            }
        })

        //add information to existing rows
        this.add_to_existing(ns, handles.hasOwnProperty(CONSTANTS.HANDLE.INTELLIGENCE))

        //add extended stats
        this.add_stats(ns)

        //if we have sleeves: add sleeve information
        if (handles.hasOwnProperty(CONSTANTS.HANDLE.SLEEVE)) this.add_sleeves(ns)

        //add bitnode information
        this.add_bitnode(ns, handles.hasOwnProperty(CONSTANTS.HANDLE.SINGULARITY))

        //if we have bladeburner
        if (handles.hasOwnProperty(CONSTANTS.HANDLE.BLADEBURNER)) this.add_bladeburner(ns)

        //add augments requirement
        this.add_augments(ns, handles.hasOwnProperty(CONSTANTS.HANDLE.INTELLIGENCE))

        //add hacking information
        this.add_hacking(ns)

        //if we have gang
        if (handles.hasOwnProperty(CONSTANTS.HANDLE.GANG)) this.add_gang(ns)

        //if we have corporation
        if (handles.hasOwnProperty(CONSTANTS.HANDLE.CORPORATION)) this.add_corporation(ns)

        //add go statistics
        this.add_go(ns)

        //add location
        this.add_location(ns)

        //log ready
        log.info(ns, "UI", "Init complete", true)
    }


    //add information to existing rows
    add_to_existing(ns, has_intelligence) {
        const doc = eval("document")
        //set a custom element id to the table for easy lookup
        //deadalus requirements
        const deadalus_money = 100e9
        const deadalus_combat = 1500
        var world_deamon_hacking = 3000
        if (has_intelligence) {
            //get the bitnode multipliers
            const bit_node_multipliers = ns.getBitNodeMultipliers()
            //get the world deamon multiplier
            world_deamon_hacking *= bit_node_multipliers.WorldDaemonDifficulty
        } else {
            //we're not sure...
            world_deamon_hacking += "?"
        }
        //money
        doc.getElementById("overview-money-hook").innerText = "/$" + formatNumber(deadalus_money)
        //hacking
        doc.getElementById("overview-hack-hook").innerText = "/" + world_deamon_hacking
        //combat
        doc.getElementById("overview-str-hook").innerText = "/" + deadalus_combat
        doc.getElementById("overview-def-hook").innerText = "/" + deadalus_combat
        doc.getElementById("overview-dex-hook").innerText = "/" + deadalus_combat
        doc.getElementById("overview-agi-hook").innerText = "/" + deadalus_combat
    }


    add_location(ns) {
        //GROUP: location
        this.add_data(ns, "#777777", "City",
            "ns.getPlayer().city", true
        )

        this.add_data(ns, "#777777", "Location",
            "ns.getPlayer().location", true,
        )
        //add a border
        this.add_border("Location")
    }


    //adds information not gated by source files
    add_stats(ns) {
        //karma needed to start a gang
        const gang_karma = -54000
        /*
        this.add_data(ns, "#009ffc", "Intelligence", 
            "ns.getPlayer().skills.intelligence", true)
        */

        this.add_data(ns, "#ff0000", "Karma",
            "formatNumber(ns.getPlayer().karma)", true,
            formatNumber(gang_karma), false,
            "/"
        )

        this.add_data(ns, "#ff0000", "Kills",
            "formatNumber(ns.getPlayer().numPeopleKilled)", true,
            "30", false,
            "/"
        )

        this.add_data(ns, "#777777", "Entropy",
            "ns.getPlayer().entropy", true,
        )
        //add a border
        this.add_border("Entropy")
    }

    add_hacking(ns) {
        //GROUP: hack
        this.add_data(ns, "#007c15", "Hack_tools",
            "get_number_of_hacking_tools_owned(ns)", true,
            "5", false,
            "/"
        )
        this.add_data(ns, "#007c15", "Hack_target",
            "ns.peek(CONSTANTS.PORT.HACK_TARGET).target", true,
            "ns.peek(CONSTANTS.PORT.HACK_TARGET).activity", true
        )
        //add a border
        this.add_border("Hack_target")
    }


    //adds information on augments 
    add_augments(ns, has_intelligence) {
        //variable to change
        var deadalus_augments = "/??"
        //if we have intelligence unlocked
        if (has_intelligence) {
            //get the augment requirements
            deadalus_augments = "/" + ns.getBitNodeMultipliers().DaedalusAugsRequirement
        }
        //add augment requirement
        this.add_data(ns, "#777777", "Augments",
            "ns.getResetInfo().ownedAugs.size", true,
            deadalus_augments)
        //add a border
        this.add_border("Augments")
    }


    //bitnode 2
    add_gang(ns) {
        //gang members
        this.add_data(ns, "#ff0000", "Gang_Members",
            "get_number_of_gang_members(ns)", true,
            GANG_MEMBERS_MAX, false,
            "/"
        )
        //gang territory
        this.add_data(ns, "#ff0000", "Gang_Territory",
            "ns.gang.getGangInformation().territory*100", true,
            "%"
        )
        //add a border
        this.add_border("Gang_Territory")
    }


    //bitnode 3
    add_corporation(ns) {
        //TODO
        //if we don't have a corporation
        if(!ns.corporation.hasCorporation()){ 
            stop
            //return
        }       
        /*
        //funds - public
        this.add_data(ns, "#ff9900", "Corp_funds",
            "ns.corporation.getCorporation().funds", true,
            "ns.corporation.getCorporation().public", true,
            "=>"
        )

        //division information
        const divisions = ns.corporation.getCorporation().divisions
        //for each division
        for (const division of divisions) {
            //get the division
            ns.corporation.getDivision(divisionName)
            //division
            this.add_data(ns, "#ff9900", "Corp_div_" + divisionName,
                "ns.corporation.getDivision(divisionName).industry", true,

        )
        }
        
        
        //shares
        this.add_data(ns, "#ff9900", "Corp_Shares",
            "ns.corporation.getCorporation().totalShares-ns.corporation.getCorporation().investorShares-ns.corporation.getCorporation().issuedShares", true,
            "ns.corporation.getCorporation().totalShares-ns.corporation.getCorporation().investorShares", true,
            "/"
        )

        //valuation - public
        this.add_data(ns, "#ff9900", "Corp_valuation",
            "ns.corporation.getCorporation().valuation", true,
            "", true,
            ""
        )

        //investments
        this.add_data(ns, "#ff9900", "Corp_Investment",
            "ns.corporation.getInvestmentOffer().round", true,
            "formatNumber(ns.corporation.getInvestmentOffer().funds)", true,
            "="
        )
    
        //add a border
        this.add_border("Corp_Investment")
        */
    }


    //bitnode 4
    add_bitnode(ns, has_singularity) {
        //add bitnode information
        this.add_data_static(ns, "#ff00aa", "Bitnode",
            ns.getResetInfo().currentNode,
            "." + get_bitnode_level(ns)
        )
        //if we have singularity
        if (has_singularity) {
            //add if we have the red pill
            this.add_data(ns, "#ff00aa", "Red_Pill",
                "ns.singularity.getOwnedAugmentations(false).includes(CONSTANTS.AUGMENT.TRP)", true
            )
            //add a border
            this.add_border("Red_Pill")
        } else {
            //add a border
            this.add_border("Bitnode")
        }
    }


    //bitnode 6 / 7
    add_bladeburner(ns) {
        //add bladeburner stamina
        this.add_data(ns, "#ff0000", "Stamina",
            "ns.bladeburner.getStamina()[0]", true,
            "ns.bladeburner.getStamina()[1]", true,
            "/"
        )

        //add black ops overview
        this.add_data(ns, "#ff0000", "Black_Ops",
            "ns.bladeburner.getBlackOpNames().indexOf(ns.bladeburner.getNextBlackOp().name)", true,
            ns.bladeburner.getBlackOpNames().length, false,
            "/"
        )
        //add a border
        this.add_border("Black_Ops")
    }


    //bitnode 10
    add_sleeves(ns) {
        //get number of sleeves owned
        const sleeves_owned = ns.sleeve.getNumSleeves()
        //for each sleeve
        for (let i = 0; i < sleeves_owned; i++) {
            //add sleeve (activity & shock)
            this.add_data(ns, "#fffb00",
                "Sleeve_" + i,
                "get_sleeve_activity(" + i + ")", true,
                "ns.sleeve.getSleeve(" + i + ").shock", true)
        }
        //add a border
        this.add_border("Sleeve_" + (sleeves_owned - 1))
    }

    //bitnode ?
    add_go(ns) {
        //get thet opponents
        const opponents = ns.go.analysis.getStats().keys()
        //save the last id
        var last_id = ""
        //for each opponent, skip the NO AI
        for (const i = 1; i < opponents.length; i++) {
            //get the opponent
            const opponent = opponents.keys()[i]
            //add the opponent data
            this.add_data(ns, "#00fff2",
                //name in which the " " is replaced by "_"
                "Go_" + opponent.replace(/ /g, "_"),
                "ns.go.analysis.getStats().get(opponent).wins", true,
                "ns.go.analysis.getStats().get(opponent).losses", true,
                "-"
            )
            //save the last index
            last_id = "Go_" + opponent.replace(/ /g, "_")
        }
        //add a border
        this.add_border(last_id)
    }


    //adds a data entry
    add_data(ns, color, name, function_1, eval_1, function_2 = "", eval_2 = false, divider = "") {
        //add the row
        this.add_row(ns, color, name)
        //add to list
        this.functions.set(name, [function_1, eval_1, function_2, eval_2, divider])
    }


    //creates a row to fill data into
    add_row(ns, color, name) {
        const doc = eval("document")
        //get the table
        const table = doc.getElementsByTagName("tbody")[0]

        var row = table.insertRow(this.index)
        this.index += 1
        row.style.color = color
        row.style.font = this.font
        row.id = name.toLowerCase()

        var cell0 = row.insertCell(0)
        cell0.id = "custom-hook-" + name.toLowerCase() + "-0"
        cell0.innerText = name


        var cell1 = row.insertCell(1)
        cell1.id = "custom-hook-" + name.toLowerCase() + "-1"
        cell1.style.textAlign = "right"

        var cell2 = row.insertCell(2)
        cell2.id = "custom-hook-" + name.toLowerCase() + "-2"

        //add id to list of nodes
        this.rows.push(name)
    }


    //adds static data (only checked once)
    add_data_static(color, name, function_1, function_2 = "") {
        //add the row
        this.add_row_static(color, name, function_1, function_2)
    }


    //adds a static row
    add_row_static(color, name, value_1, value_2) {
        const doc = eval("document")
        //get the table
        const table = doc.getElementsByTagName("tbody")[0]
        var row = table.insertRow(this.index)
        this.index += 1
        row.style.color = color
        row.style.font = this.font
        row.id = name.toLowerCase()
        var cell0 = row.insertCell(0)
        cell0.innerText = name

        var cell1 = row.insertCell(1)
        cell1.innerText = value_1

        var cell2 = row.insertCell(2)
        cell2.innerText = value_2

        //add id to list of nodes
        this.rows.push(name)
    }


    //adds a border to a row
    add_border(name) {
        const doc = eval("document")
        //get the element
        const element = doc.getElementById(name.toLowerCase())
        //set border
        //https://www.w3schools.com/jsref/dom_obj_style.asp
        element.style.borderBottom = this.border
    }


    //manage function which is called every main cycle
    manage(ns, handles) {
        //log.info(ns, "UI", "Manage: " + JSON.stringify(this.functions.entries()), true)
        //for every saved
        for (const key of this.functions.keys()) {
            //get data
            const [function_1, eval_1, function_2, eval_2, divider] = this.functions.get(key)
            //update 
            update(ns, key, function_1, eval_1, function_2, eval_2, divider)
        }
    }
}


//function that returns the activity of the sleeve
function get_sleeve_activity(sleeve_number) {
    //get sleeve
    const sleeve = ns.sleeve.getSleeve(i)
    //get sleeve task
    const task = ns.sleeve.getTask(i)
    //variable to fill
    var data

    switch (task.type) {
        case "BLADEBURNER": //SleeveBladeburnerTask
            data = "Bladeburner " + task.actionType + ": " + task.actionName
            break
        case "CLASS": //SleeveClassTask
            data = "Training : " + task.classType
            break
        case "COMPANY": //SleeveCompanyTask
            data = "Faction: " + task.companyName
            break
        case "CRIME": //SleeveCrimeTask
            data = "Crime: " + task.crimeType
            break
        case "FACTION": //SleeveFactionTask:
            //get additional data
            data = "Faction: " + task.factionName + " (" + task.factionWorkType + ")"
            break
        case "INFILTRATE": //SleeveInfiltrateTask
            data = "Infiltrate"
            break
            //generic
        case "RECOVERY": //SleeveRecoveryTask
            data = "Recovery: " + sleeve.shock
            break
        case "SUPPORT": //SleeveSupportTask
            data = "Support"
            break
        case "SYNCHRO": //SleeveSynchroTask
            data = "Synchronization: " + sleeve.sync
            break
        default:
            //do nothing
            data = ""
    }
    //return the data
    return data
}


//function to be executed
function update(ns, name, function_1, eval_1, function_2, eval_2, divider) {
    //debug
    //ns.log(ns, "UI", "name: " + name + ", function_1: " + function_1, true )
    const doc = eval("document")
    //create value 1
    var value_1 = function_1
    //if we need to eval
    if (eval_1) {
        //eval the value
        value_1 = eval(value_1)
    }

    //save the value
    const index_1 = doc.getElementById("custom-hook-" + name.toLowerCase() + "-1")
    if (index_1 != undefined) {
        index_1.innerHTML = value_1
    }

    //create value 2
    var value_2 = function_2
    //if we need to eval
    if (eval_2) {
        //eval the value
        value_2 = eval(value_2)
    }

    //save the value
    const index_2 = doc.getElementById("custom-hook-" + name.toLowerCase() + "-2")
    if (index_2 != undefined) {
        index_2.innerHTML = divider + value_2
    }

}


//function that formats a number to 2 fractions
function formatNumber(number) {
    // Use the toLocaleString method to add suffixes to the number
    return number.toLocaleString('en-US', {
        // add suffixes for thousands, millions, and billions
        // the maximum number of decimal places to use
        maximumFractionDigits: 2,
        // specify the abbreviations to use for the suffixes
        notation: 'compact',
        compactDisplay: 'short'
    })
}


//function that gets current bitnode level
function get_bitnode_level(ns) {
    //fixed information
    const reset_info = ns.getResetInfo()
    //default to level to 1
    var level = 1
    //if we already have a source file
    if (reset_info.ownedSF.has(reset_info.currentNode)) {
        //add this to the level
        level += reset_info.ownedSF.get(reset_info.currentNode)
        //if we go above the limit
        if (level > 3 && reset_info.currentNode != 12) {
            //set to limit
            level = 3
        }
    }
    //give the level
    return level
}

function get_number_of_gang_members(ns) {
    //variable to fill
    var gang_members_amount = 0
    //for each possible member
    for (let i = 0; i < GANG_MEMBERS_MAX; i++) {
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
<TableRow>
<TableCell component="th" scope="row" classes={{ root: classes.cell }}>
    <Typography id="overview-extra-hook-0" color={theme.colors.hack}>
    {}
    </Typography>
</TableCell>
<TableCell component="th" scope="row" align="right" classes={{ root: classes.cell }}>
    <Typography id="overview-extra-hook-1" color={theme.colors.hack}>
    {}
    </Typography>
</TableCell>
<TableCell component="th" scope="row" align="right" classes={{ root: classes.cell }}>
    <Typography id="overview-extra-hook-2" color={theme.colors.hack}>
    {}
    </Typography>
</TableCell>
</TableRow>
*/