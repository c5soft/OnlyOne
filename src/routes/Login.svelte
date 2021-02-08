<script lang="ts">
    import { onMount } from "svelte";
    import { isMenuOpen } from "../utils/store";
    import LoginForm from "../Components/LoginForm.svelte";
    onMount(async () => {
        $isMenuOpen = false;
    });
</script>

<svelte:head>
    <title>登录</title>
</svelte:head>

<LoginForm />
