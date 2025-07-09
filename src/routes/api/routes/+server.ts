// @routeDescription: Provides a list of all server routes and their descriptions.
import { json } from '@sveltejs/kit';
import { scanRoutes } from '$lib/server/utils/route-scanner';

export async function GET() {
	const routes = await scanRoutes('src/routes');
	return json(routes); // The `scanRoutes` function now returns an array of objects
}
