// @routeDescription: Provides a list of all server routes and their descriptions.
import { json } from '@sveltejs/kit';
import generatedRoutes from '$lib/generated-routes.json';

export async function GET() {
	return json(generatedRoutes);
}
