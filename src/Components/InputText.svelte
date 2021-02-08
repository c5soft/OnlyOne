<script lang="ts">
    export let label: string = "";
    export let value: string = "";
    export let placeholder: string = "编号或名称简拼，或用逗号";
</script>
<div class="tile columns m-0 p-0">
    <div class="column m-0 p-0 is-narrow">{label}</div>
    <div class="column m-0 p-0"
    ><input
            class="input"
            type="text"
            placeholder={placeholder}
            bind:value={value}
    /></div
    >
</div>