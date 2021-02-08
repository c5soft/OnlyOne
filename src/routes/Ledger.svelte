<script lang="ts">
    import AgGrid from "../Components/AgGrid.svelte";
    import { onMount, afterUpdate } from "svelte";
    import { replace } from "svelte-spa-router";
    import { isMenuOpen, userProfile } from "../utils/store";
    import { Rowset } from "../utils/rowset";
    import { fetchAskData } from "../utils/tools";
    import DateRangePicker from "../Components/DateRangePicker.svelte";
    import type {
        GridOptions,
        ValueFormatterParams,
        FirstDataRenderedEvent,
        ColDef,
    } from "ag-grid-community";
    import { rowset2AgGridOptions } from "../utils/agGridUtils";
    import { AG_GRID_LOCALE_CN } from "../utils/agGridLocaleText";
    import { formatMoney } from "../utils/formatMoney";
    import CodeComplete from "../Components/CodeComplete.svelte";
    import InputText from "../Components/InputText.svelte";

    let data: Rowset = null;
    let indexOfVoucherNo: number = 0;
    let msg: string = "";
    let gridOptions: GridOptions = null;
    let showParamsPanel = true;
    let loading = false;

    let dateFrom: string = "2021-01-01";
    let dateTo: string = "2021-12-31";
    let codeKM: string = ""; //科目
    let codeBM: string = ""; //部门
    let codeXM: string = ""; //项目
    let codeJJ: string = ""; //经济分类
    let paramZY: string = ""; //摘要
    let paramJE: string = ""; //金额
    let paramCZ: string = ""; //操作员
    let paramPZ: string = ""; //凭证号
    let paramDC: string = ""; //对冲号

    // this limits the HTML5 date picker end date - e.g. today is used here
    let dateRangePickerParams = {
        dateMin: new Date("2002-01-01"),
        dateMax: new Date(),
        name: "dateRange",
        heading: "日期范围：",
    };

    function currencyFormatter(params: ValueFormatterParams) {
        return formatMoney(params.value);
    }

    async function fetchCode(params: any): Promise<string[]> {
        console.log("fetch code", params);
        let data = [];
        if (params.code.length > 0) {
            let json = await fetchAskData("py2code", params);
            if (json.msg === "ok") {
                let rowset = new Rowset(json.data);
                data = rowset.rows!.map((x) => x[0]);
                msg = "";
            } else {
                msg = json.msg;
            }
        }
        return data;
    }

    async function refreshData() {
        let queryParams = {
            dateFrom,
            dateTo,
            codeKM,
            codeBM,
            codeXM,
            codeJJ,
            paramZY,
            paramJE,
            paramCZ,
            paramPZ,
            paramDC,
        };
        loading = true;
        try {
            let json = await fetchAskData("ledger", queryParams);
            loading = false;
            if (json.msg === "ok") {
                data = new Rowset(json.data);
                indexOfVoucherNo = data.columns.findIndex(
                    (x) => x.name == "凭证内码"
                );
                gridOptions = rowset2AgGridOptions(data);
                gridOptions.masterDetail = true;
                gridOptions.detailRowAutoHeight = true;
                (gridOptions.columnDefs[0] as ColDef).cellRenderer =
                    "agGroupCellRenderer";
                let voucherColDefs: any = json.voucherColDefs || "";
                voucherColDefs = voucherColDefs
                    .split(",")
                    .map((headerName, i) => {
                        let colDef: any = { headerName, field: i.toString() };
                        if (headerName.indexOf("金额") >= 0) {
                            colDef.type = "numericColumn";
                            colDef.valueFormatter = currencyFormatter;
                        }
                        return colDef;
                    });

                gridOptions.detailCellRendererParams = {
                    // provide the Grid Options to use on the Detail Grid
                    detailGridOptions: {
                        localeText: AG_GRID_LOCALE_CN,
                        enableCharts: true,
                        enableRangeSelection: true,
                        defaultColDef: {
                            resizable: true,
                        },
                        columnDefs: voucherColDefs,
                        onFirstDataRendered: (e: FirstDataRenderedEvent) => {
                            e.columnApi.autoSizeAllColumns(false);
                        },
                    },

                    // get the rows for each Detail Grid
                    getDetailRowData: async function (params) {
                        let voucher = params.data[indexOfVoucherNo];
                        let queryParams = { voucher };
                        let json = await fetchAskData("voucher", queryParams);
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
                msg="";
            } else {
                msg = json.msg;
                data = null;
            }
        } finally {
            loading = false;
        }
        //setTimeout(autoSizeAllColumns, 1000);
    }

    onMount(async () => {
        $isMenuOpen = false;
        if (!$userProfile.logined) replace("/");
    });

    function autoSizeAllColumns() {
        if (gridOptions && gridOptions.columnApi) {
            console.log("autoSizeAllColumns");
            //gridOptions.api.sizeColumnsToFit();
            gridOptions.columnApi.autoSizeAllColumns(false);
        }
    }

    function findLastPos(old: string): number {
        let posComma = old.lastIndexOf(",");
        let posPlus = old.lastIndexOf("+");
        return posComma > posPlus ? posComma : posPlus;
    }

    function autoCompletePreProc(old: string): string {
        let pos = findLastPos(old);
        let result = pos >= 0 ? old.slice(pos + 1) : old;
        console.log(old, result);
        return result;
    }

    function autoCompletePostProc(old: string, val: any) {
        console.log("old=", old, "new=", val);
        let pos = findLastPos(old);
        if (Array.isArray(val)) val = val[0];
        return pos >= 0 ? old.slice(0, pos + 1) + val : val;
    }

    afterUpdate(() => {
        //autoSizeAllColumns();
    });
</script>

<svelte:head>
    <title>明细账查询</title>
</svelte:head>
<section class="content ml-5 mt-0">
    <div class="columns">
        <div class="column is-narrow">
            <span class="is-size-4 has-text-weight-bold">明细账查询</span>
            <button
                class="button ml-1"
                aria-haspopup="true"
                aria-controls="dropdown-menu"
                on:click={() => (showParamsPanel = !showParamsPanel)}
            >
                <span>查询条件</span>
                <span class="icon is-small">
                    {#if showParamsPanel}
                        <i class="fas fa-angle-up" aria-hidden="true" />
                    {:else}
                        <i class="fas fa-angle-down" aria-hidden="true" />
                    {/if}
                </span>
            </button>
            <button
                class="button ml-1"
                class:is-loading={loading}
                on:click={async () => {
                    showParamsPanel = false;
                    await refreshData();
                }}
            >
                <span class="icon is-small">
                    <i class="fas fa-search" aria-hidden="true" />
                </span>
            </button>
        </div>
    </div>
    <!--    <nav class="panel" class:is-hidden={!showParamsPanel}>-->
    <nav class="columns m-0 p-0" class:is-hidden={!showParamsPanel}>
        <div class="is-narrow m-0 p-0 box">
            <DateRangePicker
                {...dateRangePickerParams}
                bind:dateFrom
                bind:dateTo
            />
        </div>
        <div class="tile is-vertical is-gapless box m-0 p-0 pl-2">
            <InputText
                label="摘要："
                placeholder="未记账@wjz,未复核@wfh,多项输入用逗号分隔"
                bind:value={paramZY}
            />
            <InputText
                label="金额："
                placeholder="范围~,>,>=,<,<=,!=,借@j,贷@d"
                bind:value={paramJE}
            />
            <CodeComplete
                label="科目："
                placeholder="编号或名称简拼，多项输入用逗号分隔"
                bind:value={codeKM}
                {fetchCode}
                reDropDown={/[a-z]{2,}$|\d+\*$|\d+\?$/i}
                reExtract={/\d+/}
            />
        </div>
        <div class="tile is-vertical is-gapless box m-0 p-0 pl-2">
            <CodeComplete
                label="部门："
                placeholder="编号或名称简拼，多项输入用逗号分隔"
                bind:value={codeBM}
                {fetchCode}
                reDropDown={/[a-z]{2,}$|\d+\*$|\d+\?$/i}
                reExtract={/\d+/}
            />
            <CodeComplete
                label="项目："
                placeholder="编号或名称简拼，多项输入用逗号分隔"
                bind:value={codeXM}
                {fetchCode}
                reDropDown={/[a-z]{2,}$|\d+\*$|\d+\?$/i}
                reExtract={/\d{4}-\d{8}/}
            />
            <CodeComplete
                label="经济分类："
                placeholder="编号或名称简拼，多项输入用逗号分隔"
                bind:value={codeJJ}
                {fetchCode}
                reDropDown={/[a-z]{2,}$|\d+\*$|\d+\?$/i}
                reExtract={/\d+/}
            />
        </div>
        <div class="tile is-vertical is-gapless box m-0 p-0 pl-2">
            <CodeComplete
                label="操作员："
                placeholder="输入制单人,复核@fh，出纳@cn"
                bind:value={paramCZ}
                {fetchCode}
                reDropDown={/^[a-z]{1,}|[+,][a-z]{1,}/i}
                reExtract={/.*/}
            />
            <InputText
                label="凭证号："
                placeholder="东区@d、西区@x，多项输入用逗号分隔"
                bind:value={paramPZ}
            />
            <InputText
                label="对冲号："
                placeholder="输入对冲号，多项输入用逗号分隔"
                bind:value={paramDC}
            />
        </div>
    </nav>
    <!--    </nav>-->
    {#if msg}
        <div>
            {@html msg}
        </div>
    {:else if data}
        {#if data.rowCount}
            <div class="columns">
                <div class="column is-full" style="height:700px">
                    <!-- {@html data.asHtml()} -->
                    <AgGrid bind:options={gridOptions} theme="fresh" />
                </div>
            </div>
        {:else}
            <div>没有查到符合条件的数据</div>
        {/if}
    {:else}
        <div>
            <p>
                输入查询条件，按
                <button
                    class="m-1"
                    on:click={async () => {
                        showParamsPanel = false;
                        await refreshData();
                    }}
                >
                    <span class="icon is-small">
                        <i class="fas fa-search" aria-hidden="true" />
                    </span>
                </button>
                开始查询
            </p>
            <p>
                用英文逗号“,”表示“或”，用英文加号“+”表示“且”；例如：在摘要位置输入：化学+扣税,居民，表示摘要包含“化学”并且包含“扣税”，或者摘要包含“居民”；或与且可以多个，或与且可以在任何查询位置输入。
            </p>
            <p>
                {"用波浪符号“~”表示范围，比如金额位置输入1000~5000，表示1000<=借方金额-贷方金额<=5000。表示范围还可以输入>、>=、<、<=、!=、=。"}
            </p>
            <div class="mb-2">
                <div class="mb-0">用@表示标注:</div>
                <ul class="mt-0 pt-0">
                    <li>
                        摘要位置支持@wjz与@wfh，@wjz表示未记账，@wfh表示未复核。
                    </li>
                    <li>
                        凭证号位置支持@d与@x，@d表示东区凭证，@x表示西区凭证。
                    </li>
                    <li>
                        操作员位置支持@fh与@cn，不标注表示制单，@fh表示复核，@cn表示出纳。
                    </li>
                    <li>
                        {"金额位置支持@j与@d，输入5000@j表示借方金额5000；输入>5300@d表示贷方金额大于5300元，不标注为借减贷的差额。"}
                    </li>
                </ul>
            </div>
            <p>
                通配检索：科目、部门、项目、经济分类支持含有用?与*的通配符。?代表任一字符，*代表任意多个字符。例如：科目输入1011*，检索所有编码以1011开头的科目。
            </p>
            <p>
                拼音检索：科目、部门、项目、经济分类、操作员支持拼音检索，输入名称拼音首字母，弹出选择下拉框。编码检索至少需要输入两个字母才能弹出下拉框。
            </p>
            <p>
                {"特殊表达：金额位置用w表示万元，例如1w~10w表示1万至10万，>5.3w表示大于5.3万元。金额只输入数字表示元"}
            </p>
            <p>
                凭证联查：查询结果中按摘要左边的“+”按钮，显示/关闭凭证联查页面
            </p>
        </div>
    {/if}
</section>
