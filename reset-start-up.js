/** @param {NS} ns **/
export async function main(ns) {
	resetAll(ns, "home", null)
}

const resetAll = (ns, serv, parent) => {
	let children = ns.scan(serv)

	if (parent && children.includes(parent)) {
		children.splice(children.indexOf(parent), 1)
	}
	
	if (children.length > 0) {
		for (let child of children) {
			resetAll(ns, child, serv)
		}
	}
	ns.killall(serv)
}