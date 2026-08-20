import { SERVER, TOOLS, HANDLE, SCRIPT, FILE_EXTENSION, AUGMENT, FACTION } from "scripts/constants.js"
export { SERVER, TOOLS, HANDLE, SCRIPT, FILE_EXTENSION, AUGMENT, FACTION }

//gym per city
export const GYMS = {
    "Sector-12": "Powerhouse Gym", //or "Iron Gym"?
    "Aevum": "Crush Fitness Gym", //or "Snap Fitness Gym"?
    "Volhaven": "Millenium Fitness Gym",
}

//university per city
export const UNIVERSITIES = {
    "Sector-12": "Rothman University",
    "Aevum": "Summit University",
    "Volhaven": "ZB Institute of Technology",
}

//different work types
export const WORK_TYPE = {
    FACTION: "FACTION",
    COMPANY: "COMPANY",
    CRIME: "CRIME",
    CREATE_PROGRAM: "CREATE_PROGRAM",
    STUDY: "CLASS",
    GRAFTING: "GRAFTING",
}

//faction name, company name, server name
export const COMPANY_FACTIONS = {
    //jobStatReqOffset: 224            
    "Blade Industries": {
        company: "Blade Industries",
        hostname: "blade"
    }, //exp & money multiplier: 2.75      hacking: 900 <-> 1200 (5 ports) 
    "Bachman & Associates": {
        company: "Bachman & Associates",
        hostname: "b-and-a"
    }, //exp & money multiplier: 2.6       hacking: 900 <-> 1150 (5 ports)     
    "Four Sigma": {
        company: "Four Sigma",
        hostname: "4sigma"
    }, //exp & money multiplier: 2.5       hacking: 900 <-> 1250 (5 ports)
    "OmniTek Incorporated": {
        company: "OmniTek Incorporated",
        hostname: "omnitek"
    }, //exp & money multiplier: 2.25      hacking: 900 <-> 1100 (5 ports)
    "Clarke Incorporated": {
        company: "Clarke Incorporated",
        hostname: "clarkinc"
    }, //exp & money multiplier: 2.25      hacking: 950 <-> 1250 (5 ports)
    "Fulcrum Secret Technologies": {
        company: "Fulcrum Technologies",
        hostname: "fulcrumtech"
    }, //exp & money multiplier: 2         hacking: 950 <-> 1250 (5 ports)
    "KuaiGong International": {
        company: "KuaiGong International",
        hostname: "kuai-gong"
    }, //exp & money multiplier: 2         hacking: 950 <-> 1300 (5 ports)
    //jobStatReqOffset: 249
    "NWO": {
        company: "NWO",
        hostname: "nwo"
    }, //exp & money multiplier: 2.75      hacking: 950 <-> 1300 (5 ports)  
    "ECorp": {
        company: "ECorp",
        hostname: "ecorp"
    }, //exp & money multiplier: 3         hacking: 1050 <-> 1400 (5 ports)
    "MegaCorp": {
        company: "MegaCorp",
        hostname: "megacorp"
    }, //exp & money multiplier: 3         hacking: 1100 <-> 1350 (5 ports)
}
