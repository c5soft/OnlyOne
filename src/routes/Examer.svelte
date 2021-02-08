<script lang="ts">
    import { onMount, beforeUpdate } from "svelte";
    import { replace } from "svelte-spa-router";
    import { toast } from "../utils/toast";
    import { formatDate } from "../utils/date";
    import { isMenuOpen, userProfile } from "../utils/store";
    import { AboutVoucher, OpenedVoucher } from "../utils/examer";
    import { Rowset } from "../utils/rowset";
    import { fetchActData } from "../utils/tools";
    import type { Symbol } from "../zbar/index";
    import BarCodeScannder from "../Components/BarCodeScanner.svelte";
    import AgGrid from "../Components/AgGrid.svelte";
    import BarCodeScanner from "../Components/BarCodeScanner.svelte";
    let codes: string[] = [];
    let abouts: AboutVoucher[] = [];
    let openedVouchers: OpenedVoucher[] = [];
    let find: string = "";
    let msgs: string[] = [];
    let scanner: HTMLInputElement;
    let cameraVisible: boolean = false;
    let examEnabledAbouts: AboutVoucher[] = [];
    let unexamEnabledAbouts: AboutVoucher[] = [];

    function onCameraRecognised(symbols: Symbol[] | string) {
        let values: string[] =
            typeof symbols === "string"
                ? [symbols as string]
                : (symbols as Symbol[]).map((x) => x.decode());
        values.forEach((code) => {
            if (!codes.find((x) => x === code)) {
                codes.push(code);
            }
        });
        codes = [...codes];
    }
    async function examVouchers(e: Event) {
        let isUndo = (<any>e.target).id === "undo";
        let act = "exam";
        let params = {
            ids: (isUndo ? unexamEnabledAbouts : examEnabledAbouts)
                .map((x) => x.id)
                .join(","),
            fhr: $userProfile.userName,
            fhrId: $userProfile.userId,
            isUndo,
        };
        let result = await fetchActData(act, params);
        let now = formatDate(new Date(), "yyyy-MM-dd hh:mm:ss");
        let msg = "";
        if (result.msg === "ok") {
            let rowset = new Rowset(result.data);
            let doneIds = rowset.rows.map((x) => x[0]);
            abouts = abouts.filter(
                (a) => doneIds.findIndex((d) => d === a.id) === -1
            );
            msg = `<p> ${now} ${isUndo ? "成功取消复核" : "成功复核"}${doneIds.length}张凭证：${doneIds.join(", ")}</p>`;
        } else {
            msg = `<p class="has-text-danger"> ${now} ${result.msg}</p>`;
        }
        msgs = [...msgs, msg];
    }
    function deleteAbout(id: string) {
        closeVoucher(id);
        abouts = [...abouts.filter((v) => v.id !== id)];
        scanner.focus();
    }
    async function openVoucher(id: string) {
        if (!openedVouchers.find((x) => x.id === id)) {
            openedVouchers = [...openedVouchers, new OpenedVoucher(id)];
        }
        scanner.focus();
    }
    async function closeVoucher(id: string) {
        if (openedVouchers.find((x) => x.id === id)) {
            openedVouchers = [...openedVouchers.filter((x) => x.id !== id)];
        }
        scanner.focus();
    }
    async function codes2Abouts() {
        let changed=false;
        while (codes.length > 0) {
            let id = codes.pop();
            if (!abouts.find((v) => v.id === id)) {
                let v = new AboutVoucher(id, $userProfile.userName);
                await v.getAbout();
                if (v.shouldBeDeleted()) toast(v.id + v.msg);
                else abouts.push(v);
                changed=true;
            }
        }
        if (changed) abouts = [...abouts];
    }

    async function scannerInputed(e: any) {
        if (e.key === "Enter" && find.length > 0) {
            let id = find;
            find = "";
            if (id.length<=5) {
                let ym=formatDate(new Date(),"yyMM");
                id=ym+$userProfile.defaultVoucherType+("00000"+id).slice(-5);
            } else if (id.length<=7) {
                let ym=formatDate(new Date(),"yyMM");
                id=ym+("00"+id).slice(-7);
            } else if (id.length<=9) {
                let yy=formatDate(new Date(),"yy");
                id=yy+("00"+id).slice(-9);
            }
            onCameraRecognised(id);
        }
    }
    // async function appendVoucher(id: string): Promise<void> {
    //     if (!abouts.find((v) => v.id === id)) {
    //         let v = new AboutVoucher(id, $userProfile.userName);
    //         abouts.push(v);
    //         abouts = [...abouts];
    //         v = abouts.find((v) => v.id === id);
    //         await v.getAbout();
    //         if (v.shouldBeDeleted()) toast(v.id + v.msg);
    //         abouts = [...abouts.filter((v) => !v.shouldBeDeleted())];
    //     }
    // }

    onMount(() => {
        $isMenuOpen = false;
        if (!$userProfile.logined) replace("/");
        else {
            scanner.focus();
        }
    });
    beforeUpdate(async () => {
        await codes2Abouts();
        let changed = false;
        for (let i = 0; i < openedVouchers.length; i++) {
            let v = openedVouchers[i];
            if (!v.loaded) {
                await v.load();
                changed = true;
            }
        }
        if (changed) openedVouchers = [...openedVouchers];
    });

    $: {
        examEnabledAbouts = abouts.filter(
            (v) => !v.isExamed() && v.jcjg.length === 0
        );
        unexamEnabledAbouts = abouts.filter(
            (v) => v.isExamed() && v.isSelfExamed() && !v.isCashed()
        );
    }
