//This API requires Source-File 10 to use.
//https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.grafting.md

/*
getAugmentationGraftPrice(augName)  3.75 GB Retrieve the grafting cost of an aug.
getAugmentationGraftTime(augName)   3.75 GB Retrieves the time required to graft an aug. Do not use this value to determine when the ongoing grafting finishes. The ongoing grafting is affected by current intelligence level and focus bonus. You should use waitForOngoingGrafting for that purpose.
getGraftableAugmentations()         5 GB    Retrieves a list of augmentations that can be grafted.
graftAugmentation(augName, focus)   7.5 GB  Begins grafting the named aug. You must be in New Tokyo to use this. When you call this API, the current work (grafting or other actions) will be canceled.
waitForOngoingGrafting()            0 GB    Wait until the ongoing grafting finishes or is canceled.
*/

/*
Grafting

Grafting is an experimental process through which you can obtain the benefits of Augmentations, without needing to reboot your body.

Grafting can be done at VitaLife in New Tokyo, where you'll find a shady researcher with questionable connections. From there, you can spend a sum of money to begin grafting Augmentations. This will take some time. When done, the Augmentation will be applied to your character without needing to install.

Be warned, some who have tested grafting have reported an unidentified malware. Dubbed Entropy, this virus seems to grow in potency as more Augmentations are grafted, causing unpredictable affects to the victim.

Note that when grafting an Augmentation, cancelling will not save your progress, and the money spent will not be returned.
*/

# BitNode 10
## Introduction
This BitNode unlocks Sleeves and Grafting.

Sleeves are your "copies", so they can do most things that you can do (studying, working, committing crimes, etc.). This mechanic synergizes well with mechanics involving slow tasks that can be boosted by doing things simultaneously (e.g., farming karma for Gang, generating contracts/operations for Bladeburner). You can buy up to 5 Sleeves from "The Covenant" faction. Each Source-File level grants you a Sleeve.

Grafting is a special way of installing augmentations.

    Grafting bypasses the need of resetting the main body and farming faction reputation.
        The augmentation is installed immediately after the grafting process finishes.
        The requirement of faction reputation is ignored when grafting.
    Grafting gives you a debuff that decreases many multipliers. This debuff can be removed by installing a special augmentation.

You should keep these things in mind:

    You cannot buy Sleeves and their memory upgrades outside this BitNode.
    Sleeves are expensive. The last Sleeve costs 100e15 (100q). You will need a batcher or a corporation.
    Due to the debuff, grafting is sometimes underestimated and underutilized. When grafting, you need to choose the augmentations carefully. If you choose appropriate ones, grafting is a very strong mechanic.

This BitNode's multipliers are fairly harsh. You will need a source of high income for the last Sleeve anyway, so harsh multipliers should not be a big problem. Utilizing the grafting mechanic properly lessens the harsh multipliers.


## Bitnode multipliers
HackingLevelMultiplier: 0.35,
StrengthLevelMultiplier: 0.4,
DefenseLevelMultiplier: 0.4,
DexterityLevelMultiplier: 0.4,
AgilityLevelMultiplier: 0.4,
CharismaLevelMultiplier: 0.4,

HomeComputerRamCost: 1.5,

CloudServerCost: 5,
CloudServerSoftcap: 1.1,
CloudServerLimit: 0.6,
CloudServerMaxRam: 0.5,

CompanyWorkMoney: 0.5,
CrimeMoney: 0.5,
HacknetNodeMoney: 0.5,
ManualHackMoney: 0.5,
ScriptHackMoney: 0.5,
CodingContractMoney: 0.5,

AugmentationMoneyCost: 5,
AugmentationRepCost: 2,

InfiltrationMoney: 0.5,

CorporationValuation: 0.5,
CorporationSoftcap: 0.9,
CorporationDivisions: 0.9,

BladeburnerRank: 0.8,

GangSoftcap: 0.9,
GangUniqueAugs: 0.25,

StaneksGiftPowerMultiplier: 0.75,
StaneksGiftExtraSize: -3,

DarknetMoneyMultiplier: 0.4,

WorldDaemonDifficulty: 2,


## Enums
Sleeve						Sleeve API
SleeveBladeburnerTask		
SleeveClassTask
SleeveCompanyTask
SleeveCrimeTask
SleeveFactionTask
SleeveInfiltrateTask
SleevePerson
SleeveRecoveryTask
SleeveSupportTask
SleeveSynchroTask	

Grafting		Grafting API
GraftingTask	Grafting Work
