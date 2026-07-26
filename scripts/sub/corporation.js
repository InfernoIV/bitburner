
import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"
import * as evaluate from "scripts/sub/evaluate.js"


// Declaration
export class corporation_obj {
    constructor() {
        this.available = true
    }


    init(ns) {
        
    }

    
    manage(ns){

    }
}


/*
createCorporation(corporationName, selfFund)
    Create a Corporation. You should use canCreateCorporation to check if you are unsure you can do it, because it throws an error in these cases:
        Use seed money outside BitNode 3.
        Be in a BitNode that has CorporationSoftcap (a BitNode modifier) less than 0.15.

Corporation.canCreateCorporation()  Return whether the player can create a corporation. Does not require API access.

*/

/*
CorpEmployeePosition
CorpIndustryName
CorpMaterialName
CorpResearchName
CorpSmartSupplyOption
CorpStateName
CorpUnlockName
CorpUpgradeName

CreatingCorporationCheckResult
CreatingCorporationCheckResultEnumType
*/