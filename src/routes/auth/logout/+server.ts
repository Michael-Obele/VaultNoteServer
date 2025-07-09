import { json, error } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';

// @routeDescription: Handles user logout and session invalidation.
// @requestBody:
//   sessionToken: string (Optional. The session token to invalidate. If not provided, will attempt to invalidate based on cookie.)
// @responseBody:
//   success:
//     message: string ("Logout successful")
//   error:
//     message: string (e.g., "No active session or session token provided")
export async function POST({ request, cookies }) {
	const { sessionToken: requestSessionToken } = await request.json();

	// Prioritize session token from the request body if provided
	const sessionToken = requestSessionToken || cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		throw error(400, 'No active session or session token provided');
	}

	const { session } = await auth.validateSessionToken(sessionToken);

	if (session) {
		await auth.invalidateSession(session.id);
	} else {
		// If session is not found, it might be expired or invalid, still clear the cookie
		console.log('No valid session found for token, clearing cookie.');
	}

	auth.deleteSessionTokenCookie(cookies); // Always clear the cookie on logout attempt

	return json({ message: 'Logout successful' });
}
