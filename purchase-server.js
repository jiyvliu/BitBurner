/** @param {NS} ns **/

import { generate_scan } from "generate_scan.js" 

export async function main(ns) {
	// logging disables
	ns.disableLog('sleep')
	ns.disableLog('getServerMoneyAvailable')
	
	let ram_target = ns.args[0]
	const server_tree = await generate_scan(ns)
	const script = "early-hack-template.script"

	while(ram_target <= ns.getPurchasedServerMaxRam()) {
		let target = server_tree.findHighestHackableChild()[0]
		
		for (let i = 0; i < ns.getPurchasedServerLimit(); i++) {

			// wait until there's enough money to buy a server
			while (ns.getServerMoneyAvailable('home') / 10 < ns.getPurchasedServerCost(ram_target)) {
				await ns.sleep('1000')
			}

			const server_name = "pserv" + i

			// first set of servers
			if (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
				let hostname = ns.purchaseServer(server_name, ram_target);
				await ns.scp(script, hostname);
				await ns.exec(script, hostname, Math.floor(ram_target / ns.getScriptRam(script)), target);

			// skip if server ram already equals ram goal
			} else if (ns.getServerMaxRam(server_name) >= ram_target) {
				continue	
							
			// already have full servers
			} else {
				ns.killall(server_name)
				ns.deleteServer(server_name)
				let hostname = ns.purchaseServer(server_name, ram_target);
				await ns.scp(script, hostname);
				await ns.exec(script, hostname, Math.floor(ram_target / ns.getScriptRam(script)), target);
			}
		}		
		ram_target *= 2 // double size of next set of servers
	}
}