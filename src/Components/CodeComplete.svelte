<script lang="ts">
    export let label: string = "项目：";
    export let value: string = "";
    export let placeholder: string = "编号或名称简拼，或用逗号";
    export let reExtract: RegExp = /\d{4}-\d{8}/;
    export let reDropDown: RegExp = /[a-z]{2,}$|\d+\*$|\d+\?$/i;
    export let fetchCode = async function (params: any): Promise<string[]> {
        return [];
    }
    let isDropDown: boolean;
    $:isDropDown = value.length > 0 && reDropDown.test(value);

    function findLastPos(old: string): number {
        let posComma = old.lastIndexOf(",");
        let posPlus = old.lastIndexOf("+");
        return posComma > posPlus ? posComma : posPlus;
    }

    function preProc(old: string): string {
        let pos = findLastPos(old);
        let result = pos >= 0 ? old.slice(pos + 1) : old;
        console.log(old, result);
        return result;
    }

    function postProc(old: string, val: any) {
        console.log("old=", old, "new=", val);
        let pos = findLastPos(old);
        if (Array.isArray(val)) val = val[0];
        return pos >= 0 ? old.slice(0, pos + 1) + val : val;
    }


</script>

<div class="tile columns m-0 p-0">
    <div class="column m-0 p-0 is-narrow"> {label}</div>
    <div class="column m-0 p-0">
        <div class="dropdown" style="width:100%" class:is-active={isDropDown}>
            <div class="dropdown-trigger" style="width:100%">
<!--                <div class="subtitle control has-icons-left">-->
                    <input
                            class="input"
                            type="text"
                            placeholder={placeholder}
                            bind:value={value}
                    />
<!--                    <span class="icon is-small is-left"><i class="fal fa-search"/></span>-->
<!--                </div>-->
            </div>
            {#if isDropDown}
                <div class="dropdown-menu" role="menu">
                    <div class="dropdown-content">
                        <div>
                            {#await fetchCode({type: label.replace("：", ""), code: preProc(value),})}
                                Waiting...
                            {:then words}
                                {#each words as word (word)}
                                    <button
                                            class="button is-rounded"
                                            on:click={(e) => {
                                                value = postProc(
                                                    value,
                                                    reExtract?e.target.innerText.match(reExtract):e.target.innerText
                                                );
                                            }}>{word}</button
                                    >
                                {/each}
                            {/await}
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
