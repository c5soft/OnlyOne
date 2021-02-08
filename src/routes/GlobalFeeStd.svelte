<script lang="ts">
    import {onMount} from "svelte";
    import {isMenuOpen} from "../utils/store";
    import AutoComplete from "../Components/AutoComplete.svelte";
    import {getJson, GlobalFeeStd} from "../utils/globalFeeStd";
    //import type { globalFeeStd } from "../utils/globalFeeStd";
    let globalFee: GlobalFeeStd = null;
    let find: string = "";
    //$: isDropDown = find.length > 0 && /^[a-z]+/i.test(find);
    onMount(async () => {
        globalFee = await getJson("财行【2013】516号国际差旅标准.json");
        $isMenuOpen = false;
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
    <title>国际差旅开支标准</title>
</svelte:head>
<section class="content ml-5 mt-0">
    <h3>国家和地区住宿费、伙食费、公杂费开支标准</h3>
    <div class="columns">
        <div class="column is-narrow is-size-5">
            <a href="/doc/biztrip2013-516.pdf">财行[2013]516号</a>
        </div>
        <div class="column is-narrow">
            {#if globalFee}
                <AutoComplete isDropDown={find.length > 0 && /^[a-z]+/i.test(find)}>
                    <input
                            slot="input"
                            class="input is-rounded"
                            type="text"
                            placeholder="输入国家地区汉字或简拼"
                            bind:value={find}/>
                    <div slot="list">
                        {#await globalFee.py2Words(find)}
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
    <div class="columns">
        <div class="column is-narrow">
        {#if !globalFee}
            <div>Waiting...</div>
        {:else}
            {@html globalFee.asHtml(find)}
        {/if}
        </div>
    </div>
</section>
