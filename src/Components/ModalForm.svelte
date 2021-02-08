<script lang="ts">
    export let isOpened: boolean;
</script>

<div class="modal" class:is-active={isOpened}>
    <div class="modal-background" />
    <div class="modal-content">
        <slot />
    </div>
    <button
        on:click={() => (isOpened = false)}
        class="modal-close is-large"
        aria-label="close" />
</div>
