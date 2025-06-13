<script lang="ts">
    import ThemeSelector from './ThemeSelector.svelte';
    import {LoremIpsum} from 'lorem-ipsum';


    let filler = (() => {
        const lorem = new LoremIpsum({});

        return Array.from({length: 100}, (_, i) => lorem.generateParagraphs(1));
    })();
</script>

<h1>Welcome to SvelteKit</h1>

<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

{#each filler as item}
    <p>{item}</p>
{/each}

