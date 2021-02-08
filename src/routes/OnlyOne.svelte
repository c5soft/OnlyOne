<script lang="ts">
    import { onMount } from "svelte";
    import { isMenuOpen } from "../utils/store";
    import { OnlyOne } from "../utils/onlyOne";
    import AutoComplete from "../Components/AutoComplete.svelte";
    let find: string = "";
    let onlyOne: OnlyOne = null;

    onMount(async () => {
        $isMenuOpen = false;
        find = localStorage.getItem("find");
        if (find === null || find === undefined) find = "";
        onlyOne = await new OnlyOne("财务处只跑一次清单").load();
    });
    function dropDownCick(e: MouseEvent) {
        find = (e.target as HTMLElement).innerText;
    }
</script>

<style>
    :global(span.find) {
        color: black;
        background-color: rgba(89, 34, 240, 0.39);
    }
</style>

<svelte:head>
    <title>报销指南</title>
</svelte:head>
<section class="content ml-5 mt-0">
    <h3>财务“只跑一次”报销指南</h3>
    <div class="columns">
        <div class="column is-4">
            {#if onlyOne}
                <AutoComplete
                    isDropDown={find.length > 0 && /^[a-z]+/i.test(find)}>
                    <input
                        slot="input"
                        class="input is-rounded"
                        type="text"
                        placeholder="输入关键字汉字或简拼"
                        bind:value={find} />
                    <div slot="list">
                        {#await onlyOne.py2Words(find)}
                            Waiting...
                        {:then words}
                            {#each words as word (word)}
                                <button
                                    on:click={dropDownCick}
                                    class="button is-rounded">{word}</button>
                            {/each}
                        {/await}
                    </div>
                </AutoComplete>
            {:else}
                <div>Wait py2words...</div>
            {/if}
        </div>
    </div>
    <div class="content">
        {#if !onlyOne}
            <div>Waiting...</div>
        {:else}
            {@html onlyOne.asHtml(find)}
        {/if}
    </div>
</section>
