<script lang="ts">
    export let isDropDown: boolean=false;
</script>

<div class="dropdown" style="width:100%" class:is-active={isDropDown}>
    <div class="dropdown-trigger" style="width:100%">
        <div class="subtitle control has-icons-left">
            <slot name="input" />
            <span class="icon is-small is-left">
                <i class="fal fa-search" />
            </span>
        </div>
    </div>
    {#if isDropDown}
        <div class="dropdown-menu" id="dropdown-menu" role="menu">
            <div class="dropdown-content">
                <slot name="list" />
            </div>
        </div>
    {/if}
</div>
