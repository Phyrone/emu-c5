<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import AppSkeleton from './AppSkeleton.svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<AppSkeleton>
	{@render children()}
</AppSkeleton>
