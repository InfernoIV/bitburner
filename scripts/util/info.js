/** @param {NS} ns */
export async function main(ns) {

    ns.tprint(ns.singularity.getAugmentationsFromFaction("CyberSec"))

    /*
    for (const name in ns.enums.CompanyName) {
      const company = ns.enums.CompanyName[name]

      ns.tprint("Company: '" + company + "'")
     
    }
    ns.tprint("")
      
      for (const name in ns.enums.FactionName) {
      const faction = ns.enums.FactionName[name]
        try {
          const invite_requirements = ns.singularity.getFactionInviteRequirements(faction)
          ns.tprint("Faction '" + faction + "': '" + JSON.stringify(invite_requirements) + "'")
        } catch (err) {
          ns.tprint("Faction '" + faction + "': not unlocked")
        }  
      }
        */
}

/*
Company: 'ECorp'
Company: 'MegaCorp'
Company: 'Bachman & Associates'
Company: 'Blade Industries'
Company: 'NWO'
Company: 'Clarke Incorporated'
Company: 'OmniTek Incorporated'
Company: 'Four Sigma'
Company: 'KuaiGong International'
Company: 'Fulcrum Technologies'
Company: 'Storm Technologies'
Company: 'DefComm'
Company: 'Helios Labs'
Company: 'VitaLife'
Company: 'Icarus Microsystems'
Company: 'Universal Energy'
Company: 'Galactic Cybersystems'
Company: 'AeroCorp'
Company: 'Omnia Cybersystems'
Company: 'Solaris Space Systems'
Company: 'DeltaOne'
Company: 'Global Pharmaceuticals'
Company: 'Nova Medical'
Company: 'Central Intelligence Agency'
Company: 'National Security Agency'
Company: 'Watchdog Security'
Company: 'LexoCorp'
Company: 'Rho Construction'
Company: 'Alpha Enterprises'
Company: 'Aevum Police Headquarters'
Company: 'SysCore Securities'
Company: 'CompuTek'
Company: 'NetLink Technologies'
Company: 'Carmichael Security'
Company: 'FoodNStuff'
Company: 'Joe's Guns'
Company: 'Omega Software'
Company: 'Noodle Bar'

Faction 'Illuminati': '[{"type":"numAugmentations","numAugmentations":30},{"type":"money","money":150000000000},{"type":"skills","skills":{"hacking":1500}},{"type":"skills","skills":{"strength":1200}},{"type":"skills","skills":{"defense":1200}},{"type":"skills","skills":{"dexterity":1200}},{"type":"skills","skills":{"agility":1200}}]'
Faction 'Daedalus': '[{"type":"numAugmentations","numAugmentations":30},{"type":"money","money":100000000000},{"type":"someCondition","conditions":[{"type":"skills","skills":{"hacking":2500}},{"type":"skills","skills":{"strength":1500,"defense":1500,"dexterity":1500,"agility":1500}}]}]'
Faction 'The Covenant': '[{"type":"numAugmentations","numAugmentations":20},{"type":"money","money":75000000000},{"type":"skills","skills":{"hacking":850}},{"type":"skills","skills":{"strength":850}},{"type":"skills","skills":{"defense":850}},{"type":"skills","skills":{"dexterity":850}},{"type":"skills","skills":{"agility":850}}]'
Faction 'ECorp': '[{"type":"employedBy","company":"ECorp"},{"type":"companyReputation","company":"ECorp","reputation":400000}]'
Faction 'MegaCorp': '[{"type":"employedBy","company":"MegaCorp"},{"type":"companyReputation","company":"MegaCorp","reputation":400000}]'
Faction 'Bachman & Associates': '[{"type":"employedBy","company":"Bachman & Associates"},{"type":"companyReputation","company":"Bachman & Associates","reputation":400000}]'
Faction 'Blade Industries': '[{"type":"employedBy","company":"Blade Industries"},{"type":"companyReputation","company":"Blade Industries","reputation":400000}]'
Faction 'NWO': '[{"type":"employedBy","company":"NWO"},{"type":"companyReputation","company":"NWO","reputation":400000}]'
Faction 'Clarke Incorporated': '[{"type":"employedBy","company":"Clarke Incorporated"},{"type":"companyReputation","company":"Clarke Incorporated","reputation":400000}]'
Faction 'OmniTek Incorporated': '[{"type":"employedBy","company":"OmniTek Incorporated"},{"type":"companyReputation","company":"OmniTek Incorporated","reputation":400000}]'
Faction 'Four Sigma': '[{"type":"employedBy","company":"Four Sigma"},{"type":"companyReputation","company":"Four Sigma","reputation":400000}]'
Faction 'KuaiGong International': '[{"type":"employedBy","company":"KuaiGong International"},{"type":"companyReputation","company":"KuaiGong International","reputation":400000}]'
Faction 'Fulcrum Secret Technologies': '[{"type":"employedBy","company":"Fulcrum Technologies"},{"type":"companyReputation","company":"Fulcrum Technologies","reputation":400000},{"type":"backdoorInstalled","server":"fulcrumassets"}]'
Faction 'BitRunners': '[{"type":"backdoorInstalled","server":"run4theh111z"}]'
Faction 'The Black Hand': '[{"type":"backdoorInstalled","server":"I.I.I.I"}]'
Faction 'NiteSec': '[{"type":"backdoorInstalled","server":"avmnite-02h"}]'
Faction 'Aevum': '[{"type":"city","city":"Aevum"},{"type":"money","money":40000000}]'
Faction 'Chongqing': '[{"type":"city","city":"Chongqing"},{"type":"money","money":20000000}]'
Faction 'Ishima': '[{"type":"city","city":"Ishima"},{"type":"money","money":30000000}]'
Faction 'New Tokyo': '[{"type":"city","city":"New Tokyo"},{"type":"money","money":20000000}]'
Faction 'Sector-12': '[{"type":"city","city":"Sector-12"},{"type":"money","money":15000000}]'
Faction 'Volhaven': '[{"type":"city","city":"Volhaven"},{"type":"money","money":50000000}]'
Faction 'Speakers for the Dead': '[{"type":"not","condition":{"type":"employedBy","company":"Central Intelligence Agency"}},{"type":"not","condition":{"type":"employedBy","company":"National Security Agency"}},{"type":"skills","skills":{"hacking":100}},{"type":"skills","skills":{"strength":300}},{"type":"skills","skills":{"defense":300}},{"type":"skills","skills":{"dexterity":300}},{"type":"skills","skills":{"agility":300}},{"type":"numPeopleKilled","numPeopleKilled":30},{"type":"karma","karma":-45}]'
Faction 'The Dark Army': '[{"type":"city","city":"Chongqing"},{"type":"not","condition":{"type":"employedBy","company":"Central Intelligence Agency"}},{"type":"not","condition":{"type":"employedBy","company":"National Security Agency"}},{"type":"skills","skills":{"hacking":300}},{"type":"skills","skills":{"strength":300}},{"type":"skills","skills":{"defense":300}},{"type":"skills","skills":{"dexterity":300}},{"type":"skills","skills":{"agility":300}},{"type":"numPeopleKilled","numPeopleKilled":5},{"type":"karma","karma":-45}]'
Faction 'The Syndicate': '[{"type":"someCondition","conditions":[{"type":"city","city":"Aevum"},{"type":"city","city":"Sector-12"}]},{"type":"not","condition":{"type":"employedBy","company":"Central Intelligence Agency"}},{"type":"not","condition":{"type":"employedBy","company":"National Security Agency"}},{"type":"money","money":10000000},{"type":"skills","skills":{"hacking":200}},{"type":"skills","skills":{"strength":200}},{"type":"skills","skills":{"defense":200}},{"type":"skills","skills":{"dexterity":200}},{"type":"skills","skills":{"agility":200}},{"type":"karma","karma":-90}]'
Faction 'Silhouette': '[{"type":"someCondition","conditions":[{"type":"jobTitle","jobTitle":"Chief Technology Officer"},{"type":"jobTitle","jobTitle":"Chief Financial Officer"},{"type":"jobTitle","jobTitle":"Chief Executive Officer"}]},{"type":"money","money":15000000},{"type":"karma","karma":-22}]'
Faction 'Tetrads': '[{"type":"someCondition","conditions":[{"type":"city","city":"Chongqing"},{"type":"city","city":"New Tokyo"},{"type":"city","city":"Ishima"}]},{"type":"skills","skills":{"strength":75}},{"type":"skills","skills":{"defense":75}},{"type":"skills","skills":{"dexterity":75}},{"type":"skills","skills":{"agility":75}},{"type":"karma","karma":-18}]'
Faction 'Slum Snakes': '[{"type":"skills","skills":{"strength":30}},{"type":"skills","skills":{"defense":30}},{"type":"skills","skills":{"dexterity":30}},{"type":"skills","skills":{"agility":30}},{"type":"money","money":1000000},{"type":"karma","karma":-9}]'
Faction 'Netburners': '[{"type":"skills","skills":{"hacking":80}},{"type":"hacknetRAM","hacknetRAM":8},{"type":"hacknetCores","hacknetCores":4},{"type":"hacknetLevels","hacknetLevels":100}]'
Faction 'Tian Di Hui': '[{"type":"someCondition","conditions":[{"type":"city","city":"Chongqing"},{"type":"city","city":"New Tokyo"},{"type":"city","city":"Ishima"}]},{"type":"skills","skills":{"hacking":50}},{"type":"money","money":1000000}]'
Faction 'CyberSec': '[{"type":"backdoorInstalled","server":"CSEC"}]'
Faction 'Bladeburners': '[{"type":"someCondition","conditions":[{"type":"someCondition","conditions":[{"type":"bitNodeN","bitNodeN":6},{"type":"sourceFile","sourceFile":6}]},{"type":"someCondition","conditions":[{"type":"bitNodeN","bitNodeN":7},{"type":"sourceFile","sourceFile":7}]}]},{"type":"bladeburnerRank","bladeburnerRank":25}]'
Faction 'Church of the Machine God': '[{"type":"someCondition","conditions":[{"type":"bitNodeN","bitNodeN":13},{"type":"sourceFile","sourceFile":13}]},{"type":"numAugmentations","numAugmentations":0},{"type":"location","location":"Church of the Machine God"}]'
Faction 'Shadows of Anarchy': '[{"type":"numInfiltrations","numInfiltrations":1}]'
*/