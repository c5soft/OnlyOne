<script lang="ts">
    import {onMount} from "svelte";
    import {isMenuOpen} from "../utils/store";
    import AutoComplete from "../Components/AutoComplete.svelte";
    import {getJson, HotelFeeStd} from "../utils/hotelFeeStd";
    //import type { HotelFeeStd } from "../utils/hotelFeeStd";
    let hotelFee: HotelFeeStd = null;
    let find: string = "";
    //$: isDropDown = find.length > 0 && /^[a-z]+/i.test(find);
    onMount(async () => {
        hotelFee = await getJson("财行【2016】71号差旅住宿费标准.json");
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
    <title>差旅住宿费标准</title>
</svelte:head>
<section class="content ml-5 mt-0">
    <h3>中央和国家机关工作人员赴地方差旅住宿费标准明细表</h3>
    <div class="columns">
        <div class="column is-narrow is-size-5">
            <a href="http://www.mof.gov.cn/gp/xxgkml/xzzfs/201604/t20160414_2511941.htm">财行[2016]71号</a>
        </div>
        <div class="column is-narrow">
            {#if hotelFee}
                <AutoComplete isDropDown={find.length > 0 && /^[a-z]+/i.test(find)}>
                    <input
                            slot="input"
                            class="input is-rounded"
                            type="text"
                            placeholder="输入地区汉字或简拼"
                            bind:value={find}/>
                    <div slot="list">
                        {#await hotelFee.py2Words(find)}
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
        {#if !hotelFee}
            <div>Waiting...</div>
        {:else}
            {@html hotelFee.asHtml(find)}
        {/if}
        </div>
    </div>
</section>
