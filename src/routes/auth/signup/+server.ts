import { hash } from '@node-rs/argon2';
import { json, error } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db/prisma';
import { generateUserId, validateUsername, validatePassword } from '$lib/server/utils/auth-helpers';

// @routeDescription: Handles user registration.
// @requestBody:
//   username: string (min 3, max 31 characters, alphanumeric only)
//   password: string (min 6, max 255 characters)
// @responseBody:
//   success:
//     message: string ("Signup successful")
//     sessionToken: string (The generated session token)
//   error:
//     message: string (e.g., "Invalid username", "Username already taken", "An unknown error occurred.")
export async function POST({ request, cookies }) {
	const { username, password } = await request.json();

	if (!validateUsername(username)) {
		throw error(400, new Error('Invalid username (min 3, max 31 characters, alphanumeric only)'));
	}
	if (!validatePassword(password)) {
		throw error(400, new Error('Invalid password (min 6, max 255 characters)'));
	}

	const userId = generateUserId();
	const passwordHash = await hash(password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});

	try {
		await db.user.create({
			data: {
				id: userId,
				username,
				passwordHash,
				age: 0 // Initialize age with a default value
			}
		});

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, userId);
		auth.setSessionTokenCookie(cookies, sessionToken, session.expiresAt);
		return json({ message: 'Signup successful', sessionToken: sessionToken });
	} catch (e: any) {
		console.error('Signup error:', e); // Added logging
		// Check for unique constraint error (e.g., username already exists)
		// Prisma P2002 error code indicates a unique constraint violation
		if (e.code === 'P2002') {
			throw error(409, new Error('Username already taken'));
		}
		throw error(500, new Error('An unknown error occurred. Please check server logs for details.')); // Modified error message
	}
}
