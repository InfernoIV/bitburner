import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"

const investment_rounds_max = 4
const valuation_required_for_bribe = 100e12
const min_rp_to_buy_ta2 = 150e3

// Declaration
export class corporation_obj {
    constructor() {
        this.available = true
        this.max_divisions = 20 //TODO: check how this works outside of BN3
        //this.investment_round = 0
    }

    /*Should I create more divisions for the same industry? For example: multiple Agriculture divisions.

No, focus your funds on one division for each industry.
*/


    init(ns) {
        //ns.disableLog("")
        /*
        Smart Supply: Automatically buy optimal quantities of input material units.

Export: Allow export/import materials between divisions.

Wilson: Wilson Analytics upgrade.

Market-TA2: Automatically set optimal prices for your output materials/products.

RP: Research point.
        */
    }


    manage(ns) {
        const state = ""
        switch (state) {
            case "START": 
                this.manage_start(ns)
                break

            case "PURCHASE":
                this.manage_purchase(ns) 
                break

            case "PRODUCTION":
                this.manage_production(ns)
                break

            case "EXPORT":
                this.manage_export(ns)
                break

            case "SALE":
                this.manage_sale(ns)
                break
            
            default:
        }
        //bribe factions
        this.bribe_factions(ns)
    }


    manage_start(ns) {

    }

    manage_purchase(ns) {

    }

    manage_production(ns) {

    }

    manage_export(ns) {

    }

    manage_sale(ns) {

    }
}

/*
What do Interns do?

They maintain energy and morale. You should only use them if you don't want to write scripts. A tea/party script can maintain energy and morale for you, and it is very simple to implement. It's recommended to implement that script instead of wasting employees on the "Intern" job.

I use 1/9 as Intern ratio, but energy and morale still drop.

You can only use that ratio when your corporation works fine (funds > 0 or profit > 0). If it does not, use 1/6.

Buying tea and throwing parties cost me too much money. Why are they so expensive?

Tea and parties are cheap. If your budget is so low that they cost you too much money, it means you wasted too much of your funds.

*/

/*
My corporation generates profit. Why does my money not increase?

Go public and set a dividend.
How many shares should I issue?

0
*/

/*
Why is my "earnings as a shareholder" lower than my calculation ("Dividends per share" * "Owned Stock Shares")?

Your dividend is negatively affected by a penalty modifier called "tribute modifier". ShadyAccounting and GovernmentPartnership reduce this penalty modifier. Check this section for details.
*/

/*
Each division can expand to 6 cities.
Each division has its "division product multiplier". This multiplier can be increased by buying boost materials: AI Cores, Hardware, Real Estate, and Robots.
*/

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

/*
TODO: implement own TA2 to speed up and save RP
https://github.com/bitburner-official/bitburner-src/blob/dev/src/Documentation/doc/en/advanced/corporation/optimal-selling-price-market-ta2.md
*/