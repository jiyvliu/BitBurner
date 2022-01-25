/** @param {NS} ns **/

import { generate_scan } from "generate_scan.js" 

const script = "late-game-hack.js"
const multiScript = "late-game-hack-multiple-server.js"
const hackScript = "hack.js"
const growScript = "grow.js"
const weakenScript = "weaken.js"

export async function main(ns) {

	if (ns.args[0] == "single") {
		await singleServerDistribute(ns)
	} else if (ns.args[1] == "multiple"){
		await multiServerDistribute(ns)
	} else {
		ns.tprint("choose single or multiple!")
	}
}

// same as single server except 5 purchased servers attack 1 target
const multiServerDistribute = async (ns) => {
	const host = ns.getHostname()
	const server_tree = await generate_scan(ns)
	const servers_list = server_tree.highestHackableServers()

	const purchasedServers = ns.getPurchasedServers()
	for (let i = 0; i < purchasedServers.length; i += 5) {

		for (let j = i; j < i + 5; j++) {
			ns.killall(purchasedServers[j])
			
			await ns.scp(hackScript, purchasedServers[j])
			await ns.scp(growScript, purchasedServers[j])
			await ns.scp(weakenScript, purchasedServers[j])
		}
		ns.exec(multiScript, host, 1, 
				servers_list[i / 5].hostname, ...purchasedServers.slice(i, i+5))
	}
}

const singleServerDistribute = async (ns) => {
	const server_tree = await generate_scan(ns)
	const servers_list = server_tree.highestHackableServers()

	let server_count = 0
	for (let serv of ns.getPurchasedServers()) {
		
		ns.killall(serv)

		await ns.scp(script, serv)
		await ns.scp(hackScript, serv)
		await ns.scp(growScript, serv)
		await ns.scp(weakenScript, serv)

		ns.exec(script, serv, 1, servers_list[server_count].hostname)

		server_count++
	}
}