import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"

const { React } = globalThis
const h = React.createElement

const C = {
    teal: "#4dd9c0",
    tealDark: "#0d2e29",
    bg: "#0a1f1c",
    bgMid: "#0f2925",
    border: "#1e5c50",
    text: "#cff5ee",
    textDim: "#4a8c80",

}

// Declaration
export class ui_obj {
    constructor() {
        this.available = true
    }


    init(ns) {       
        //clear the page
        ns.atExit(() => {
            const doc = eval("document")
            doc.getElementById("overview-extra-hook-0").innerText = ""
            doc.getElementById("overview-extra-hook-1").innerText = ""
            //doc.getElementById("overview-extra-hook-2")

            
        })
        /*const doc = eval("document")
        const node = doc.getElementById("overview-extra-hook-2").parentNode.parentNode
        const clone = node.cloneNode(true)
        clone.id = "123"

        //const table = doc.getElementsByTagName("table")[0]

        //log.info(ns, "UI", "table: " + table.firstElementChild.childElementCount, true)
        // Find a <table> element with id="myTable":
        var table = doc.getElementsByTagName("table")[0]//doc.getElementById("myTable");

        // Create an empty <tr> element and add it to the 1st position of the table:
        var row = table.insertRow(clone)

        // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
        var cell1 = row.insertCell(0)
        var cell2 = row.insertCell(1)

        // Add some text to the new cells:
        cell1.innerHTML = "NEW CELL1"
        cell2.innerHTML = "NEW CELL2";*/
        
        this.entries = new Map()
        this.add_general_information(ns)

        log.info(ns, "UI", "Init complete", true)
    }


    /*
    ui.renderPage	0
    */
    manage(ns, handles) {
        //create string to add
        let identifiers = Array.from(this.entries.keys()).join('<br>') //\r\n
        let functions = ""
        //for each entry
        for (const func of this.entries.values()) {
            //if ids is already set
            if (functions != "") {
                //add extra line
                functions += '<br>'// '\r\n'
            }
            var result = eval(func)
            functions += result
        } 
        //write to ui
        const doc = eval("document")
        doc.getElementById("overview-extra-hook-0").innerHTML = identifiers //innerText
        doc.getElementById("overview-extra-hook-1").innerHTML = functions      
    }


