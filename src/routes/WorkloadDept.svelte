<script lang="ts">
    import AgGrid from "../Components/AgGrid.svelte";
    import { onMount, afterUpdate } from "svelte";
    import { replace } from "svelte-spa-router";
    import { isMenuOpen, userProfile } from "../utils/store";
    import { Rowset } from "../utils/rowset";
    import { base16Encode } from "../utils/base16";
    import type {
        GridOptions,
        ValueFormatterParams,
        FirstDataRenderedEvent,
        ColDef
    } from "ag-grid-community";
    import { rowset2AgGridOptions } from "../utils/agGridUtils";
    import { AG_GRID_LOCALE_CN } from "../utils/agGridLocaleText";
    import { formatMoney } from "../utils/formatMoney";
    export let dept: string = "dept";
    let data: Rowset = null;
    let msg: string = "";
    let gridOptions: GridOptions = null;
    let caches = {};
    let yearMin: number = 2002;
    let yearMax: number = new Date().getFullYear();
    let year: number = yearMax;
    async function loadWorkLoad(userName: string, year: number) {
        let json;
        let cacheKey = userName + "@" + year.toString();
        let cached = caches[cacheKey];
        if (cached) {
            json = cached;
        } else {
            let params = JSON.stringify({ userName, year });
            let qs = "ask=workload&params=" + base16Encode(params);
            let response = await fetch("/api/ask?" + qs);
            json = await response.json();
            caches[cacheKey] = json;
        }
        return json;
    }
    function currencyFormatter(params: ValueFormatterParams) {
        return formatMoney(params.value);
    }
    async function refreshData() {
        console.log("refreshData",year);
        let json = await loadWorkLoad(dept, year);
        if (json.msg === "ok") {
            data = new Rowset(json.data);
            gridOptions = rowset2AgGridOptions(data);
            gridOptions.masterDetail = true;
            (gridOptions.columnDefs[0] as ColDef).cellStyle = {
                fontFamily: "宋体",
                fontWeight: "bold",
            };
            (gridOptions.columnDefs[0] as ColDef).cellRenderer =
                "agGroupCellRenderer";
            gridOptions.detailCellRendererParams = {
                // provide the Grid Options to use on the Detail Grid
                detailGridOptions: {
                    localeText: AG_GRID_LOCALE_CN,
                    enableCharts: true,
                    enableRangeSelection: true,
                    defaultColDef: {
                        resizable: true,
                    },
                    columnDefs: [
                        {
                            headerName: "项目负责人",
                            field: "0",
                            type: "leftAligned",
                        },
                        { headerName: "排名", field: "1" },
                        { headerName: "笔数", field: "2" },
                        { headerName: "凭证张数", field: "3" },
                        {
                            headerName: "金额",
                            field: "4",
                            type: "numericColumn",
                            valueFormatter: currencyFormatter,
                        },
                    ],
                    onFirstDataRendered: (e: FirstDataRenderedEvent) => {
                        let data = e.api.getRowNode("0").data;
                        let firstHeaderName = "项目负责人";
                        if (data[0].indexOf("(") === -1)
                            firstHeaderName = "部门";
                        let colDefs: ColDef[] = e.api.getColumnDefs();
                        colDefs[0].headerName = firstHeaderName;
                        e.api.setColumnDefs(colDefs);
                        e.columnApi.autoSizeAllColumns(false);
                    },
                },

                // get the rows for each Detail Grid
                getDetailRowData: async function (params) {
                    let param = "dept:" + params.data[0].slice(0, 4);
                    let json = await loadWorkLoad(param, year);
                    let data = [];
                    if (json.msg === "ok") {
                        let rowset = new Rowset(json.data);
                        data = rowset.rows;
                    }
                    //console.dir(data);
                    //gridOptions.detailCellRendererParams.detailGridOptions.columnDefs[0].headerName='部门';
                    params.successCallback(data);
                },
            };
        } else {
            msg = json.msg;
            data = null;
        }
        //setTimeout(autoSizeAllColumns, 1000);
    }
    onMount(async () => {
        $isMenuOpen = false;
        if (!$userProfile.logined) replace("/");
        else refreshData();
    });
    function autoSizeAllColumns() {
        if (gridOptions && gridOptions.columnApi) {
            console.log("autoSizeAllColumns");
            //gridOptions.api.sizeColumnsToFit();
            gridOptions.columnApi.autoSizeAllColumns(false);
        }
    }
    afterUpdate(() => {
        //autoSizeAllColumns();
    });
</script>

<svelte:head>
    <title>部门工作量统计</title>
</svelte:head>
<section class="content ml-5 mt-0">
    {#if msg}
        <div>
            {@html msg}
        </div>
    {:else if data}
        <h3>部门工作量统计</h3>
        <div class="columns">
            <div class="column is-narrow">年度：{year}</div>
            <div class="column is-half">
                <input
                    type="range"
                    min={yearMin}
                    max={yearMax}
                    bind:value={year}
                    on:change={async () => await refreshData()}
                    style="width:100%"
                />
            </div>
        </div>
        {#if data.rowCount}
            <div class="columns">
                <div class="column is-8" style="height:700px">
                    <!-- {@html data.asHtml()} -->
                    <AgGrid bind:options={gridOptions} theme="fresh" />
                </div>
            </div>
        {:else}
            <div>没有查到学院工作量统计数据</div>
        {/if}
    {:else}
        <div>Wait ...</div>
    {/if}
</section>
