// import type { Handle } from '@sveltejs/kit';
// import * as auth from '$lib/server/auth';

// const handleAuth: Handle = async ({ event, resolve }) => {
// 	const sessionToken = event.cookies.get(auth.sessionCookieName);

// 	if (!sessionToken) {
// 		event.locals.user = null;
// 		event.locals.session = null;
// 		return resolve(event);
// 	}

// 	const { session, user } = await auth.validateSessionToken(sessionToken);

// 	if (session) {
// 		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
// 	} else {
// 		auth.deleteSessionTokenCookie(event);
// 	}

// 	event.locals.user = user;
// 	event.locals.session = session;
// 	return resolve(event);
// };

// export const handle: Handle = handleAuth;

// .../src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.request.method === 'OPTIONS') {
		return new Response(null, {
			headers: {
				'Access-Control-Allow-Origin': '*', // Allow all origins
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type'
			}
		});
	}

	const response = await resolve(event);
	response.headers.set('Access-Control-Allow-Origin', '*');
	response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
	return response;
};
