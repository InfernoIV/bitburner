
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
