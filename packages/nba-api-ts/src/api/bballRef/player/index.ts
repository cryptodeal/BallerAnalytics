import { loadPlayerPage, loadPlayerQuery } from '../fetchers';
import { findByAlpha2 } from 'iso-3166-1-ts';
import type {
	PlayerCareerStatSeason,
	BballRefPlayerQueryResItem,
	PlayerCareerAdvStats
} from '../types';

interface PlayerName {
	display: string;
	pronunciation?: string;
}

interface PlayerSocials {
	twitter?: string;
	instagram?: string;
}

export type PlayerMetaData = {
	height: {
		feet?: number;
		inches?: number;
	};
	weight?: number;
	birthDate?: Date;
	birthPlace?: BirthLocale;
	position?: string;
	shoots?: string;
	name: PlayerName;
	college?: string;
	socials?: PlayerSocials;
};

const findPlayerMeta = ($: cheerio.Root) => {
	const name: PlayerName = {
		display: $('#meta').find("*[itemprop = 'name']").text()
	};
	const height = $("*[itemprop = 'height']").text().trim().split('-');
	const weight = $("*[itemprop = 'weight']").text().trim();
	const birthDate = $("*[itemprop = 'birthDate']").attr('data-birth')?.split('-');
	const birthPlaceData = $("*[itemprop = 'birthPlace']")
		.text()
		.trim()
		.substring(3, $("*[itemprop = 'birthPlace']").text().trim().length)
		.split(',');
	const birthCountry = $('.f-i').text().trim();
	const birthPlace: BirthLocale = {
		city: birthPlaceData[0],
		country: ''
	};
	if (birthCountry !== undefined && findByAlpha2(birthCountry)?.name) {
		const country = findByAlpha2(birthCountry)?.name;
		if (country) birthPlace.country = country;
	}
	if (birthCountry == 'us') birthPlace.state = birthPlaceData[1]?.trim();
	const playerMeta: PlayerMetaData = {
		height: {
			feet: parseInt(height[0]),
			inches: parseInt(height[1])
		},
		weight: parseInt(weight.substring(0, weight.length - 2)),
		birthPlace,
		name
	};
	if (birthDate) {
		playerMeta.birthDate = new Date(
			parseInt(birthDate[0]),
			parseInt(birthDate[1]) - 1,
			parseInt(birthDate[2])
		);
	}

	/**
	 * search for specific info in player meta
	 * add any info to playerMeta object  */

	$(`#meta`).each(function (i, item) {
		$(item)
			.find('p')
			.each(function (i, p) {
				const itemText = $(p).text().trim();
				if (itemText.includes('Pronunciation: '))
					playerMeta.name.pronunciation = itemText.replace(/Pronunciation:/g, '').trim();
				if (itemText.includes('College:'))
					playerMeta.college = itemText.replace(/College:/g, '').trim();
				if (itemText.includes('▪')) {
					const itemSplit = itemText
						.split('▪')
						.map((item) => {
							item.trim();
							return item.split('\n').map((item) => item.trim());
						})
						.flat()
						.filter((i) => i !== '');
					if (itemText.includes('Position:') || itemText.includes('Shoots: ')) {
						if (itemSplit[0].includes('Position:')) {
							playerMeta.position = itemSplit[1];
						} else if (itemSplit[0].includes('Shoots:')) {
							playerMeta.shoots = itemSplit[1];
						}

						if (itemSplit[2].includes('Position:')) {
							playerMeta.position = itemSplit[3];
						} else if (itemSplit[2].includes('Shoots:')) {
							playerMeta.shoots = itemSplit[3];
						}
					} else {
						if (itemSplit.includes('Twitter:') || itemSplit.includes('Instagram')) {
							itemSplit.forEach((item, x) => {
								if (item.includes('Twitter:')) {
									if (playerMeta.socials == undefined) {
										playerMeta.socials = {};
									}
									playerMeta.socials.twitter = itemSplit[x + 1];
								}
								if (item.includes('Instagram:')) {
									if (playerMeta.socials == undefined) {
										playerMeta.socials = {};
									}
									playerMeta.socials.instagram = itemSplit[x + 1];
								}
							});
						}
					}
				}
			});
	});
	return playerMeta;
};

