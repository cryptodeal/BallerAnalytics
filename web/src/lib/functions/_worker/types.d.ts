export type AssetLoaderData = {
	paths: string | string[];
};

export type AssetLoaderEvent = {
	data: AssetLoaderData;
};

export type AssetLoaderMessage = {
	data: ArrayBuffer;
};
