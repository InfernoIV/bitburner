//If you are not in BitNode-2, then you must have Source-File 2 in order to use this API.
//Outside BitNode 2, your karma must be less than or equal to 54000.

# BitNode 2
## Explanation
This BitNode unlocks Gang. Gang is a simple and useful mechanic.

    Its benefits do not reset when you install augmentations or soft reset.
    Good income.
    Give you access to most augmentations. If you are in BitNode 2, your Gang will offer The Red Pill. This is arguably the biggest benefit of Gang. Farming reputation with factions to get access to their augmentations is the most time-consuming thing of a run. With Gang, you have access to most augmentations, so you only need to join 1 more faction to get NFG.

In order to create a gang, you need to "farm karma". Committing crimes reduces your karma, and Gang is unlocked when your karma is less than or equal to 54000 (this is a constant in all BitNodes). Farming karma is very slow, and Sleeves (BitNode 10) speed it up tremendously. Sleeves are copies of yourself, and you can let them do many tasks. When you set them to "Commit Crime", their action also reduces your karma as if you do it yourself.

When you enter this BitNode, there are two things that you need to keep in mind:

    There is no karma requirement in BitNode 2, but creating a gang too soon is a mistake. Having an adequate income boosts the early stage of Gang significantly. Outside BitNode 2, this is not a problem. When you finish farming karma, you usually have a decent income.
    Territory is important. Enabling territory clashes when your gang is still too weak is a serious mistake. You may lose all territory. On the other hand, enabling territory clashes too late is also bad. You need to find a balance here. In short, do it soon, but not too soon.


Strategy:
grind for respect, train combat and ascend until ~500 combat
perform terrorism until ~few million respect
human trafficking and only ascend when multipliers are doubled or tripled

## Bitnode multipliers
HackingLevelMultiplier: 0.8,

        ServerGrowthRate: 0.8,
        ServerMaxMoney: 0.08,
        ServerStartingMoney: 0.4,

        CloudServerSoftcap: 1.3,

        CrimeMoney: 3,

        FactionPassiveRepGain: 0,
        FactionWorkRepGain: 0.5,

        CorporationSoftcap: 0.9,
        CorporationDivisions: 0.9,

        InfiltrationMoney: 3,
        StaneksGiftPowerMultiplier: 2,
        StaneksGiftExtraSize: -6,
        WorldDaemonDifficulty: 5,

## Enums
EquipmentStats		Object representing data representing a gang member equipment.
GangTaskStats		Object representing data representing a gang member task.

/*
export function calculateMoneyGain(gang: FormulaGang, member: GangMember, task: GangMemberTask): number {
if (task.baseMoney === 0) return 0;
let statWeight =
    (task.hackWeight / 100) * member.hack +
    (task.strWeight / 100) * member.str +
    (task.defWeight / 100) * member.def +
    (task.dexWeight / 100) * member.dex +
    (task.agiWeight / 100) * member.agi +
    (task.chaWeight / 100) * member.cha;

statWeight -= 3.2 * task.difficulty;
if (statWeight <= 0) return 0;
const territoryMult = Math.max(0.005, Math.pow(gang.territory * 100, task.territory.money) / 100);
if (isNaN(territoryMult) || territoryMult <= 0) return 0;
const respectMult = calculateWantedPenalty(gang);
const territoryPenalty = (0.2 * gang.territory + 0.8) * currentNodeMults.GangSoftcap;
return Math.pow(5 * task.baseMoney * statWeight * territoryMult * respectMult, territoryPenalty);
}
*/

/*
        export function calculateRespectGain(gang: FormulaGang, member: GangMember, task: GangMemberTask): number {
        if (task.baseRespect === 0) return 0;
        let statWeight =
            (task.hackWeight / 100) * member.hack +
            (task.strWeight / 100) * member.str +
            (task.defWeight / 100) * member.def +
            (task.dexWeight / 100) * member.dex +
            (task.agiWeight / 100) * member.agi +
            (task.chaWeight / 100) * member.cha;
        statWeight -= 4 * task.difficulty;
        if (statWeight <= 0) return 0;
        const territoryMult = Math.max(0.005, Math.pow(gang.territory * 100, task.territory.respect) / 100);
        const territoryPenalty = (0.2 * gang.territory + 0.8) * currentNodeMults.GangSoftcap;
        if (isNaN(territoryMult) || territoryMult <= 0) return 0;
        const respectMult = calculateWantedPenalty(gang);
        return Math.pow(11 * task.baseRespect * statWeight * territoryMult * respectMult, territoryPenalty);
        */
        