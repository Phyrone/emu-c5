<script lang="ts">
    import {SearchIcon, UserIcon, MenuIcon} from '@lucide/svelte';

    type Props = {
        sidebar_open: boolean;
    };

    let {sidebar_open = $bindable()}: Props = $props();

    function toggleSidebar(event: Event) {
        event.preventDefault();
        sidebar_open = !sidebar_open;
    }
</script>


<nav class="hidden sm:fixed navbar bg-base-100 top-0 z-30 shadow sm:flex">
    <div class="navbar-start gap-3">
        <button class={['btn btn-ghost btn-circle', sidebar_open && 'btn-active']} onclick={toggleSidebar}>
            <MenuIcon/>
        </button>
        <a href="#content" class="text-primary-content btn-link sr-only focus:not-sr-only">Skip to content</a>
        <a href="/" class=" btn btn-ghost btn-lg uppercase">emu</a>
    </div>
    <div class="navbar-center">
        <label class="floating-label">
            <label class="input w-lg transition-all lg:w-2xl ">
                <SearchIcon size="16" class="opacity-50"/>
                <input type="text" class="grow" placeholder="Search..."/>
            </label>
            <span>Search</span>
        </label>

    </div>
    <div class="navbar-end">

        <button class="btn btn-ghost btn-circle btn-lg">
            <UserIcon/>
        </button>
    </div>
</nav>
<div class="h-16 hidden sm:block"></div>