const findPlayerCareerStats = ($: cheerio.Root) => {
	const careerStats: PlayerCareerStatSeason[] = [];
	$('#per_game')
		.find('tbody > tr')
		.each(function (i, row) {
			const seasonStats: PlayerCareerStatSeason = {
				season: parseInt($(row).find('[data-stat=season]').text().trim().split('-')[0]) + 1,
				age: parseInt($(row).find('[data-stat=age]').text().trim()),
				teamAbbrev: $(row).find('[data-stat=team_id]').text().trim(),
				league: $(row).find('[data-stat=lg_id]').text().trim(),
				position: $(row).find('[data-stat=pos]').text().trim(),
				games: parseInt($(row).find('[data-stat=g]').text().trim()),
				gamesStarted: parseInt($(row).find('[data-stat=gs]').text().trim()),
				minPerGame: parseFloat($(row).find('[data-stat=mp_per_g]').text().trim()),
				fgPerGame: parseFloat($(row).find('[data-stat=fg_per_g]').text().trim()),
				fgaPerGame: parseFloat($(row).find('[data-stat=fga_per_g]').text().trim()),
				fgPct: parseFloat($(row).find('[data-stat=fg_pct]').text().trim()),
				fg3PerGame: parseFloat($(row).find('[data-stat=fg3_per_g]').text().trim()),
				fg3aPerGame: parseFloat($(row).find('[data-stat=fg3a_per_g]').text().trim()),
				fg3Pct: parseFloat($(row).find('[data-stat=fg3_pct]').text().trim()),
				fg2PerGame: parseFloat($(row).find('[data-stat=fg2_per_g]').text().trim()),
				fg2aPerGame: parseFloat($(row).find('[data-stat=fg2a_per_g]').text().trim()),
				fg2Pct: parseFloat($(row).find('[data-stat=fg2_pct]').text().trim()),
				efgPct: parseFloat($(row).find('[data-stat=efg_pct]').text().trim()),
				ftPerGame: parseFloat($(row).find('[data-stat=ft_per_g]').text().trim()),
				ftaPerGame: parseFloat($(row).find('[data-stat=fta_per_g]').text().trim()),
				ftPct: parseFloat($(row).find('[data-stat=ft_pct]').text().trim()),
				orbPerGame: parseFloat($(row).find('[data-stat=orb_per_g]').text().trim()),
				drbPerGame: parseFloat($(row).find('[data-stat=drb_per_g]').text().trim()),
				trbPerGame: parseFloat($(row).find('[data-stat=trb_per_g]').text().trim()),
				astPerGame: parseFloat($(row).find('[data-stat=ast_per_g]').text().trim()),
				stlPerGame: parseFloat($(row).find('[data-stat=stl_per_g]').text().trim()),
				blkPerGame: parseFloat($(row).find('[data-stat=blk_per_g]').text().trim()),
				tovPerGame: parseFloat($(row).find('[data-stat=tov_per_g]').text().trim()),
				pfPerGame: parseFloat($(row).find('[data-stat=pf_per_g]').text().trim()),
				ptsPerGame: parseFloat($(row).find('[data-stat=pts_per_g]').text().trim())
			};
			careerStats.push(seasonStats);
		});
	return careerStats;
};

