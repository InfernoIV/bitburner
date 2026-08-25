//booster fragment
const TYPE_BOOSTER = 18
//time to wait
const TIME_WAIT = 5


/*
baseCost                    1.6            
ns.stanek.chargeFragment    0.4
*/
//function that charges stanek fragments, receives the size of the grid as arguments
export async function main(ns) {
    //guard clause
    if (ns.args.length < 1) {
        //indicate issue
        ns.tprint(ns.args.length + " ARGUMENTS FOR 'worker_stanek.js'!")
        //exit
        ns.exit()
    }
    //get the fragments
    let fragments = ns.args[0]
    //create a list for chargeable fragments
    let fragments_chargeable = []
    //for each fragment
    for (const fragment of fragments) {
        //if not a booster type
        if (fragment.type != TYPE_BOOSTER) { 
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
        await ns.sleep(TIME_WAIT)
    }
}