</script>

<svelte:head>
    <title>凭证复核</title>
</svelte:head>
<section class="content ml-5 mt-0">
    <div style="display:flex;align-items:flex-end;">
        <span class="is-size-4 has-text-weight-bold">凭证复核</span>
        {#if cameraVisible}
            <span
                class="icon"
                on:click={() => {
                    cameraVisible = !cameraVisible;
                }}
            >
                <span class="fa-stack fa-lg ml-4 mb-2">
                    <i class="fal fa-camera fa-stack-1x" />
                    <i class="fal fa-ban  fa-stack-1x has-text-danger" />
                </span>
            </span>
            <span class="ml-2" />
        {:else}
            <span
                class="icon is-small ml-4 mb-2"
                on:click={() => {
                    cameraVisible = !cameraVisible;
                }}
            >
                <!-- svelte-ignore a11y-missing-attribute -->
                <!-- svelte-ignore a11y-missing-content -->
                <a class="fa fa-camera fa-lg " />
            </span>
        {/if}
        <button
            class="button ml-4 p-1 mb-1 has-text-danger"
            style="height:24px;border-color:red;padding-top:0"
            id="do"
            disabled={examEnabledAbouts.length === 0}
            on:click={examVouchers}
        >
            复核
            {#if examEnabledAbouts.length > 0}
                <span class="badge is-top-right is-link"
                    >{examEnabledAbouts.length}</span
                >
            {/if}
        </button>
        <button
            class="button ml-2 p-1 mb-1 has-background-dark has-text-white"
            style="height:24px;padding-top:0"
            id="undo"
            disabled={unexamEnabledAbouts.length === 0}
            on:click={examVouchers}
        >
            取消复核
            {#if unexamEnabledAbouts.length > 0}
                <span class="badge is-top-right is-link"
                    >{unexamEnabledAbouts.length}</span
                >
            {/if}
        </button>
        <button
            class="button ml-2 p-1 mb-1"
            style="height:24px;padding-top:0"
            disabled={abouts.length === 0}
            on:click={() => (abouts = [])}
        >
            清除
        </button>
    </div>
    <div class="columns">
        <div class="column is-2">
            <div class="subtitle control has-icons-left">
                <input
                    class="input is-rounded"
                    type="text"
                    placeholder="扫描凭证二维码"
                    bind:value={find}
                    bind:this={scanner}
                    on:keypress={scannerInputed}
                />
                <span class="icon is-small is-left">
                    <i class="fal fa-scanner" />
                </span>
            </div>
        </div>
        {#if cameraVisible}
            <div class="column m-0 p-0">
                <BarCodeScanner
                    bind:cameraVisible
                    onRecognised={onCameraRecognised}
                />
            </div>
        {/if}
    </div>
    <div class="content">
        {#if codes.length === 0 && abouts.length === 0}
            <span>请输入凭证内码，建议用条码枪扫描。手机可以按</span><span
                class="icon is-small mx-2"
                on:click={() => {
                    cameraVisible = !cameraVisible;
                }}
            >
                <!-- svelte-ignore a11y-missing-attribute -->
                <!-- svelte-ignore a11y-missing-content -->
                <a class="fa fa-camera" />
            </span><span>启动手机摄像头扫描。</span>
        {:else}
            <div class="box m-0 mb-2 p-0" style="display:flex;flex-wrap:wrap">
                {#each abouts as v (v.id)}
                    <div
                        class="is-size-5 box button p-0 m-0 ml-4 mt-2 {v.tooltipClass()}"
                        class:examed={v.isExamed()}
                        class:disabled={v.isDisabled()}
                        class:cashed={v.isCashed()}
                        style="width:180px;height:32px"
                        data-tooltip={v.tooltipMsg()}
                        on:click={async () => {
                            await openVoucher(v.id);
                        }}
                    >
                        {#if v.de >= 10}
                            <span class="badge is-top-left is-danger"
                                >{v.de}</span
                            >
                        {/if}
                        {#if v.jcjg}
                            <span class="badge is-bottom-left is-danger">!</span
                            >
                        {/if}
                        {#if v.fx >= 1}
                            <span class="badge is-top is-link">{v.fx}</span>
                        {/if}
                        {@html v.asHtml()}
                        <span
                            class="fa fa-times-circle delete"
                            style="float:right"
                            on:click={() => deleteAbout(v.id)}
                        />
                    </div>
                {/each}
            </div>
        {/if}
        {#if msgs.length > 0}
            <article class="message box is-link m-0 p-0">
                <div class="message-header p-1 m-0">
                    <p>消息</p>
                    <button
                        class="delete"
                        aria-label="delete"
                        on:click={() => (msgs = [])}
                    />
                </div>
                <div class="message-body">
                    {#each msgs as msg}
                        {@html msg}
                    {/each}
                </div>
            </article>
        {/if}
        {#each openedVouchers as v (v.id)}
            <div class="columns">
                <div class="column is-full box" style={v.style()}>
                    <span
                        class="fa fa-times-circle delete"
                        style="float:right"
                        on:click={() => closeVoucher(v.id)}
                    />
                    {#if v.loaded}
                        <AgGrid options={v.options} />
                    {:else}
                        {v.msg}
                    {/if}
                </div>
            </div>
        {/each}
    </div>
</section>

<style>
    .examed {
        border: red solid 1px;
    }
    .disabled {
        background-color: rgb(200, 200, 200);
    }
    .cashed {
        color: red;
    }
</style>
