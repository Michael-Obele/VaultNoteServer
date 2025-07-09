<script lang="ts">
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { toast, Toaster } from 'svelte-sonner';
	import Theme from './Theme.svelte';

	let routes: {
		path: string;
		description: string;
		requestBody?: string;
		responseBody?: string;
		serverCode?: string;
	}[] = [];

	const extractServerCode = (responseBody: string) => {
		const serverCodePattern =
			/export async function POST\(\{ request, cookies \}\) \{[\s\S]*?\}\s*=\s*await request\.json\(\);/;
		const match = responseBody.match(serverCodePattern);
		if (match) {
			const serverCode = match[0];
			const remainingResponseBody = responseBody.replace(serverCode, '').trim();
			return { serverCode, remainingResponseBody };
		}
		return { serverCode: undefined, remainingResponseBody: responseBody };
	};

	onMount(async () => {
		try {
			const response = await fetch('/api/routes');
			if (response.ok) {
				const fetchedRoutes = await response.json();
				routes = fetchedRoutes.map((route: { responseBody?: string }) => {
					if (route.responseBody) {
						const { serverCode, remainingResponseBody } = extractServerCode(route.responseBody);
						return { ...route, serverCode, responseBody: remainingResponseBody };
					}
					return route;
				});
			} else {
				console.error('Failed to fetch routes:', response.statusText);
			}
		} catch (error) {
			console.error('Error fetching routes:', error);
		}
	});
</script>

<Card.Root class="w-full relative max-w-4xl mx-auto my-8">
	<Theme class="absolute top-8 right-3" />
	<Card.Header>
		<Card.Title class="text-4xl font-bold text-center">Welcome to VaultNoteServer</Card.Title>
		<Card.Description class="text-2xl font-semibold mt-4">Available Server Routes:</Card.Description
		>
	</Card.Header>
	<Card.Content>
		{#if routes.length > 0}
			<ul class="list-none p-0">
				{#each routes as route}
					<li class="mb-2">
						<a
							href={route.path}
							target="_blank"
							rel="noopener noreferrer"
							class="text-primary hover:underline"
						>
							{route.path}
						</a>
						<p class="text-muted-foreground text-sm ml-4">{route.description}</p>
						{#if route.requestBody}
							<Card.Root class="ml-4 mt-2 mb-4">
								<Card.Header class="flex flex-row justify-between items-center">
									<Card.Title class="text-lg">Request Body:</Card.Title>
									<Button
										variant="outline"
										size="sm"
										onclick={() => {
											navigator.clipboard.writeText(route.requestBody || '');
											toast.success('Request Body copied to clipboard!');
										}}
									>
										Copy
									</Button>
								</Card.Header>
								<Card.Content>
									<pre class="whitespace-pre-wrap break-words text-sm"><code
											>{route.requestBody}</code
										></pre>
								</Card.Content>
							</Card.Root>
						{/if}
						{#if route.serverCode}
							<Card.Root class="ml-4 mt-2 mb-4">
								<Card.Header class="flex flex-row justify-between items-center">
									<Card.Title class="text-lg">Server Code:</Card.Title>
									<Button
										variant="outline"
										size="sm"
										onclick={() => {
											navigator.clipboard.writeText(route.serverCode || '');
											toast.success('Server Code copied to clipboard!');
										}}
									>
										Copy
									</Button>
								</Card.Header>
								<Card.Content>
									<pre class="whitespace-pre-wrap break-words text-sm"><code
											>{route.serverCode}</code
										></pre>
								</Card.Content>
							</Card.Root>
						{/if}
						{#if route.responseBody}
							<Card.Root class="ml-4 mt-2 mb-4">
								<Card.Header class="flex flex-row justify-between items-center">
									<Card.Title class="text-lg">Response Body:</Card.Title>
									<Button
										variant="outline"
										size="sm"
										onclick={() => {
											navigator.clipboard.writeText(route.responseBody || '');
											toast.success('Response Body copied to clipboard!');
										}}
									>
										Copy
									</Button>
								</Card.Header>
								<Card.Content>
									<pre class="whitespace-pre-wrap break-words text-sm"><code
											>{route.responseBody}</code
										></pre>
								</Card.Content>
							</Card.Root>
						{/if}
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-muted-foreground">No server routes found.</p>
		{/if}
	</Card.Content>
</Card.Root>

<Toaster />
