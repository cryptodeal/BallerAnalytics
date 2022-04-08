import fetch from 'cross-fetch';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { Player2Document } from '../../../db/interfaces/mongoose.gen';
import config from '../../../config';

const fileBasePath = `players/headshots/`;

const s3 = new S3Client({
	region: 'us-east-1',
	credentials: { accessKeyId: config.S3_ACCESS_KEY, secretAccessKey: config.S3_SECRET }
});

const avifOptions = {
	quality: 75,
	speed: 9
};

const pngOptions = {
	compressionLevel: 8,
	force: true
};

const webpOptions = {
	quality: 75,
	lossless: false,
	force: true,
	reductionEffort: 6
};

//260px, 520px, 1040px
const getPlayerImage = async (playerId: string) => {
	return fetch(
		`https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/1040x760/${playerId}.png`
	).then((res) => {
		if (res.status === 200) return res.arrayBuffer();
		throw new Error('Image does not exist');
	});
};

const uploadImage = async (Body: Buffer, Key: string) => {
	return s3
		.send(
			new PutObjectCommand({
				Bucket: config.S3_BUCKET,
				Body,
				Key
			})
		)
		.then(() => {
			return Key;
		});
};
const createPng = async (image: sharp.Sharp, slug: string, size: number) => {
	const Body = await image
		.resize({ width: size, withoutEnlargement: true })
		.png(pngOptions)
		.toBuffer();
	const Key = `${fileBasePath}${slug}-${size}.png`;
	return uploadImage(Body, Key);
};

const createWebp = async (image: sharp.Sharp, slug: string, size: number) => {
	const Body = await image
		.resize({ width: size, withoutEnlargement: true })
		.webp(webpOptions)
		.toBuffer();
	const Key = `${fileBasePath}${slug}-${size}.webp`;
	return uploadImage(Body, Key);
};

const createAvif = async (image: sharp.Sharp, slug: string, size: number) => {
	const Body = await image
		.resize({ width: size, withoutEnlargement: true })
		.avif(avifOptions)
		.toBuffer();
	const Key = `${fileBasePath}${slug}-${size}.avif`;
	return uploadImage(Body, Key);
};

const transformImage = async (image: ArrayBuffer, slug: string) => {
	const imageUrl: string[] = [];
	const sizes = [1040, 520, 260];
	const sharpInitImg = sharp(Buffer.from(image));

	for (let i = 0; i < sizes.length; i++) {
		await createPng(sharpInitImg, slug, sizes[i]).then((result) => {
			if (result) imageUrl.push(result);
		});

		await createWebp(sharpInitImg, slug, sizes[i]).then((result) => {
			if (result) imageUrl.push(result);
		});

		await createAvif(sharpInitImg, slug, sizes[i]).then((result) => {
			if (result) imageUrl.push(result);
		});
	}
	return imageUrl;
};

export const storePlayerImage = (player: Player2Document) => {
	if (player.meta.helpers.nbaPlayerId) {
		return getPlayerImage(`${player.meta.helpers.nbaPlayerId}`).then((image) => {
			if (image) {
				return transformImage(image, player.meta.slug).then((images) => {
					images
						.filter((i) => i.includes('.avif'))
						.map((i) => player.meta.images.headshot.avif.addToSet(i));

					images
						.filter((i) => i.includes('.webp'))
						.map((i) => player.meta.images.headshot.webp.addToSet(i));

					images
						.filter((i) => i.includes('.png'))
						.map((i) => player.meta.images.headshot.png.addToSet(i));

					return player.save();
				});
			}
		});
	}
};
