import { findAllPlayersOg, findPlayerMatch, findFullNameMatch } from '$lib/_db/controllers/player';
import { Player2 } from '$lib/_db/models';

export function getNewPlayersBasic() {
	return Player2.find({ 'meta.helpers.nbaPlayerId': null })
		.select('name meta')
		.lean()
		.exec()
		.then((players) => {
			return players.map((p) => {
				let nameSplit = p.name.full.split(' ');
				if (!p.name.first) {
					p.name.first = nameSplit[0];
				}
				if (nameSplit.length > 1) nameSplit.shift();
				if (!p.name.last) {
					p.name.last = nameSplit.join(' ');
				}
				p.name.parsedFirst = p.name.first.normalize('NFD').replace(/\p{Diacritic}/gu, '');
				p.name.parsedLast = p.name.last.normalize('NFD').replace(/\p{Diacritic}/gu, '');
				return p;
			});
		});
}

const formatOgPlayers = () => {
	return findAllPlayersOg().then((playersOg) => {
		return playersOg.map((player) => {
			if (player.name.fullName) {
				let nameSplit = player.name.fullName.split(' ');
				if (!player.name.first) {
					player.name.first = nameSplit[0];
					//console.log(`firstName: ${nameSplit[0]}`)
				}
				if (!player.name.last) {
					nameSplit.shift();
					player.name.last = nameSplit.join(' ');
				}
			} else {
				if (player.name.first && player.name.last) {
					player.name.fullName = `${player.name.first} ${player.name.last}`;
				} else {
					player.missingData = true;
				}
			}
			return player;
		});
	});
};

export function findMatchingPlayers() {
	return getNewPlayersBasic().then((players) => {
		return Promise.all(
			players.map((p) => {
				return findFullNameMatch(p).then((res) => {
					const { matches } = res;
					if (matches.length > 0) {
						return res;
					} else {
						return findPlayerMatch(p);
					}
				});
			})
		);
	});
}

export async function addNbaId(id, nbaId) {
	const exists = await Player2.find({ 'meta.helpers.nbaPlayerId': nbaId });
	if (exists.length) {
		throw `Player with nbaId ${nbaId} already exists`;
	} else {
		return Player2.findById(id)
			.exec()
			.then((player) => {
				player.meta.helpers.nbaPlayerId = nbaId;
				return player.save();
			});
	}
}
