/** @param {NS} ns **/
export async function generate_scan(ns) {

	ns.disableLog("getHackingLevel")

	class Server {
		constructor(name, parent) {
			this.name = name;
			this.parent = parent;
			this.ports = ns.getServerNumPortsRequired(name);
			this.hacking_level = ns.getServerRequiredHackingLevel(name);
			this.scanChildServers()
		}

		scanChildServers() {
			let children = ns.scan(this.name);

			// remove parent from scan
			if (this.parent) children.splice(children.indexOf(this.parent), 1)

			this.children = []
			for (let child of children) {
				// ignore extra bought servers
				if (!child.includes('pserv')) {
					ns.print(child)
					this.children.push(new Server(child, this.name))
				}
			}
			return
		}
		
		// returns [{"hostname": name, "level": hacking_level, "max_money": server_max_money}, ... ]
		// sorted by server.max_money
		highestHackableServers() {
			let levels = []
			if (this.children.length > 0) {
				for (let child of this.children) {
					levels = levels.concat(child.highestHackableServers())
				}
			}

			// nitesec csec blackhand have no money
			if (['CSEC', 'avmnite-o2h', 'I.I.I.I', 'The-Cave'].includes(this.name)) {
				return levels.sort((a, b) => (b.max_money - a.max_money))
			// within hacking level
			} else if (ns.getHackingLevel() >= this.hacking_level && ns.hasRootAccess(this.name)) {
				levels.push({ "hostname": this.name, "level": this.hacking_level, "max_money": ns.getServerMaxMoney(this.name) })
				return levels.sort((a, b) => (b.max_money - a.max_money))
			} else {
				return levels.sort((a, b) => (b.max_money - a.max_money))
			}
		}

		// returns [server_name, hacking_level]
		findHighestHackableChild() {

			// base cases
			if (this.children.length == 0) {
				// nitesec csec blackhand have no money
				if (['CSEC', 'avmnite-o2h', 'I.I.I.I', 'The-Cave'].includes(this.name)) {
					return [this.name, -1]
					// within hacking level
				} else if (ns.getHackingLevel() >= this.hacking_level && ns.hasRootAccess(this.name)) {
					return [this.name, this.hacking_level]
					// too high hacking level
				} else {
					return [this.name, -1]
				}
				// recursive case
			} else {
				let hacking_levels = this.children.map(child => child.findHighestHackableChild())

				// nitesec csec blackhand have no money
				if (['CSEC', 'avmnite-o2h', 'I.I.I.I'].includes(this.name)) {
					hacking_levels.push([this.name, -1])
					// add current server hacking level to list
				} else if (ns.getHackingLevel() >= this.hacking_level && ns.hasRootAccess(this.name)) {
					hacking_levels.push([this.name, this.hacking_level])
				} else {
					hacking_levels.push([this.name, -1])
				}

				// get only levels
				const levels = hacking_levels.map(child => child[1])
				const highest_level = Math.max(...levels)
				// filter out servers that doesn't have highest hacking level
				const highest_child = hacking_levels.filter(child => child[1] === highest_level)[0]

				return highest_child
			}
		}
	}

	return new Server("home", null)
}