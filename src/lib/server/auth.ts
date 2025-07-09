import type { RequestEvent, Cookies } from '@sveltejs/kit';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db/prisma';
import type { User, Session } from '@prisma/client';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(token: string, userId: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session = await db.session.create({
		data: {
			id: sessionId,
			userId,
			expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
		}
	});
	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session = await db.session.findUnique({
		where: { id: sessionId },
		include: { user: true }
	});

	if (!session) {
		return { session: null, user: null };
	}

	const user = session.user;

	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		await db.session.delete({ where: { id: session.id } });
		return { session: null, user: null };
	}

	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		await db.session.update({
			where: { id: session.id },
			data: { expiresAt: new Date(Date.now() + DAY_IN_MS * 30) }
		});
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30); // Update the session object in memory
	}

	return { session, user };
}

export type SessionValidationResult = {
	session: Session | null;
	user: User | null;
};

export async function invalidateSession(sessionId: string) {
	await db.session.delete({ where: { id: sessionId } });
}

export function setSessionTokenCookie(cookies: Cookies, token: string, expiresAt: Date) {
	cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/'
	});
}

export function deleteSessionTokenCookie(cookies: Cookies) {
	cookies.delete(sessionCookieName, {
		path: '/'
	});
}
