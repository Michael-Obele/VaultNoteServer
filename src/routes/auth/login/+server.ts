import { verify } from '@node-rs/argon2';
import { json, error } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db/prisma';
import { validateUsername, validatePassword } from '$lib/server/utils/auth-helpers';

// @routeDescription: Handles user login and session creation.
// @requestBody:
//   username: string (min 3, max 31 characters, alphanumeric only)
//   password: string (min 6, max 255 characters)
// @responseBody:
//   success:
//     message: string ("Login successful")
//     sessionToken: string (The generated session token)
//   error:
//     message: string (e.g., "Invalid username", "Incorrect username or password")
export async function POST({ request, cookies }) {
	const { username, password } = await request.json();

	if (!validateUsername(username)) {
		throw error(400, new Error('Invalid username (min 3, max 31 characters, alphanumeric only)'));
	}
	if (!validatePassword(password)) {
		throw error(400, new Error('Invalid password (min 6, max 255 characters)'));
	}

	const existingUser = await db.user.findUnique({
		where: { username: username }
	});
	if (!existingUser) {
		throw error(400, new Error('Incorrect username or password'));
	}

	const validPassword = await verify(existingUser.passwordHash, password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
	if (!validPassword) {
		throw error(400, new Error('Incorrect username or password'));
	}

	const sessionToken = auth.generateSessionToken();
	const session = await auth.createSession(sessionToken, existingUser.id);
	auth.setSessionTokenCookie(cookies, sessionToken, session.expiresAt);

	return json({ message: 'Login successful', sessionToken: sessionToken });
}
