<script lang="ts">
    import { onMount, afterUpdate } from "svelte";
    import { replace } from "svelte-spa-router";
    import type { GridOptions, RowDataUpdatedEvent } from "ag-grid-community";
    import { rowset2AgGridOptions } from "../utils/agGridUtils";
    import { isMenuOpen, userProfile } from "../utils/store";
    import { Rowset } from "../utils/rowset";
    import { base16Encode } from "../utils/base16";
    import AgGrid from "../Components/AgGrid.svelte";

    let data: Rowset = null;
    let gridOptions: GridOptions = null;
    let msg: string = "";
    onMount(async () => {
        $isMenuOpen = false;
        if (!$userProfile.logined) {
            replace("/");
        } else {
            let params = JSON.stringify({
                userId: $userProfile.userId,
                userName: $userProfile.userName,
            });
            let qs = "ask=workload&params=" + base16Encode(params);
            let response = await fetch("/api/ask?" + qs);
            let json = await response.json();
            if (json.msg === "ok") {
                data = new Rowset(json.data);
                gridOptions = rowset2AgGridOptions(data);
            } else {
                msg = json.msg;
                data = null;
            }
            setTimeout(autoSizeAllColumns, 1000);
        }
    });

    function autoSizeAllColumns() {
        if (gridOptions && gridOptions.columnApi) {
            console.log("autoSizeAllColumns");
            //gridOptions.api.sizeColumnsToFit();
            gridOptions.columnApi.autoSizeAllColumns(false);
        }
    }

    afterUpdate(() => {
        autoSizeAllColumns();
    });
</script>

<svelte:head>
    <title>个人工作量统计</title>
</svelte:head>

<section class="content ml-5 mt-0">
    {#if msg}
        <div>
            {@html msg}
        </div>
    {:else if gridOptions}
        {#if gridOptions.rowData.length > 0}
            <h3>{$userProfile.userName}工作量统计</h3>
            <div class="columns">
                <div class="column is-8" style="height:400px">
                    <AgGrid options={gridOptions} />
                </div>
            </div>
        {:else}
            <div>没有查到您的工作量统计数据</div>
        {/if}
    {:else}
        <div>Wait ...</div>
    {/if}
</section>
