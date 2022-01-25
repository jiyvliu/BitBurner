/** How much the security level of a server gets decreased by a weaken() call */
const weakenSecurityEffect = 0.05;
/** How much the security level of a server gets increased by a grow() call */
const growSecurityEffect = 0.004;
/** How much the security level of a server gets increased by an hack() call */
const hackSecurityEffect = 0.002;

/** Script to execute an hack() call after a specified cooldown */
const hackScript = { "filename": "hack.js", "ram": 1.7 };
/** Script to execute a grow() call after a specified cooldown */
const growScript = { "filename": "grow.js", "ram": 1.75 };
/** Script to execute a weaken() call after a specified cooldown */
const weakenScript = { "filename": "weaken.js", "ram": 1.75 };

/**
 * Gets the amount of free ram for the server.
 * 
 * @params {NS} ns - the Netscript environment
 * @param {string} server - the hostname of the server
 */

const getFreeRam = (ns, server) => {
	return (ns.getServerMaxRam(server) - ns.getServerUsedRam(server));
}

const prime = async (ns, target, assigned_servers) => {
	// weaken to minimum
	while (ns.getServerMinSecurityLevel(target) < ns.getServerSecurityLevel(target)) {

		let weaken_time = ns.getWeakenTime(target)
		for (let serv of assigned_servers) {
			ns.exec(weakenScript.filename,
				serv,
				Math.floor(getFreeRam(ns, serv) / weakenScript.ram),
				target, 0)
		}
		await ns.sleep(weaken_time + 1000)
	}

	// grow and weaken
	while (ns.getServerMaxMoney(target) + ns.growthAnalyze(target, 1) > ns.getServerMoneyAvailable(target)) {

		let grow_time = ns.getGrowTime(target)
		let weaken_time = ns.getWeakenTime(target)
		/*
		1) ram_usage = grow_threads * grow_script + weaken_threads * weaken_script
		2) grow_threads * grow_security_effect = weaken_threads * weaken_security_effect
		=> ram_usage = 23.575 * weaken_threads = 1.886 * growth_threads (round up to 1.9)
		*/
		for (let serv of assigned_servers) {
			let grow_threads = Math.floor(getFreeRam(ns, serv) / 1.9)
			let weaken_threads = Math.ceil(grow_threads * growSecurityEffect / weakenSecurityEffect)

			ns.exec(growScript.filename, serv, grow_threads, target, 0)
			ns.exec(weakenScript.filename, serv, weaken_threads, target, 0)
		}
		await ns.sleep(Math.max(grow_time, weaken_time) + 1000)
	}
}

/** @param {NS} ns **/
export async function main(ns) {
	const target = ns.args[0]
	const assigned_servers = ns.args.slice(1)

	await prime(ns, target, assigned_servers)

	// calculate 200% grow percent
	const grow_threads = Math.ceil(ns.growthAnalyze(target, 2))
	const weaken_after_grow = Math.ceil(ns.growthAnalyzeSecurity(grow_threads) / hackSecurityEffect)
	// hack 50% money
	const hack_threads = Math.floor(ns.hackAnalyzeThreads(target, ns.getServerMaxMoney(target) / 2))
	const weaken_after_hack = Math.ceil(ns.hackAnalyzeSecurity(hack_threads) / hackSecurityEffect)
	const ram_usage = grow_threads * growScript.ram
					+ hack_threads * hackScript.ram
					+ (weaken_after_grow + weaken_after_hack) * weakenScript.ram

	let iteration = 0

	while (true) {
		for (let serv of assigned_servers) {
			if (getFreeRam(ns, serv) >= ram_usage) {
				const max_time = Math.max(ns.getGrowTime(target), ns.getHackTime(target), ns.getWeakenTime(target))

				ns.exec(hackScript.filename, serv, hack_threads,
					target, max_time - ns.getHackTime(target), iteration)

				ns.exec(weakenScript.filename, serv, weaken_after_hack,
					target, max_time - ns.getWeakenTime(target) + 200, iteration)

				ns.exec(growScript.filename, serv, grow_threads,
					target, max_time - ns.getGrowTime(target) + 400, iteration)

				ns.exec(weakenScript.filename, serv, weaken_after_grow,
					target, max_time - ns.getWeakenTime(target) + 600, iteration)

				await ns.sleep(800)
			}
			iteration++
		}
	}
}