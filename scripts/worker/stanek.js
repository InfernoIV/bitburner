
import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"

/*
baseCost                    1.6            
ns.stanek.chargeFragment    0.4
*/
//function that charges stanek fragments, receives the size of the grid as arguments
export async function main(ns) {
    //get the fragments
    var fragments = ns.args[0]

    //create a list for chargeable fragments
    var fragments_chargeable = []
    //for each fragment
    for (const fragment of fragments) {
        //if not a booster type
        if (fragment.type != 18) { 
            //add to chargeable list
            fragments_chargeable.push(fragment)
        }
    }
    
    //infitely
    while(true) {
        //for each fragment that is chargeable
        for (const fragment in fragments_chargeable) {
            //charge the fragment
            await ns.stanek.chargeFragment(fragment.x, fragment.y)    
        }
        //failsafe to prevent script from going haywire
        await ns.sleep(CONSTANTS.TIME.WAIT)
    }
}