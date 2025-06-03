<script lang="ts">
    import {HomeIcon, UserIcon} from '@lucide/svelte';
    import type {PageId} from "$lib/page";
    import {page} from '$app/state'


    type DockGroup = 'home' | 'profile';
    let dock_group = $derived.by(() => {
        if (page.route.id?.startsWith('/(app)/self')) {
            return 'profile';
        } else {
            return 'home';
        }
    })

</script>

<div class="dock sm:hidden ">
    <a class={{
        'dock-active': dock_group === 'home'
    }} href="/">
        <HomeIcon/>
        Home
    </a>
    <a class={{
        'dock-active': dock_group === 'profile'
    }} href="/self">
        <UserIcon/>
        Profile
    </a>
</div>
