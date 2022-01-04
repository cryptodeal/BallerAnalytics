import { loadPlayerRoster } from '../fetchers';
import { findByAlpha2 } from 'iso-3166-1-ts';
import type { BBRefTeamRosterItem } from '../types';

const findTeamRoster = ($: cheerio.Root): BBRefTeamRosterItem[] => {
	const rosterData: BBRefTeamRosterItem[] = [];
	const rosterBody = $(`#roster`).first().find('tbody').first();
	rosterBody.find('tr').each(function (i, row) {
		const number = $(row).find('[data-stat=number]').first().text().trim();
		const playerHref = $(row)
			.find('[data-stat=player]')
			.first()
			.find('a')
			.first()
			.attr('href')
			?.split('/');
		if (!playerHref) {
			throw new Error(
				`Error: no playerUrl found for ${$(row).find('[data-stat=player]').first().text().trim()}`
			);
		}

		const twoWayDat = $(row).find('[data-stat=player]').first().find('small').first().text().trim();
		const twoWay = twoWayDat === '(TW)' ? true : false;
		const playerUrl = playerHref[playerHref.length - 1].split('.')[0];
		const position = $(row).find('[data-stat=pos]').first().text().trim();
		const [feet, inches] = $(row).find('[data-stat=height]').first().text().trim().split('-');
		const weight = $(row).find('[data-stat=weight]').first().text().trim();
		const birthDateStr = $(row).find('[data-stat=birth_date]').first().attr('csk')?.trim();
		if (!birthDateStr || birthDateStr === '')
			throw new Error(`Error: no birthDate found for ${playerUrl}`);
		const year = parseInt(birthDateStr.substring(0, 4));
		const month = parseInt(birthDateStr.substring(4, 6)) - 1;
		const date = parseInt(birthDateStr.substring(6, 8));
		const birthCountryStr = $(row).find('.f-i').first().text().trim();
		const birthCountry = findByAlpha2(birthCountryStr)?.name;
		const exp = $(row).find('[data-stat=years_experience]').first().text().trim();
		const college = $(row).find('[data-stat=college]').first().text().trim();

		const playerItem: BBRefTeamRosterItem = {
			number,
			playerUrl,
			position,
			height: {
				feet: parseInt(feet),
				inches: parseInt(inches)
			},
			weight: parseInt(weight),
			birthDate: new Date(year, month, date),
			birthCountry,
			exp,
			college,
			twoWay
		};
		rosterData.push(playerItem);
	});
	return rosterData;
};

export const getTeamRoster = async (teamAbbrev: string, year: number) => {
	const $ = await loadPlayerRoster(teamAbbrev, year);
	return findTeamRoster($);
};
