/** @param {NS} ns **/

import { generate_scan } from "generate_scan.js" 

export async function main(ns) {

	const script = "early-hack-template.script"
	const server_tree = await generate_scan(ns)
	const server_target = server_tree.findHighestHackableChild()[0]

	for (let hostname of ns.getPurchasedServers()) {
		ns.killall(hostname)
		await ns.scp(script, hostname);
		await ns.exec(script, hostname, Math.floor(ns.getServerMaxRam(hostname) / ns.getScriptRam(script)), server_target);
	}	
}