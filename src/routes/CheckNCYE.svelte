<script lang="ts">
    import AgGrid from "../Components/AgGrid.svelte"
    import type {GridOptions} from "ag-grid-community";
    import {rowset2AgGridOptions} from "../utils/agGridUtils";
    import {base16Encode} from "../utils/base16";
    import {Rowset} from "../utils/rowset";

    const items = ["科目", "项目", "辅助"];
    let yearMin: number = 2020
    let yearMax: number = new Date().getFullYear();
    let year = yearMax;
    let itemIndex = 0;
    let msg: string = "请输入检查条件";
    let gridOptions: GridOptions = null;
    let caches = {};
    let loading = false;

    async function check() {
        const tblnameLookup = {"科目": "zwkmje", "项目": "zwxmje", "辅助": "zwfzje"};
        let tblname = tblnameLookup[items[itemIndex]];
        let currYear = year.toString();
        let data: Rowset = null;
        let key = currYear + '-' + tblname;
        const cached = caches[key];
        msg = "稍后...";
        if (cached) {
            data = JSON.parse(cached);
            msg = ""
        } else {
            let json = null;
            loading = true;
            try {
                let params = JSON.stringify({year: currYear, tblname});
                let qs = "ask=checkncye&params=" + base16Encode(params);
                let response = await fetch("/api/ask?" + qs);
                json = await response.json();
            } finally {
                loading = false;
            }
            if (json && json.msg === "ok") {
                data = new Rowset(json.data);
                caches[key] = JSON.stringify(data);
                msg = "";
            } else {
                data = null;
                msg = json || json.msg;
            }
        }
        gridOptions = rowset2AgGridOptions(data);
    }
</script>
<svelte:head>
    <title>年初余额检查</title>
</svelte:head>
<section class="content ml-5 mt-0">
    <h3>年初余额检查</h3>
    <div class="columns">
        <div class="column is-2">
            <div> 年度：{year} </div>
            <input type="range" min={yearMin} max={yearMax} bind:value={year}/>
        </div>
        <div class="column is-2">
            <div>类别：{items[itemIndex]}</div>
            <input type="range" min={0} max={items.length-1} bind:value={itemIndex}/>
        </div>
        <div class="column is-1">
            <button class="button" class:is-loading={loading} on:click={check}>检查</button>
        </div>
    </div>
    <div class="columns">
        <div class="column is-full" style="height:700px">
            {#if msg}
                <div>
                    {@html msg}
                </div>
            {:else if gridOptions}
                {#if gridOptions.rowData && gridOptions.rowData.length > 0 }
                    <AgGrid bind:options={gridOptions} theme="fresh"/>
                {:else}
                    <div class="icon-text has-text-link">
                        <span class="icon"><i class="fa fa-check-square"/></span>
                        <span>未发现问题</span>
                    </div>
                {/if}
            {:else}
                <div>{@html msg}</div>
            {/if}
        </div>
    </div>
</section>