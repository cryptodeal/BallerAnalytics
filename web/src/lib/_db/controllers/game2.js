import { Game2 } from '$lib/_db/models';
import dayjs from 'dayjs';

const loadGameData = (id) => {
	return Game2.findById(id)
		.populate('home.team visitor.team', 'infoCommon.name')
		.populate('home.players.player visitor.players.player', 'name.full')
		.exec()
		.then((game) => {
			return game.populate('home.players._id visitor.players._id', 'name.full');
		})
		.catch(console.trace);
};

const updateGameData = async (id, updates) => {
	const game = await Game2.findById(id);
	const { home, visitor, homePlayers, visitorPlayers } = updates;
	if (home) game.home.stats = home;
	if (visitor) game.visitor.stats = visitor;
	if (homePlayers) game.home.players = homePlayers;
	if (visitorPlayers) game.visitor.players = visitorPlayers;
	return game.save().catch(console.trace);
};

const loadIncompleteGames = () => {
	return Game2.find({
		date: { $lte: dayjs().subtract(1, 'day') },
		'meta.helpers.bballRef.missingData': true
	})
		.populate('home.team visitor.team', 'seasons.season seasons.infoCommon.abbreviation')
		.exec()
		.catch(console.trace);
};
export { loadGameData, updateGameData, loadIncompleteGames };