const findPlayerCareerAdvStats = ($: cheerio.Root) => {
	const careerStats: PlayerCareerAdvStats[] = [];
	$('#advanced')
		.find('tbody > tr')
		.each(function (i, row) {
			const seasonStats: PlayerCareerAdvStats = {
				season: parseInt($(row).find('[data-stat=season]').text().trim().split('-')[0]) + 1,
				teamAbbrev: $(row).find('[data-stat=team_id]').text().trim(),
				/* player efficiency rating */
				pEffRat: parseFloat($(row).find('[data-stat=per]').text().trim()),
				/* true shooting percentage */
				tsPct: parseFloat($(row).find('[data-stat=ts_pct]').text().trim()),
				threePtAttRate: parseFloat($(row).find('[data-stat=fg3a_per_fga_pct]').text().trim()),
				ftAttRate: parseFloat($(row).find('[data-stat=fta_per_fga_pct]').text().trim()),
				offRebPct: parseFloat($(row).find('[data-stat=orb_pct]').text().trim()),
				defRebPct: parseFloat($(row).find('[data-stat=drb_pct]').text().trim()),
				totalRebPct: parseFloat($(row).find('[data-stat=trb_pct]').text().trim()),
				assistPct: parseFloat($(row).find('[data-stat=ast_pct]').text().trim()),
				stlPct: parseFloat($(row).find('[data-stat=stl_pct]').text().trim()),
				blkPct: parseFloat($(row).find('[data-stat=blk_pct]').text().trim()),
				tovPct: parseFloat($(row).find('[data-stat=tov_pct]').text().trim()),
				usgPct: parseFloat($(row).find('[data-stat=usg_pct]').text().trim()),
				offWinShares: parseFloat($(row).find('[data-stat=ows]').text().trim()),
				defWinShares: parseFloat($(row).find('[data-stat=dws]').text().trim()),
				winShares: parseFloat($(row).find('[data-stat=ws]').text().trim()),
				winSharesPer48: parseFloat($(row).find('[data-stat=ws_per_48]').text().trim()),
				offBoxPlusMinus: parseFloat($(row).find('[data-stat=obpm]').text().trim()),
				defBoxPlusMinus: parseFloat($(row).find('[data-stat=dbpm]').text().trim()),
				boxPlusMinus: parseFloat($(row).find('[data-stat=bpm]').text().trim()),
				valOverBackup: parseFloat($(row).find('[data-stat=vorp]').text().trim())
			};
			careerStats.push(seasonStats);
		});
	return careerStats;
};

export const getPlayerData = async (playerUrl: string) => {
	const $ = await loadPlayerPage(playerUrl);
	return findPlayerMeta($);
};

export const getPlayerCareerStats = async (playerUrl: string) => {
	const $ = await loadPlayerPage(playerUrl);
	const basic = findPlayerCareerStats($);
	const adv = findPlayerCareerAdvStats($);
	return { basic, adv };
};

const findPlayerQueryRes = ($: cheerio.Root): BballRefPlayerQueryResItem[] => {
	const res: BballRefPlayerQueryResItem[] = [];
	$('#searches')
		.find('.search-item')
		.each(function (i, searchItem) {
			const name = $(searchItem)
				.find('.search-item-name')
				.find('a')
				.first()
				.text()
				.split(' (')[0]
				.trim();

			const playerUrlSplit = $(searchItem).find('.search-item-url').text().trim().split('/');
			const playerUrl = playerUrlSplit[playerUrlSplit.length - 1].split('.')[0];
			const playerResItem: BballRefPlayerQueryResItem = {
				name,
				playerUrl
			};

			res.push(playerResItem);
		});
	return res;
};

export const getPlayerQuery = async (playerName: string): Promise<BballRefPlayerQueryResItem[]> => {
	const $ = await loadPlayerQuery(playerName);
	const isPlayerPage = $("meta[name='generated-by']").attr('content');
	if (isPlayerPage === '/home/bbr/build/players/build_player_page.pl') {
		const name = $('#meta').find("*[itemprop = 'name']").text();
		const playerUrlHref = $("meta[property='og:url']").attr('content')?.split('/');
		if (!playerUrlHref) throw Error(`Could not find playerUrlHref for player ${name}`);
		const playerUrl = playerUrlHref[playerUrlHref.length - 1].split('.')[0];
		const playerQuery: BballRefPlayerQueryResItem[] = [{ name, playerUrl }];
		return playerQuery;
	}
	return findPlayerQueryRes($);
};
