<script lang="ts">
	import { HomeIcon, UserIcon,SearchIcon } from '@lucide/svelte';
	import { page } from '$app/state';


	type DockGroup = 'home' | 'profile';
	let dock_group: DockGroup | undefined = $derived.by(() => {
		if (page.route.id?.startsWith('/(app)/self')) {
			return 'profile';
		} else {
			return 'home';
		}
	});

</script>

<div class="dock sm:hidden ">
	<a class={{
        'dock-active': dock_group === 'home'
    }} href="/">
		<HomeIcon />
		Home
	</a>
	<button class="btn btn-xl btn-primary btn-circle flex-none ">
		<SearchIcon />
	</button>
	<a class={{
        'dock-active': dock_group === 'profile'
    }} href="/self">
		<UserIcon />
		Profile
	</a>
</div>
