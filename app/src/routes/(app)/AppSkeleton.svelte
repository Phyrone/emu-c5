<script lang="ts">
	import type { Snippet } from 'svelte';
	import AppNavbar from './AppNavbar.svelte';
	import AppDock from './AppDock.svelte';
	import { ready_to_update } from '$lib/sw-ctl';
	import type { ServiceWorkerInstruction } from '$lib/sw-msg';
	import AppSidebar from './AppSidebar.svelte';

	type Props = {
		children?: Snippet;
	};

	let { children }: Props = $props();

	function triggerUpdate() {
		$ready_to_update?.postMessage({ type: 'SKIP_WAITING' } satisfies ServiceWorkerInstruction);
	}
	let sidebar_open = $state(false);
</script>

<AppNavbar bind:sidebar_open />
<div class="flex flex-auto">
	<AppSidebar bind:sidebar_open open_on_hover={true} />
	<main id="content" class="flex-auto">
		{@render children?.()}
	</main>
</div>

{#if $ready_to_update}
	<button class="btn" onclick={triggerUpdate}>Update</button>
{/if}

<AppDock />
