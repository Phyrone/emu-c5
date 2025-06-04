<script lang="ts">
    import {HomeIcon} from '@lucide/svelte';

    type Props = {
        sidebar_open: boolean;
        open_on_hover: boolean;
    }

    let {sidebar_open = $bindable(true), open_on_hover}: Props = $props();

</script>
<nav class={[
    'flex flex-col transition-all bg-base-200',
    'hidden sm:flex fixed left-0 bottom-0 h-screen z-20',
    '@container',
    (!sidebar_open) && 'w-20',
    (open_on_hover && !sidebar_open) && 'hover:w-72',
    sidebar_open && 'w-72',
]}>
    <div class="flex-none h-16"></div>
    <div class="flex-auto flex flex-col">
        <div class="">
            A
        </div>
        <div class="flex-auto"></div>
        <div>
            A
        </div>
    </div>

</nav>
<div class={[sidebar_open ? 'w-72' : 'w-20','flex-none','hidden','sm:block','transition-all']}></div>
