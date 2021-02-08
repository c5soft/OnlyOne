<script lang="ts">
    export let isOpened = false;
    export let title: string = "";
</script>

<article class="message is-info content">
    <div class="message-header">
        <h4 class="mb-0 has-text-dark">{title}</h4>
        <button
            on:click={() => (isOpened = false)}
            class="delete"
            aria-label="delete" />
    </div>
    <div class="message-body">
        <slot />
    </div>
</article>
