import { Player } from '$lib/_db/models';

export function findAllPlayersOg() {
	return Player.find({}).select('name.first name.last name.fullName').lean().exec();
}

export function findPlayerMatch(player) {
	if (player.name.last.split(' ').length > 1) {
		return Player.find({
			$or: [
				{ 'name.first': player.name.first },
				{ 'name.last': player.name.last },
				{ 'name.first': player.name.parsedFirst },
				{ 'name.last': player.name.parsedLast },
				{ 'name.last': player.name.last.split(' ')[0] },
				{ 'name.fullName': { $regex: player.name.parsedFirst, $options: 'i' } },
				{ 'name.fullName': { $regex: player.name.parsedLast, $options: 'i' } }
			]
		})
			.select('meta name.first name.last name.fullName')
			.lean()
			.exec()
			.then((res) => {
				return {
					player,
					matches: res
				};
			});
	} else {
		return Player.find({
			$or: [
				{ 'name.first': player.name.first },
				{ 'name.last': player.name.last },
				{ 'name.first': player.name.parsedFirst },
				{ 'name.last': player.name.parsedLast },
				{ 'name.last': player.name.last.split(' ')[0] },
				{ 'name.fullName': { $regex: player.name.parsedFirst, $options: 'i' } },
				{ 'name.fullName': { $regex: player.name.parsedLast, $options: 'i' } }
			]
		})
			.select('meta name.first name.last name.fullName')
			.lean()
			.exec()
			.then((res) => {
				return {
					player,
					matches: res
				};
			});
	}
}

export function findFullNameMatch(player) {
	return Player.find({
		$or: [
			{ 'name.fullName': player.name.full },
			{ 'name.fullName': { $regex: `${player.name.parsedFirst} ${player.name.parsedLast}` } }
		]
	})
		.select('meta name.first name.last name.fullName')
		.lean()
		.exec()
		.then((res) => {
			return {
				player,
				matches: res
			};
		});
}

export function addBballRefId(nbaId, id) {
	return Player.findById(nbaId)
		.exec()
		.then((player) => {
			player.meta.helpers.bballRef = id;
			return player.save();
		});
}
