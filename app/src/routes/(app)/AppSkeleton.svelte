<script lang="ts">
    import type {Snippet} from 'svelte';
    import AppNavbar from './AppNavbar.svelte';
    import AppDock from './AppDock.svelte';
    import {ready_to_update} from "$lib/sw-ctl";
    import type {ServiceWorkerInstruction} from "$lib/sw-msg";
    import {page} from '$app/state'
    import {get_page_id} from "$lib/page";

    type Props = {
        children?: Snippet;
    };

    let {children}: Props = $props();

    function triggerUpdate() {
        $ready_to_update?.postMessage({type: 'SKIP_WAITING'} satisfies ServiceWorkerInstruction)
    }

    let page_id = $derived(get_page_id(page?.route?.id))

</script>

{page_id}
<AppNavbar/>

{#if $ready_to_update}
    <button class="btn" onclick={triggerUpdate}>Update</button>
{/if}
{@render children?.()}

<AppDock/>
