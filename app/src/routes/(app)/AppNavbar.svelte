<script lang="ts">
	import { SearchIcon } from '@lucide/svelte';

	import { MediaQuery } from 'svelte/reactivity';
	import type {PageId} from "$lib/page";

	type Props = {
		page_id?: PageId;
	};
	let {page_id }: Props = $props();
</script>

<nav class="navbar bg-base-100 sticky top-0 z-30 hidden shadow sm:flex">
	<div class="navbar-start"></div>
	<div class="navbar-center">
		<label class="floating-label">
			<label class="input w-lg transition-all lg:w-2xl">
				<SearchIcon size="16" class="opacity-50" />
				<input type="text" class="grow" placeholder="Search..." />
			</label>
			<span>Search</span>
		</label>

	</div>
	<div class="navbar-end"></div>
</nav>
