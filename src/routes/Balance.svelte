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
    let msg: string = "";
    let gridOptions: GridOptions = null;
    let showParamsPanel = true;
    let loading = false;

    const codeRanges = [
        "科目1级",
        "科目2级",
        "科目3级",
        "科目4级",
        "科目5级",
        "部门1级",
        "项目1级",
    ].map((x) => ({ label: x, value: x }));

    let dateFrom: string = "2021-01-01";
    let dateTo: string = "2021-12-31";
    let codeTop: string = codeRanges[0].value; //顶层
    let codeBottom: string = codeRanges[codeRanges.length - 1].value; //底层
    let codeKM: string = ""; //科目
    let codeBM: string = ""; //部门
    let codeXM: string = ""; //项目
    let paramFLSX: string = ""; //分类属性
    let paramWGRQ: string = ""; //完工日期
    let paramOther: string = ""; //其他条件
    let chkXMYE: boolean = false; //项目账
    let chkWJZ: boolean = false; //未记账
    let chkJDC: boolean = false; //仅底层
    let chkWan: boolean = false; //万元
    let chkSum: boolean = false; //万元
    let chkMerge: boolean = false;
    let mergeWidth: number = 4;

    $: sumDisabled = !(chkJDC || codeTop === codeBottom);
    $: if (sumDisabled) chkSum = false;

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
            codeTop,
            codeBottom,
            codeKM,
            codeBM,
            codeXM,
            paramFLSX,
            paramWGRQ,
            paramOther,
            chkXMYE,
            chkWJZ,
            chkJDC,
            chkWan,
            chkSum,
            chkMerge,
            mergeWidth,
        };
        loading = true;
        try {
            let json = await fetchAskData("balance", queryParams);
            loading = false;
            if (json.msg === "ok") {
                data = new Rowset(json.data);
                gridOptions = rowset2AgGridOptions(data);
                gridOptions.masterDetail = false;
                msg = "";
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
    <title>余额查询</title>
</svelte:head>
<section class="content ml-5 mt-0">
    <div class="columns">
        <div class="column is-narrow">
            <span class="is-size-4 has-text-weight-bold">余额查询</span>
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
            <CodeComplete
                label="科目："
                placeholder="编号或名称简拼，多项输入用逗号分隔"
                bind:value={codeKM}
                {fetchCode}
                reDropDown={/[a-z]{2,}$|\d+\*$|\d+\?$/i}
                reExtract={/\d+/}
            />
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
        </div>
        <div class="is-vertical is-gapless box m-0 p-0 pl-2">
            <div class="tile columns m-0 p-0">
                <div class="column m-0 p-0 is-narrow">顶层：</div>
                <div class="column m-0 mr-2 p-0 is-narrow">
                    <select bind:value={codeTop}>
                        {#each codeRanges as option (option.value)}
                            <option value={option.value}>{option.label}</option>
                        {/each}
                    </select>
                </div>
                <div class="column m-0 p-0 is-narrow">底层：</div>
                <div class="column m-0 p-0 is-narrow">
                    <select bind:value={codeBottom}>
                        {#each codeRanges as option (option.value)}
                            <option value={option.value}>{option.label}</option>
                        {/each}
                    </select>
                </div>
            </div>
            <div class="tile columns m-0 mt-2 p-0">
                <div class="column m-0 mr-2 p-0 is-narrow">
                    <label class="checkbox">
                        <input
                            type="checkbox"
                            bind:checked={chkXMYE}
                        />查项目余额</label
                    >
                </div>
                <div class="column m-0 mr-2 p-0 is-narrow">
                    <label class="checkbox">
                        <input
                            type="checkbox"
                            bind:checked={chkWJZ}
                        />含未记账</label
                    >
                </div>
                <div class="column m-0 mr-2 p-0 is-narrow">
                    <label class="checkbox">
                        <input
                            type="checkbox"
                            bind:checked={chkWan}
                        />汇总到万元</label
                    >
                </div>
            </div>
            <div class="tile columns m-0 mt-4 p-0">
                <div class="column m-0 mr-2 p-0 is-narrow">
                    <label class="checkbox">
                        <input
                            type="checkbox"
                            bind:checked={chkJDC}
                        />仅底层</label
                    >
                </div>
                <div class="column m-0 mr-2 p-0 is-narrow">
                    <label class="checkbox">
                        <input
                            type="checkbox"
                            bind:checked={chkSum}
                            disabled={sumDisabled}
                        />合计</label
                    >
                </div>
                <div class="column m-0 p-0 is-narrow">
                    <label class="checkbox"
                        ><input
                            type="checkbox"
                            bind:checked={chkMerge}
                        />合并科目前</label
                    >
                    <input
                        type="number"
                        min="3"
                        max="9"
                        style="width:2em;padding:0"
                        bind:value={mergeWidth}
                        disabled={!chkMerge}
                    />位
                </div>
            </div>
        </div>
        <div class="tile is-vertical is-gapless box m-0 p-0 pl-2">
            <InputText
                label="项目分类属性："
                placeholder=""
                bind:value={paramFLSX}
            />
            <InputText
                label="项目完工日期："
                placeholder="输入格式：20201231"
                bind:value={paramWGRQ}
            />
            <InputText
                label="其他条件："
                placeholder=""
                bind:value={paramOther}
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
                用英文逗号“,”表示“或”；例如：在科目位置输入：4,6,7，表示查询科目编码以4或6或7开头的数据。
            </p>
            <p>
                {"用波浪符号“~”表示范围，比如科目位置输入1000~1200，表示1000<=科目<=1200。表示范围还可以输入>、>=、<、<=、!=、=。"}
            </p>
            <p>
                通配检索：科目、部门、项目支持含有用?与*的通配符。?代表任一字符，*代表任意多个字符。例如：科目输入1011*，检索所有编码以1011开头的科目。
            </p>
            <p>
                拼音检索：科目、部门、项目支持拼音检索，输入名称拼音首字母，弹出选择下拉框。编码检索至少需要输入两个字母才能弹出下拉框。
            </p>
            <p>
                {"其他条件：对查询结果的数据做二次筛选，例如：“期末余额>0”表示只显示期末余额大于零的数据。"}
            </p>
        </div>
    {/if}
</section>
