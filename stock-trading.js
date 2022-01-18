/** @type import(".").NS */
//Requires access to the TIX API and the 4S Mkt Data API

const fracL = 0.1; //Fraction of assets to keep as cash in hand
const fracH = 0.2;

const commission = 100000; //Buy or sell commission
const numCycles = 2; //Each cycle is 5 seconds

function refresh(ns, stocks, myStocks) {
	let corpus = ns.getServerMoneyAvailable("home");
	myStocks.length = 0;
	for (let i = 0; i < stocks.length; i++) {
		let sym = stocks[i].sym;
		stocks[i].price = ns.stock.getPrice(sym);
		stocks[i].shares = ns.stock.getPosition(sym)[0];
		stocks[i].buyPrice = ns.stock.getPosition(sym)[1];
		stocks[i].vol = ns.stock.getVolatility(sym);
		stocks[i].prob = 2 * (ns.stock.getForecast(sym) - 0.5);
		stocks[i].maxShares = Math.min(ns.stock.getMaxShares(sym), Math.floor(corpus / stocks[i].price))

		// expected return
		// volatiliy * probability * max shares buyable * price
		stocks[i].expRet = stocks[i].vol * (stocks[i].prob / 2) //* stocks[i].maxShares * stocks[i].price;
		
		corpus += stocks[i].price * stocks[i].shares;

		if (stocks[i].shares > 0)
			myStocks.push(stocks[i]);
	}

	stocks.sort(function (a, b) { return b.expRet - a.expRet });
	return corpus;
}

function buy(ns, stock, numShares) {
	ns.stock.buy(stock.sym, numShares);
	ns.print(`Bought ${stock.sym} for ${format(numShares * stock.price)}`);
}

function sell(ns, stock, numShares) {
	let profit = numShares * (stock.price - stock.buyPrice) - 2 * commission;
	ns.print(`Sold ${stock.sym} for ${(Math.sign(profit) < 0)? "loss" : "profit"} of ${format(profit)}`);
	ns.stock.sell(stock.sym, numShares);
}

function format(num) {
	let symbols = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc"];
	let num_abs = Math.abs(num)
	let i = 0;
	for (; (num_abs >= 1000) && (i < symbols.length); i++)
		num_abs /= 1000;
	return ((Math.sign(num) < 0) ? "-$" : "$") + num_abs.toFixed(3) + symbols[i];
}

export async function main(ns) {

	//Initialise
	ns.disableLog("ALL");
	let stocks = [];
	let myStocks = [];
	let corpus = 0;
	for (let i = 0; i < ns.stock.getSymbols().length; i++)
		stocks.push({ sym: ns.stock.getSymbols()[i] });

	while (true) {
		corpus = refresh(ns, stocks, myStocks);
		//Sell underperforming shares
		for (let i = 0; i < myStocks.length; i++) {
			if (stocks[0].expRet > myStocks[i].expRet) {
				sell(ns, myStocks[i], myStocks[i].shares);
				corpus -= commission;
			}
		}

		//Sell shares if not enough cash in hand
		for (let i = 0; i < myStocks.length; i++) {
			if (ns.getServerMoneyAvailable("home") < (fracL * corpus)) {
				let cashNeeded = (corpus * fracH - ns.getServerMoneyAvailable("home") + commission);
				let numShares = Math.floor(cashNeeded / myStocks[i].price);
				sell(ns, myStocks[i], numShares);
				corpus -= commission;
			}
		}

		//Buy shares with cash remaining in hand
		let cashToSpend = ns.getServerMoneyAvailable("home") - (fracH * corpus);
		
		// can't buy more stocks than available
		const numShares = ns.stock.getMaxShares(stocks[0].sym) * stocks[0].price <= cashToSpend || ns.stock.getMaxShares(stocks[0].sym) <= stocks[0].shares
			? ns.stock.getMaxShares(stocks[0].sym) - stocks[0].shares
			: Math.max(Math.floor((cashToSpend - commission) / stocks[0].price))

		if ((numShares * stocks[0].expRet * stocks[0].price * numCycles) > commission)
			buy(ns, stocks[0], numShares);
		await ns.sleep(5 * 1000 * numCycles + 200);
	}
}