    //add player information
    add_general_information(ns) {
        this.entries.set("Intelligence", "ns.getPlayer().skills.intelligence")
        this.entries.set("Karma", "formatNumber(ns.getPlayer().karma)")
        this.entries.set("Kills", "formatNumber(ns.getPlayer().numPeopleKilled)")
        this.entries.set("Entropy", "ns.getPlayer().entropy")
        this.entries.set("Bitnode", "ns.getResetInfo().currentNode")
        this.entries.set("ownedAugs", "ns.getResetInfo().ownedAugs.size")

        //this.entries.set("Factions", "ns.getPlayer().factions.join(', ')")
        //this.entries.set("Jobs", "Array.from(ns.getPlayer().jobs).join(', ')")
    }

    
	//sleeve information
    get_sleeve_information(ns) {
        //create list to add
        var sleeves = []
        //get number of sleeves owned
        const sleeves_owned = ns.sleeve.getNumSleeves()
        //for each sleeve
        for (let i = 0; i < sleeves_owned; i++) {
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
            }
            //add to the list
            sleeves.push(React.createElement('li', null, "Sleeve #" + i + ": ", data))
        }
        //return the chapter and the multipliers
        return React.createElement('p', null, "Sleeves:", sleeves)
    }

	get_go_stats(ns) {
		//create variable to fill
		var opponent_stats = []
		//get the stats
		const stats_overview = ns.go.analysis.getStats()
		//for each opponent
		for (const opponent of stats_overview) {
			//get stats for easy access
			const stats = stats_overview[opponent]
			const total = stats.wins + stats.losses
			const percent = Math.round(stats.bonusPercent * 100) / 100
			//add to the list
            opponent_stats.push(React.createElement('li', null, opponent + ": " + stats.wins + "/" + total + " => " + stats.rep + " rep, " + percent + ": " + stats.bonusDescription))
		}
		//return the chapter and the multipliers
        return React.createElement('p', null, "Go:", opponent_stats) 
	}
}


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

    /*
    import { createElement } from 'react';

    function Greeting({ name }) {
      return createElement(
        'h1',
        null,
        'Hello ',
        createElement('i', null, name),
        '. Welcome!'
      );
    }

    */


    /*
    https://www.delftstack.com/howto/react/react-createelement/

    const ListItem = (props) => {
      return React.createElement('li', null, props.text);
    };

    const List = (props) => {
      const items = props.items.map((item, index) =>
        React.createElement(ListItem, { key: index, text: item })
      );
      return React.createElement('ul', null, ...items);
    };

    const element = React.createElement(List, { items: ['Item 1', 'Item 2', 'Item 3'] });
    */


    /*
    https://react.dev/reference/react/createElement#creating-an-element-without-jsx


    creating easily reproducable components:

    	const MyComponent = (props) => {
    	return React.createElement('div', null, `Welcome, ${props.name}!`);
    	};

    	const element = React.createElement(MyComponent, { name: 'Alice' });
    */

    /*
    Nesting

    const ListItem = (props) => {
      return React.createElement('li', null, props.text);
    };

    const List = (props) => {
      const items = props.items.map((item, index) =>
        React.createElement(ListItem, { key: index, text: item })
      );
      return React.createElement('ul', null, ...items);
    };

    const element = React.createElement(List, { items: ['Item 1', 'Item 2', 'Item 3'] });
    */

    /*
    ns.ui.renderPage(node)
    	On the left side of the UI, the sidebar contains shortcuts to game features (Terminal, Script Editor, City, etc.). 
    	When clicking a sidebar item, the feature is rendered on the right side of the UI. This space is the main content area.
    	For example, when you click the "City" button in the sidebar, the locations in that city are rendered in the main content area.
    	This function effectively switches to a new custom "page", as if you had navigated via the sidebar. 
    	Calling it again replaces the contents of the page.

    	ReactNode type
    		A stand-in for the real React.ReactNode. 
    		A ReactElement is rendered dynamically with React. 
    		number and string are displayed directly. boolean, null, and undefined are ignored and not rendered. 
    		An array of ReactNodes will display all members of that array sequentially.

    		Use React.createElement to make the ReactElement type, see creating an element without jsx from the official React documentation.

    		Signature:
    			type ReactNode = ReactElement | string | number | null | undefined | boolean | ReactNode[];

    		References: ReactElement, ReactNode

    	ReactElement interface
    		A stand-in for the real React.ReactElement. 
    		Use React.createElement to make these. 
    		See creating an element without jsx from the official React documentation.

    	React.createElement()
    		This method takes three arguments: the type of the element (which can be a string representing an HTML tag or a React component), an optional set of props, 
    		and an optional list of children.

    		const element = React.createElement('h1', { className: 'greeting' }, 'Hello, World!');

    		<h1 class="greeting">Hello, World!</h1>
    		


    */


    /*
    //list to keep track of elements to show
    var ui_elements_to_show = []
    //variable of the UI
    var doc

    //clear UI and add standard data
    export async function init(ns) {
    	//clear the ui
    	//get the UI -> can this be done once during init?
        doc = await evaluate.exec(ns,'document')
    	//send text to html element 
        doc.getElementById('overview-extra-hook-0').innerText = ""
        doc.getElementById('overview-extra-hook-1').innerText = ""
    	
    	//add default elements to ui
    	add(ns, "intelligence", "ns.getPlayer().skills.intelligence")
    	add(ns, "karma", "ns.getPlayer().karma")
    	add(ns, "kills", "ns.getPlayer().numPeopleKilled")
    	add(ns, "entropy", "ns.getPlayer().entropy")
    	add(ns, "# augments", "ns.getResetInfo().ownedAugs.size")
    	
    	//fixed information
    	const reset_info = await evaluate.exec(ns,"ns.getResetInfo()") 
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
    	//add to ui
    	add(ns, "BitNode", reset_info.currentNode + "." + level) 
    }


    //function that add information to the list of data to display
    export function add(ns, text, func) {
    	//add to the list
    	ui_elements_to_show.push([text, func])
    }


    //function that updates the UI
    export async function update(ns) {
        //create new headers list
        const headers = []
        //create new values list
        const values = []
    	//for each saved element
    	for (const element of ui_elements_to_show) {
    		//get text
    		headers.push(element[0])
    		//refresh the data
    		values.push(await evaluate.exec(ns,element[1]))
    	}
    	//send text to html element 
        doc.getElementById('overview-extra-hook-0').innerText = headers.join("\n")
        doc.getElementById('overview-extra-hook-1').innerText = values.join("\n")
    }

    */

    /*
    ReactElement			A stand-in for the real React.ReactElement. Use React.createElement to make these. See creating an element without jsx from the official React documentation.
    UserInterface			User Interface API.
    UserInterfaceTheme		Interface Theme
    */

    