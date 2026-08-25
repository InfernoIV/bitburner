//config
import { DISABLE_LOGGING } from "./config.js"


//constants
import { SCRIPT } from "scripts/constants/scripts.js"
import { SERVER } from "scripts/constants/server.js"


//functions
import * as log from "scripts/util/log.js"


// Declaration
export class stanek_obj {
    constructor() {
        this.started = false
    }


    /*
    
    */
    init(ns) {
        //disable logging
        log.disable(ns, DISABLE_LOGGING)
    }


    /*
    ns.stanek.acceptGift            2.0
    ns.stanek.giftHeight            0.4
    ns.stanek.giftWidth             0.4
    ns.stanek.getFragment           2.0 //needed to check what we have when rebooting. Clearing will remove the charges?
    */
    manage(ns) {
        //if stanek started
        if (this.started) {
            //stop
            return
        }
        //if gift cannot be accepted
        if (!ns.stanek.acceptGift()) {
            //log error
            log.error(ns, "Stanek", "Unable to accept Stanek gift")
            //stop
            return
        }
        //get width
        const width = ns.stanek.giftWidth()
        //get height
        const height = ns.stanek.giftHeight()
        //get fragments placed
        let fragments = this.get_fragments(ns)
        //if we have no fragments
        if (fragments.length == 0) {
            //place fragments
            this.place_fragments(ns)
            //update the fragments
            fragments = this.get_fragments(ns)
        }

        //start worker
        let result = ns.exec(SCRIPT.WORKER.STANEK, SERVER.HOME, {
            preventDuplicates: true,
            threads: threads,
        }, fragments)
        //check if ok
        if (result == false) {
            //debug
            log.error(ns, "Stanek", "Failed to start worker!", true)
            //stop
            return
        }
        //signal start is done, to speed up execution
        this.started = true
        //log
        log.success(ns, "Stanek", "Stanek worker deployed")
    }


    /*
    ns.stanek.fragmentDefinitions   0.0
    */
    //determine the best placement for all fragments
    place_fragments(ns, width, height) {

        //keep track of possible fragments
        let fragments_possible = []
        //also save the ID's seperately
        let fragments_possible_ids = new Map()
        //calculate total grid size
        const size_total = width * height
        //get all possible fragments
        const fragments_all = ns.stanek.fragmentDefinitions()
        //keep track of current size
        let size_current = 0
        //keep track of the minimal fragment size
        let size_min = 0

        //while there are still fragments to place
        while ((size_current + size_min) < size_total) {
            //for each fragment
            for (const fragment of fragments_all) {
                /*TODO: how to prioritize?
                currently is just takes the each fragment and checks if it fits
                TODO: there are fragments which power adjacent fragments: how to handle?
                use 'effect' to determine?
                or 'power'?
                */

                //get the fragment size
                const size_fragment = this.determine_size(fragment)
                //if it fits
                if ((size_current + size_fragment) <= size_total) {
                    //if already registered
                    if (fragments_possible_ids.has(fragment.id)) {
                        //get the current used
                        const used = fragments_possible_ids.get(fragment.id)
                        //if the limit has been reached
                        if (used >= fragment.limit) {
                            //go to next
                            continue
                        }
                    }
                    //increase the used size
                    size_current += size_fragment
                    //add to list of fragments
                    fragments_possible.push(fragment)
                    //if already registered
                    if (fragments_possible_ids.has(fragment.id)) {
                        //add a usage to the id
                        fragments_possible_ids.set(fragment.id, fragments_possible_ids.get(fragment.id) + 1)
                    } else {
                        //set the usage of the id
                        fragments_possible_ids.set(fragment.id, 1)
                    }
                }
            }
            //update the min size
            size_min = this.get_min_size(fragments_all, fragments_possible)
        }
        //place the fragments
        this.determine_placements(ns, fragments_possible)
    }


    //function that determines the surface of the fragment
    determine_size(fragment) {
        //convert to string, then count all the "trues"
        let count = (fragment.shape.toString().match(/true/g) || []).length
        //return the count
        return count
    }


