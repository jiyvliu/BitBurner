/** @param {NS} ns **/

import { generate_scan } from "generate_scan.js" 

export async function main(ns) {

	const script = "early-hack-template.script"
	const low_level_targets = ["foodnstuff", "sigma-cosmetics", "neo-net", "zer0", "max-hardware", "iron-gym", "phantasy"]

	for (let hostname of ns.getPurchasedServers()) {
		let server_target = low_level_targets[Math.floor(Math.random() * low_level_targets.length)]
		ns.killall(hostname)
		await ns.scp(script, hostname);
		await ns.exec(script, hostname, Math.floor(ns.getServerMaxRam(hostname) / ns.getScriptRam(script)), server_target);
	}	
}