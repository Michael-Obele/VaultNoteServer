import type { PageServerLoad } from './$types';

export const load = (async () => {
	console.log('Connecting to LibSQL database at:', process.env.TURSO_DATABASE_URL);
}) satisfies PageServerLoad;
