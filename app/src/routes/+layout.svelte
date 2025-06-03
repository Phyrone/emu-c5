<script lang="ts">
	import '../app.css';
	import '$lib/theme';
	import '$lib/sw-ctl';

	let { children } = $props();
</script>

{@render children()}