    //function that gets the minimal size of fragment left in the list
    get_min_size(fragments_all, fragments_possible_ids) {
        //keep track of min size
        let min_size = 99
        //for each fragment possible
        for (const fragment of fragments_all) {
            //if already registered
            if (fragments_possible_ids.has(fragment.id)) {
                //get the current used
                const used = fragments_possible_ids.get(fragment.id)
                //if the limit has been reached
                if (used >= fragment.limit) {
                    //go to next
                    continue
                }
            }
            //get the size
            const size = determine_size(fragment)
            //update the min size to the lowest value
            min_size = Math.min(min_size, size)
        }
        //return the min size
        return min_size
    }


    /*
    ns.stanek.clearGift         0   
    */
    //determine the best possible placements of the fragments
    determine_placements(ns, fragments_possible) {
        //keep track of initial list
        let fragments_to_place = fragments_possible
        //keep track of iterations
        let iteration = 0
        //keep track of success outside of the while loop
        let success = false
        //keep trying for amount of iterations equal to the number of fragments (so we start with another fragment each time)
        while (iteration < fragments.to_place.length) {
            //clear the grid
            ns.stanek.clearGift()
            //place the fragments
            success = this.determine_placement(ns, fragments_to_place)
            //if successfully placed all
            if (success) {
                //stop
                break
            }
            //place the first element to the end (shift the entire array)
            //TODO: is there a way to get another order instead of just shifting? -> is this needed?
            fragments_to_place.push(fragments_to_place.shift())
            //up the iteration
            iteration += 1
        }
        //if successfully placed all
        if (success) {
            //log
            log.success(ns, "Stanek", "Placed all fargments: " + fragments_to_place.length + " / " +
                fragments_possible.length, true)

        } else {
            //log
            log.warning(ns, "Stanek", "Unable to place all fargments, " + fragments_to_place.length + " / " +
                fragments_possible.length + " fragments placed", true)
        }
        //stop
        return
    }


    //inception function to place fragments
    /*
    ns.stanek.canPlaceFragment  0.5
    ns.stanek.removeFragment    0.15
    ns.stanek.placeFragment     5.0

    We start with placing the first fragment in a spot, then going deeper with the list becoming smaller and smaller for each fragment placed
    if fragment cannot be placed in any position or rotation, return false
    if fragment can be placed, place it and go deeper. if can be placed, place it, if cannot go deeper: return true
    */
    determine_placement(ns, fragments_to_place) {
        //copy the list
        let fragments_left = fragments_to_place
        //remove the first fragment and save it
        const fragment = fragments_left.shift()

        //for each x position
        for (let x = 0; x < grid[0].length; x++) {
            //for each y postion
            for (let y = 0; y < grid.length; y++) {
                //for each rotation
                for (let rotation = 0; rotation < 4; rotation++) {
                    //check if we can place the fragment
                    if (ns.stanek.canPlaceFragment(x, y, rotation, fragment)) {
                        //place the fragment
                        ns.stanek.placeFragment(x, y, rotation, fragment)
                        //if there are no fragments left (after this one)
                        if (fragments_left.length <= 0) {
                            //we have placed all
                            return true
                        }
                        //we can still place fragments: go deeper
                        let result = this.determine_placement(ns, fragments_left)
                        //if deeper placement sucessfull
                        if (result == true) {
                            //we have placed all, return
                            return true
                        }
                        //otherwise, we need to change position and try again: remove the fragment
                        ns.stanek.removeFragment(x, y)
                    }
                }
            }
        }
        //no matches possible
        return false
    }


    //function that gets all fragments
    get_fragments(ns) {
        //create overview of fragments
        let fragments = []
        //for each x
        for (let x = 0; x < width; x++) {
            //for each y
            for (let y = 0; y < height; y++) {
                //get fragment
                const fragment = ns.stanek.getFragment(x, y)
                //if there is a fragment
                if (fragment != undefined) {
                    //add to coordinates to the list
                    fragments.push(fragment)
                }
            }
        }
    }
}
