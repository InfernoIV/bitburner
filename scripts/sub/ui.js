import * as evaluate from 'scripts/sub/eval.js'

//list to keep track of elements to show
var ui_elements_to_show = []
//variable of the UI
var doc

//clear UI and add standard data
export async function init(ns) {
	//clear the ui
	//get the UI -> can this be done once during init?
    doc = await evaluate.exec('document')
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
	const reset_info = await evaluate.exec(ns.getResetInfo()) 
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
		values.push(await evaluate.exec(element[1]))
	}
	//send text to html element 
    doc.getElementById('overview-extra-hook-0').innerText = headers.join("\n")
    doc.getElementById('overview-extra-hook-1').innerText = values.join("\n")
}


/*
ReactElement			A stand-in for the real React.ReactElement. Use React.createElement to make these. See creating an element without jsx from the official React documentation.
UserInterface			User Interface API.
UserInterfaceTheme		Interface Theme
*/