/** @param {NS} ns **/
export async function main(ns) {

  ns.disableLog('ALL')
  // push test

  // hacking script
  const script = "early-hack-template.script";
  const ram_usage = ns.getScriptRam(script);

  // servers that need no ports
  const servers0Port = ["n00dles", "sigma-cosmetics", "joesguns", "nectar-net", "hong-fang-tea", "harakiri-sushi", "foodnstuff"];

  // servers that need 1 port
  const servers1Port = ["neo-net", "zer0", "max-hardware", "iron-gym", "CSEC"];

  // servers that need 2 ports
  const servers2Port = ["phantasy", "omega-net", "silver-helix"]

  // servers that need deep scan 1
  const servers1Deep = ["avmnite-02h", "the-hub"]

  // servers that need 3 ports
  const servers3Port = ["netlink", "summit-uni", "catalyst", "I.I.I.I", "rothman-uni"]

  // servers that need deep scan 2
  const servers2Deep = ["rho-construction", "millenium-fitness"]

  const servers4Port = ["alpha-ent", "aevum-police", "lexo-corp", "unitalife", "univ-energy", "global-pharm"]

  const servers5Port = ["omnia", "microdyne", "helios", "titan-labs", "fulcrumtech", "blade",
    "powerhouse-fitness", "vitalife", "omnitek", "zb-institute", "solaris"]

  const hackServer = (serv) => {
    let ports_opened = 0
    if (ns.fileExists("BruteSSH.exe")) {
      ns.brutessh(serv)
      ports_opened++
    }
    if (ns.fileExists("FTPCrack.exe")) {
      ns.ftpcrack(serv)
      ports_opened++
    }
    if (ns.fileExists("relaySMTP.exe")) {
      ns.relaysmtp(serv)
      ports_opened++
    }
    if (ns.fileExists("HTTPWorm.exe")) {
      ns.httpworm(serv)
      ports_opened++
    }
    if (ns.fileExists("SQLInject.exe")) {
      ns.sqlinject(serv)
      ports_opened++
    }
    if (ports_opened >= ns.getServerNumPortsRequired(serv)) {
      ns.nuke(serv)
    }
  }

  // hacks all servers that are children of parameter serv
  const hackAll = (serv, parent) => {
    let children = ns.scan(serv)

    if (parent && children.includes(parent)) {
      children.splice(children.indexOf(parent), 1)
    }

    // servers that have ram + need 5 ports

    if (ns.getServerNumPortsRequired(serv) == 5 && ns.getServerMaxRam(serv) > 0) {
      ns.print(serv)
    }


    hackServer(serv)
    if (children.length > 0) {
      for (let child of children) {
        hackAll(child, serv)
      }
    }
  }

  // kill all scripts with name script on servers
  const all_servers = servers0Port
    .concat(servers1Port)
    .concat(servers2Port)
    .concat(servers1Deep)
    .concat(servers3Port)
    .concat(servers2Deep)
    .concat(servers4Port)
  for (let serv of all_servers) {
    ns.scriptKill(script, serv);
  }

  // Copy our scripts onto each server that requires 0 ports
  // to gain root access. Then use nuke() to gain admin access and
  // run the scripts.

  for (let serv of servers0Port) {
    hackServer(serv)
    await ns.scp(script, serv)
    ns.exec(script, serv, Math.floor(ns.getServerMaxRam(serv) / ram_usage), "n00dles")
  }

  // Wait until we acquire the "BruteSSH.exe" program
  while (!ns.fileExists("BruteSSH.exe")) {
    await sleep(60000);
  }

  for (let serv of servers1Port) {
    hackServer(serv)
    await ns.scp(script, serv)
    ns.exec(script, serv, Math.floor(ns.getServerMaxRam(serv) / ram_usage), "joesguns")
  }

  while (!ns.fileExists("FTPCrack.exe")) {
    await sleep(60000);
  }

  for (let serv of servers2Port) {
    hackServer(serv)
    await ns.scp(script, serv)
    ns.exec(script, serv, Math.floor(ns.getServerMaxRam(serv) / ram_usage), "nectar-net")
  }

  while (!ns.fileExists("DeepscanV1.exe")) {
    await sleep(60000);
  }

  for (let serv of servers1Deep) {
    hackServer(serv)
    await ns.scp(script, serv)
    ns.exec(script, serv, Math.floor(ns.getServerMaxRam(serv) / ram_usage), "nectar-net")
  }

  while (!ns.fileExists("relaySMTP.exe")) {
    await sleep(60000);
  }

  for (let serv of servers3Port) {
    hackServer(serv)
    await ns.scp(script, serv)
    ns.exec(script, serv, Math.floor(ns.getServerMaxRam(serv) / ram_usage), "hong-fang-tea")
  }

  while (!ns.fileExists("DeepscanV2.exe")) {
    await sleep(60000)
  }

  for (let serv of servers2Deep) {
    hackServer(serv)
    await ns.scp(script, serv)
    ns.exec(script, serv, Math.floor(ns.getServerMaxRam(serv) / ram_usage), "hong-fang-tea")
  }

  while (!ns.fileExists("HTTPWorm.exe")) {
    await sleep(60000)
  }

  for (let serv of servers4Port) {
    hackServer(serv)
    await ns.scp(script, serv)
    ns.exec(script, serv, Math.floor(ns.getServerMaxRam(serv) / ram_usage), "harakiri-sushi")
  }

  hackAll("home", null)
  for (let serv of servers5Port) {
    await ns.scp(script, serv)
    ns.exec(script, serv, Math.floor(ns.getServerMaxRam(serv) / ram_usage), "harakiri-sushi")
  }
}