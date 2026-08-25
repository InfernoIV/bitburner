//config
import { DISABLE_LOGGING, FONT, COLOR, BORDER} from "./config.js"


//constants
import { DEADALUS, WORLD_DEAMON_HACKING } from "./constants.js"
import { HANDLE } from "scripts/constants/handle.js"
import { PORT } from "scripts/constants/port.js"
import { AUGMENT } from "scripts/constants/augments.js"
import { GANG_MEMBERS_MAX } from "scripts/gang/constants.js"


//functions
import * as log from "scripts/util/log.js"
import * as format from "scripts/util/format.js"
import { get_number_of_hacking_tools_owned } from "scripts/root/root.js"
import { get_sleeve_activity } from "scripts/sleeve/sleeve.js"
import { get_number_of_gang_members } from "scripts/gang/gang.js"
import { get_bitnode_level, determine_next_bitnode } from "scripts/singularity/singularity.js"


const wnd = eval("window")
const doc = wnd["document"]


// Declaration
export class ui_obj {
    constructor() {
        //map to save functions into to use
        this.functions = new Map()
        //list of added rows (id's)
        this.rows = []
        //starting index to add data
        this.index = 9
    }


    //TODO: how to handle added handles (e.g. home grows in ram and another functionality is launched) -> how to trigger / add?
    init(ns, handles) {
        //disable logging
        log.disable(ns, DISABLE_LOGGING)
        //align text left
        doc.getElementById("overview-money-hook").style.textAlign = "left"
        doc.getElementById("overview-hack-hook").style.textAlign = "left"
        doc.getElementById("overview-str-hook").style.textAlign = "left"
        doc.getElementById("overview-def-hook").style.textAlign = "left"
        doc.getElementById("overview-dex-hook").style.textAlign = "left"
        doc.getElementById("overview-agi-hook").style.textAlign = "left"
        //clear the page
        ns.atExit(() => {
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
        this.add_to_existing(ns, handles.hasOwnProperty(HANDLE.INTELLIGENCE))

        //add extended stats
        this.add_stats(ns)

        //if we have sleeves: add sleeve information
        if (handles.hasOwnProperty(HANDLE.SLEEVE)) this.add_sleeves(ns)

        //add bitnode information
        this.add_bitnode(ns, handles.hasOwnProperty(HANDLE.SINGULARITY), handles.hasOwnProperty(HANDLE.INTELLIGENCE))

        //if we have bladeburner
        if (handles.hasOwnProperty(HANDLE.BLADEBURNER)) this.add_bladeburner(ns)

        //add hacking information
        this.add_hacking(ns)

        //if we have gang
        if (handles.hasOwnProperty(HANDLE.GANG)) this.add_gang(ns)

        //if we have corporation
        if (handles.hasOwnProperty(HANDLE.CORPORATION)) this.add_corporation(ns)

        //add go statistics
        //this.add_go(ns)

        //add location
        this.add_location(ns)

        //log ready
        log.info(ns, "UI", "Init complete", true)
    }


    //add information to existing rows
    add_to_existing(ns, has_intelligence) {
        //deadalus requirements
        let world_deamon_hacking = WORLD_DEAMON_HACKING
        //if can get more information
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
        doc.getElementById("overview-money-hook").innerText = "/$" + format.number(DEADALUS.MONEY)
        //hacking
        doc.getElementById("overview-hack-hook").innerText = "/" + world_deamon_hacking
        //combat
        doc.getElementById("overview-str-hook").innerText = "/" + DEADALUS.COMBAT
        doc.getElementById("overview-def-hook").innerText = "/" + DEADALUS.COMBAT
        doc.getElementById("overview-dex-hook").innerText = "/" + DEADALUS.COMBAT
        doc.getElementById("overview-agi-hook").innerText = "/" + DEADALUS.COMBAT
    }


    add_location(ns) {
        //GROUP: location
        this.add_data(ns, COLOR.LOCATION, "City",
            "ns.getPlayer().city", true
        )

        this.add_data(ns, COLOR.LOCATION, "Location",
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
            format.number(gang_karma), false,
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
        this.add_data(ns, COLOR.HACK, "Hack_tools",
            "get_number_of_hacking_tools_owned(ns)", true,
            "5", false,
            "/"
        )
        this.add_data(ns, COLOR.HACK, "Hack_target",
            "ns.peek(PORT.HACK_TARGET).target", true,
            "ns.peek(PORT.HACK_TARGET).activity", true,
            ":"
        )
        //add a border
        this.add_border("Hack_target")
    }


    //bitnode 2
    add_gang(ns) {
        //gang members
        this.add_data(ns, COLOR.GANG, "Gang_Members",
            "get_number_of_gang_members(ns)", true,
            GANG_MEMBERS_MAX, false,
            "/"
        )
        //gang territory
        this.add_data(ns, COLOR.GANG, "Gang_Territory",
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
        if (!ns.corporation.hasCorporation()) {
            stop
            //return
        }
        /*
        //funds - public
        this.add_data(ns, COLOR.CORPORATION, "Corp_funds",
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
            this.add_data(ns, COLOR.CORPORATION, "Corp_div_" + divisionName,
                "ns.corporation.getDivision(divisionName).industry", true,

        )
        }
        
        
        //shares
        this.add_data(ns, COLOR.CORPORATION, "Corp_Shares",
            "ns.corporation.getCorporation().totalShares-ns.corporation.getCorporation().investorShares-ns.corporation.getCorporation().issuedShares", true,
            "ns.corporation.getCorporation().totalShares-ns.corporation.getCorporation().investorShares", true,
            "/"
        )

        //valuation - public
        this.add_data(ns, COLOR.CORPORATION, "Corp_valuation",
            "ns.corporation.getCorporation().valuation", true,
            "", true,
            ""
        )

        //investments
        this.add_data(ns, COLOR.CORPORATION, "Corp_Investment",
            "ns.corporation.getInvestmentOffer().round", true,
            "formatNumber(ns.corporation.getInvestmentOffer().funds)", true,
            "="
        )
    
        //add a border
        this.add_border("Corp_Investment")
        */
    }


    //bitnode 4
    add_bitnode(ns, has_singularity, has_intelligence) {
        //add bitnode information
        this.add_data(ns, COLOR.BITNODE, "Bitnode",
            "ns.getResetInfo().currentNode", true,
            "get_bitnode_level(ns)", true,
            "."
        )
        this.add_data(ns, COLOR.BITNODE, "Next BN",
            "determine_next_bitnode(ns)[0]", true,
            "determine_next_bitnode(ns)[1]", true,
            "."
        )
        //if we have singularity
        if (has_singularity) {
            //add if we have the red pill
            this.add_data(ns, COLOR.BITNODE, "Red_Pill",
                "ns.singularity.getOwnedAugmentations(false).includes(AUGMENT.TRP)", true
            )
        }
        //letiable to change
        let deadalus_augments = "/??"
        //if we have intelligence unlocked
        if (has_intelligence) {
            //get the augment requirements
            deadalus_augments = "/" + ns.getBitNodeMultipliers().DaedalusAugsRequirement
        }
        //add augment requirement
        this.add_data(ns, COLOR.BITNODE, "Augments",
            "ns.getResetInfo().ownedAugs.size", true,
            deadalus_augments)
        //add a border
        this.add_border("Augments")
    }


    //bitnode 6 / 7
    add_bladeburner(ns) {
        //add bladeburner stamina
        this.add_data(ns, COLOR.BLADEBURNER, "Stamina",
            "ns.bladeburner.getStamina()[0]", true,
            "ns.bladeburner.getStamina()[1]", true,
            "/"
        )

        //add black ops overview
        this.add_data(ns, COLOR.BLADEBURNER, "Black_Ops",
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
            this.add_data(ns, COLOR.SLEEVE,
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
        let last_id = ""
        //for each opponent, skip the NO AI
        for (const i = 1; i < opponents.length; i++) {
            //get the opponent
            const opponent = opponents.keys()[i]
            //add the opponent data
            this.add_data(ns, COLOR.GO,
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
        //get the table
        const table = doc.getElementsByTagName("tbody")[0]

        let row = table.insertRow(this.index)
        this.index += 1
        row.style.color = color
        row.style.font = FONT
        row.id = name.toLowerCase()

        let cell0 = row.insertCell(0)
        cell0.id = "custom-hook-" + name.toLowerCase() + "-0"
        cell0.innerText = name


        let cell1 = row.insertCell(1)
        cell1.id = "custom-hook-" + name.toLowerCase() + "-1"
        cell1.style.textAlign = "right"

        let cell2 = row.insertCell(2)
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

        //get the table
        const table = doc.getElementsByTagName("tbody")[0]
        let row = table.insertRow(this.index)
        this.index += 1
        row.style.color = color
        row.style.font = FONT
        row.id = name.toLowerCase()
        let cell0 = row.insertCell(0)
        cell0.innerText = name

        let cell1 = row.insertCell(1)
        cell1.innerText = value_1

        let cell2 = row.insertCell(2)
        cell2.innerText = value_2

        //add id to list of nodes
        this.rows.push(name)
    }


    //adds a border to a row
    add_border(name) {
        //get the element
        const element = doc.getElementById(name.toLowerCase())
        //set border
        element.style.borderBottom = BORDER
    }


    //manage function which is called every main cycle
    manage(ns, handles) {
        //for every saved entry
        for (const key of this.functions.keys()) {
            //get data
            const [function_1, eval_1, function_2, eval_2, divider] = this.functions.get(key)
            //update 
            update(ns, key, function_1, eval_1, function_2, eval_2, divider)
        }
    }
}





//function to be executed
function update(ns, name, function_1, eval_1, function_2, eval_2, divider) {
    //create value 1
    let value_1 = function_1
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
    let value_2 = function_2
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
