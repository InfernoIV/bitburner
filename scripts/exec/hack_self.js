/** @param {NS} ns */
export async function main(ns) {
  // @ignore-infinite
  while(true){
    //if there is any security
    if (ns.getServerSecurityLevel() > 1) {
      //weaken
      await ns.weaken()
      //if there is less available then max
    } else if (ns.getServerMoneyAvailable() < ns.getServerMaxMoney()){
      //grow
      await ns.grow()
    //if security is min, and money is max:
    } else {
      //hack
      await ns.hack()
    }
  }
}
