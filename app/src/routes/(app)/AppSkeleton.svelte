<script lang="ts">
    import type {Snippet} from 'svelte';
    import AppNavbar from './AppNavbar.svelte';
    import AppDock from './AppDock.svelte';
    import {ready_to_update} from "$lib/sw-ctl";
    import type {ServiceWorkerInstruction} from "$lib/sw-msg";

    type Props = {
        children?: Snippet;
    };

    let {children}: Props = $props();

    function triggerUpdate() {
        $ready_to_update?.postMessage({type: 'SKIP_WAITING'} satisfies ServiceWorkerInstruction)
    }

</script>

<AppNavbar/>
{#if $ready_to_update}
    <button class="btn" onclick={triggerUpdate}>Update</button>
{/if}
{@render children?.()}

<AppDock/>
