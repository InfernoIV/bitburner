import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"
import {
    get_number_of_hacking_tools_owned
} from "scripts/sub/root.js"


// Declaration
export class ui_obj {
    constructor() {
        this.functions = new Map()
        //list of added rows (id's)
        this.rows = []
        //list of hooks
        this.hooks = []
        //time to refresh
        //this.refresh_time = 1000 //1 sec   
        this.index = 9
    }


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
        //add general information
        this.add_general(ns)
        //add augments requirement
        this.add_augments(ns, handles.hasOwnProperty(CONSTANTS.HANDLE.INTELLIGENCE))
        //if we have singularity: add singularity information
        if (handles.hasOwnProperty(CONSTANTS.HANDLE.SINGULARITY)) this.add_singularity(ns)
        //if we have sleeves: add sleeve information
        if (handles.hasOwnProperty(CONSTANTS.HANDLE.SLEEVE)) this.add_sleeves(ns)

        log.info(ns, "UI", "Map: " + JSON.stringify(Array.from(this.functions.entries())), true)
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


    //adds information not gated by source files
    add_general(ns) {
        //karma needed to start a gang
        const gang_karma = -54000
        this.add_data(ns, "#009ffc", "Intelligence", "ns.getPlayer().skills.intelligence", true)
        this.add_data(ns, "#ff0000", "Karma", "formatNumber(ns.getPlayer().karma)", true, "/" + formatNumber(
            gang_karma))
        this.add_data(ns, "#ff0000", "Kills", "formatNumber(ns.getPlayer().numPeopleKilled)", true, "/30")
        this.add_data(ns, "#777777", "Entropy", "ns.getPlayer().entropy", true)
        this.add_data(ns, "#777777", "City", "ns.getPlayer().city", true)
        this.add_data(ns, "#777777", "Location", "ns.getPlayer().location", true)
        this.add_data(ns, "#007c15", "Hack_tools", "get_number_of_hacking_tools_owned(ns)", true, "/5")
        //this.add_data_static(ns, "#007c15", "Bitnode", ns.getResetInfo().currentNode, "." + get_bitnode_level(ns))
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
        this.add_data(ns, "#777777", "Augments", "ns.getResetInfo().ownedAugs.size", true, deadalus_augments)
    }


    //add information from singularity
    add_singularity(ns) {
        //add if we have the red pill
        this.add_data(ns, "#ff00aa", "Red_Pill",
            "ns.singularity.getOwnedAugmentations(false).includes(CONSTANTS.AUGMENT.TRP)", true)
    }

    //adds information from sleeves
    add_sleeves(ns) {
        //get number of sleeves owned
        const sleeves_owned = ns.sleeve.getNumSleeves()
        //for each sleeve
        for (let i = 0; i < sleeves_owned; i++) {
            //add sleeve (activity & shock)
            this.add_data(ns, "#fffb00", "Sleeve_" + i, "get_sleeve_activity(" + i + ")", true,
                "ns.sleeve.getSleeve(" +
                i + ").shock", true)
        }
    }


    //adds a data entry
    add_data(ns, color, name, function_1, eval_1, function_2 = "", eval_2 = false) {
        //add the row
        this.add_row(ns, color, name)
        //add to list
        this.functions.set(name, [function_1, eval_1, function_2, eval_2])
    }


    //creates a row to fill data into
    add_row(ns, color, name) {
        const doc = eval("document")
        //get the table
        const table = doc.getElementsByTagName("tbody")[0]
           
        var row = table.insertRow(this.index)
        this.index += 1
        row.style.color = color
        row.style.font = "16px JetBrainsMono" //'JetBrainsMono, "Courier New", monospace'
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
        row.id = name

        var cell0 = row.insertCell(0)
        cell0.innerText = name

        var cell1 = row.insertCell(1)
        cell1.innerText = value_1

        var cell2 = row.insertCell(2)
        cell2.innerText = value_2

        //add id to list of nodes
        this.rows.push(name)
    }





    //manage function which is called every main cycle
    manage(ns, handles) {
        //log.info(ns, "UI", "Manage: " + JSON.stringify(this.functions.entries()), true)
        //for every saved
        for (const key of this.functions.keys()) {
            //get data
            const [function_1, eval_1, function_2, eval_2] = this.functions.get(key)
            //update 
            update(ns, key, function_1, eval_1, function_2, eval_2)
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
function update(ns, name, function_1, eval_1, function_2, eval_2) {
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
        index_2.innerHTML = value_2
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