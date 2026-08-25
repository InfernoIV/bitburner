
# BitNode 3
## Introduction
This BitNode unlocks Corporation. Corporation is one of the most controversial mechanics in Bitburner. 
As I said before, it's extremely complicated, extremely powerful, and extremely fast. 
If you have a good corporation script, you can ignore all other mechanics and speedrun most BitNodes. 
However, "having a good corporation script" is a serious challenge. 
Writing that "good script" may take days or weeks, assuming that you read the documentation carefully and have good advice from other experienced players (please join our Discord server and discuss there). 
If you try to do it blindly, Corporation is the worst mechanic.

If you want to try this mechanic, you must remember this advice: When in doubt, check the in-game documentation. 
Corporation has the most extensive documentation in Bitburner. 
Note that you do not have to read all of them in one go. 
I recommend that you read the first 4 sections. They are the most important sections for newbies. 
After that, you can read the following sections at your leisure.


Level 3 unlocks the warehouse and office API

Disabled when currentNodeMults.CorporationSoftcap < 0.15

Requires 150e9 outside of BN3

# Bitnode multipliers
HackingLevelMultiplier: 0.8,

ServerGrowthRate: 0.2,
ServerMaxMoney: 0.04,
ServerStartingMoney: 0.2,

HomeComputerRamCost: 1.5,

CloudServerCost: 2,
CloudServerSoftcap: 1.3,

CompanyWorkMoney: 0.25,
CrimeMoney: 0.25,
HacknetNodeMoney: 0.25,
ScriptHackMoney: 0.2,

FavorToDonateToFaction: 0.5,

AugmentationMoneyCost: 3,
AugmentationRepCost: 3,

GangSoftcap: 0.9,
GangUniqueAugs: 0.5,

StaneksGiftPowerMultiplier: 0.75,
StaneksGiftExtraSize: -2,

DarknetMoneyMultiplier: 0.4,

WorldDaemonDifficulty: 2,


## Enums
CorpConstants				Corporation related constants
CorpIndustryData			Data for an individual industry
CorpMaterialConstantData	Corporation material information
Corporation					Corporation API
CorporationInfo				General info about a corporation
CorpProductData				Product rating information
Division					Corporation division
Export						Export order for a material
InvestmentOffer				Corporation investment offer
Material					Material in a warehouse
Office						Office for a division in a city.
OfficeAPI					Corporation Office API
Product						Product in a warehouse
Warehouse					Warehouse for a division in a city
WarehouseAPI				Corporation Warehouse API

/*
Smart Supply: Automatically buy optimal quantities of input material units.

Export: Allow export/import materials between divisions.

Wilson: Wilson Analytics upgrade.

Market-TA2: Automatically set optimal prices for your output materials/products.

RP: Research point.
*/

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

    /*Should I create more divisions for the same industry? For example: multiple Agriculture divisions.

No, focus your funds on one division for each industry.
*/