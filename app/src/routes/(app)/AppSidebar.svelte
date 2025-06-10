<script lang="ts">
	type Props = {
		sidebar_open: boolean;
		open_on_hover: boolean;
	};

	let { sidebar_open = $bindable(true), open_on_hover }: Props = $props();
</script>

<nav
	class={[
		'bg-base-200 flex flex-col drop-shadow-sm transition-all',
		'fixed bottom-0 left-0 z-20 hidden h-screen sm:flex',
		'@container',
		!sidebar_open && 'w-20',
		open_on_hover && !sidebar_open && 'hover:w-72 hover:drop-shadow-2xl',
		sidebar_open && 'w-72'
	]}
>
	<div class="h-16 flex-none"></div>
	<div class="flex flex-auto flex-col">
		<div class="">A</div>
		<div class="flex-auto"></div>
		<div>A</div>
	</div>
</nav>
<div
	class={[ /* sidebar_open ? 'w-72' : 'w-20' */  sidebar_open ? 'w-72 lg:w-20' : 'w-20', 'flex-none', 'hidden', 'sm:block', 'transition-all']}
></div>
