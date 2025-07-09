import { readdir, stat, readFile } from 'fs/promises';
import { join } from 'path';

export async function scanRoutes(baseDir: string): Promise<
	{
		path: string;
		description: string;
		requestBody?: string;
		responseBody?: string;
	}[]
> {
	let routes: {
		path: string;
		description: string;
		requestBody?: string;
		responseBody?: string;
	}[] = [];
	try {
		const files = await readdir(baseDir);
		for (const file of files) {
			const filePath = join(baseDir, file);
			const fileStat = await stat(filePath);

			if (fileStat.isDirectory()) {
				// Recursively scan subdirectories
				routes = routes.concat(await scanRoutes(filePath));
			} else if (fileStat.isFile() && file === '+server.ts') {
				// Read file content to extract comments
				const fileContent = await readFile(filePath, 'utf-8');
				const routeDescriptionMatch = fileContent.match(/\/\/ @routeDescription:\s*(.*)/);
				const requestBodyMatch = fileContent.match(
					/\/\/ @requestBody:\s*([\s\S]*?)(?=\/\/ @|\n\n|$)/
				);
				const responseBodyMatch = fileContent.match(
					/\/\/ @responseBody:\s*([\s\S]*?)(?=\/\/ @|\n\n|$)/
				);

				const description = routeDescriptionMatch
					? routeDescriptionMatch[1].trim()
					: 'No description provided.';
				const requestBody = requestBodyMatch
					? requestBodyMatch[1]
							.split('\n')
							.map((line) => line.replace(/\/\//g, '').trim())
							.filter((line) => line.length > 0)
							.join('\n')
					: undefined;
				const responseBody = responseBodyMatch
					? responseBodyMatch[1]
							.split('\n')
							.map((line) => line.replace(/\/\//g, '').trim())
							.filter((line) => line.length > 0)
							.join('\n')
					: undefined;

				// Extract route path from file path
				const routePath = filePath
					.replace(/\\/g, '/') // Normalize path separators for Windows
					.replace(/^.*src\/routes/, '') // Remove base path
					.replace(/\/\+server\.ts$/, ''); // Remove /+server.ts

				routes.push({
					path: routePath === '' ? '/' : routePath,
					description,
					requestBody,
					responseBody
				});
			}
		}
	} catch (error) {
		console.error(`Error scanning directory ${baseDir}:`, error);
	}
	return routes;
}
