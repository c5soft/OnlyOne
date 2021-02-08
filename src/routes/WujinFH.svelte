<script lang="ts">
    import { onMount } from "svelte";
    import { isMenuOpen } from "../utils/store";
    import { Rowset } from "../utils/rowset";
    import { base16Encode } from "../utils/base16";
    let data: Rowset = null;
    let period: string = "";
    let msg = "";
    onMount(async () => {
        $isMenuOpen = false;
        period = new Date().toISOString();
        period = period.slice(0, 4) + period.slice(5, 7);
    });
    async function process(e: Event) {
        let params = JSON.stringify({
            p1: period,
            p2: period,
        });
        let qs = "ask=wujinFH&params=" + base16Encode(params);
        let response = await fetch("/api/ask?" + qs);
        let json = await response.json();
        if (json.msg === "ok") {
            msg = "";
            data = new Rowset(json.data);
            console.log(JSON.stringify(data));
        } else {
            msg = json.msg;
            data = null;
        }
    }
</script>

<svelte:head>
    <title>合并制单标记</title>
</svelte:head>

<section class="content ml-5 mt-0">
    <h3>后勤工资返还网报合并制单标记</h3>
    <div class="columns">
        <div class="column is-narrow">
            <span>凭证期间：</span>
            <input
                type="text"
                class="input"
                style="width:80px"
                bind:value={period}
                placeholder="输入年月，例如202012"
            />
            <button class="button" on:click={process}>处理</button>
        </div>
    </div>
    {#if msg}
        <div>
            {@html msg}
        </div>
    {:else if data}
        {#if data.rowCount}
            {@html data.asHtml()}
        {:else}
            <div>没有查到您的工作量统计数据</div>
        {/if}
    {/if}
</section>
