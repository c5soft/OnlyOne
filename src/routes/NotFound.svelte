<script lang="ts">
    import { replace } from "svelte-spa-router";
</script>

<img src="/images/404.webp" alt="404" on:click={()=>replace("/")} />