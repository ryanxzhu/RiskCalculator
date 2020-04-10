const display = document.querySelector('#display');
const regBattlesWinner = document.querySelector('#regBattlesWinner');
const capConquestWinner = document.querySelector('#capConquestWinner');
const battleButton = document.querySelector('#battleButton');
const clearButton = document.querySelector('#clearButton');
const headings = document.querySelectorAll('h4');

let battleType = 'normal';
let winPercent = 0;
let averageAttackerTroopsRemaining;
let averageDefenderTroopsRemaining;

let attacker = {
	armySize: 0,
	intention: 'attack',
	diceRoll: [],
	winCount: 0
};

let defender = {
	armySize: 0,
	intention: 'defend',
	diceRoll: [],
	winCount: 0
};

function randomDie() {
	const die = Math.ceil(Math.random() * 6);
	return die;
}

function rollDice(player, numOfDice) {
	for (let i = 0; i < numOfDice; i++) {
		player.diceRoll.push(randomDie());
	}
	player.diceRoll.sort();
	player.diceRoll.reverse();
}

function fightOnce() {
	let attackTroops = numToFight(attacker);
	let defendTroops = numToFight(defender);
	if (attackTroops <= 0 || defendTroops <= 0) {
		return;
	}
	rollDice(attacker, attackTroops);
	rollDice(defender, defendTroops);

	while (attacker.diceRoll.length > 0 && defender.diceRoll.length > 0) {
		if (attacker.diceRoll[0] <= defender.diceRoll[0]) {
			attacker.armySize--;
		} else {
			defender.armySize--;
		}

		// console.log(
		// 	'[' +
		// 		attacker.diceRoll +
		// 		']' +
		// 		' attacker army: ' +
		// 		attacker.armySize +
		// 		'        ' +
		// 		'[' +
		// 		defender.diceRoll +
		// 		']' +
		// 		' defender army: ' +
		// 		defender.armySize
		// );

		attacker.diceRoll.shift();
		defender.diceRoll.shift();
	}
	// console.log('');
	attacker.diceRoll = [];
	defender.diceRoll = [];
}

function numToFight(army) {
	if (army.intention === 'attack') {
		if (army.armySize > 3) {
			return 3;
		} else {
			return army.armySize - 1;
		}
	}

	if (army.intention === 'defend' && battleType === 'normal') {
		if (army.armySize > 1) {
			return 2;
		} else {
			return army.armySize;
		}
	}

	if (army.intention === 'defend' && battleType === 'capConquest') {
		if (army.armySize > 2) {
			return 3;
		} else {
			return army.armySize;
		}
	}
}

function blitz() {
	// console.log('************************************************************');
	while (attacker.armySize > 1 && defender.armySize > 0) {
		fightOnce();
	}

	if (attacker.armySize <= 1) {
		defender.winCount++;
		// console.log('defender won');
		// console.log('defender total wins: ' + defender.winCount, 'attacker total wins: ' + attacker.winCount);
		return 'defender';
	} else if (defender.armySize <= 0) {
		attacker.winCount++;
		// console.log('attacker won');
		// console.log('defender total wins: ' + defender.winCount, 'attacker total wins: ' + attacker.winCount);
		return 'attacker';
	}
}

function runBattle() {
	let attackerArmySize = parseInt(document.querySelector('#attackerStartingArmy').value) || 0;
	let defenderArmySize = parseInt(document.querySelector('#defenderStartingArmy').value) || 0;
	if (attackerArmySize <= 1 || defenderArmySize <= 0) {
		return;
	}

	headings[0].style.display = 'block';
	headings[1].style.display = 'block';

	attacker.armySize = attackerArmySize;
	defender.armySize = defenderArmySize;

	let numberOfRuns = 10000;
	let attackerTally = 0;
	let defenderTally = 0;

	display.innerHTML =
		// 'Attacking starting army: ' +
		// attackerArmySize +
		// '<br>' +
		// 'Defending starting army: ' +
		// defenderArmySize +
		// '<br><br>' +
		'Simulating ' + numberOfRuns.toLocaleString() + ' battles...';

	for (let i = 0; i < numberOfRuns; i++) {
		blitz();
		if (attacker.armySize > 1) {
			attackerTally = attackerTally + attacker.armySize;
		}
		if (defender.armySize > 0) {
			defenderTally = defenderTally + defender.armySize;
		}
		attacker.armySize = attackerArmySize;
		defender.armySize = defenderArmySize;
	}

	averageAttackerTroopsRemaining = Math.round(attackerTally / attacker.winCount) || 1;
	averageDefenderTroopsRemaining = Math.round(defenderTally / defender.winCount) || 0;

	winPercent = attacker.winCount / (attacker.winCount + defender.winCount);
	winPercent = Math.round(winPercent * 10000) / 100;
}

function displayResult(element) {
	element.innerHTML =
		'Attacker win count: ' +
		attacker.winCount +
		'<br>' +
		'Defender win count: ' +
		defender.winCount +
		'<br>' +
		'Attacker win percent: ' +
		winPercent +
		'%' +
		'<br>' +
		'Defender win percent: ' +
		Math.round((100 - winPercent) * 100) / 100 +
		'%' +
		'<br>' +
		'Average attacker troops remaining: ' +
		averageAttackerTroopsRemaining +
		'<br>' +
		'Average defender troops remaining: ' +
		averageDefenderTroopsRemaining;
}

battleButton.addEventListener('mousedown', function() {
	completeSequence();
});

addEventListener('keypress', function(e) {
	if (e.key === 'Enter') {
		completeSequence();
	}
});

function completeSequence() {
	if (
		document.querySelector('#attackerStartingArmy').value === '' ||
		document.querySelector('#defenderStartingArmy').value === ''
	) {
		return;
	}
	runBattle();
	displayResult(regBattlesWinner);

	attacker.winCount = 0;
	defender.winCount = 0;

	battleType = 'capConquest';
	runBattle();
	displayResult(capConquestWinner);

	attacker.winCount = 0;
	defender.winCount = 0;

	battleType = 'normal';

	battleButton.textContent = 'Battle Again';
}

clearButton.addEventListener('mousedown', function() {
	regBattlesWinner.innerHTML = '';
	display.innerHTML = '';
	battleButton.textContent = 'Battle';
	headings[0].style.display = 'none';
	headings[1].style.display = 'none';
});
