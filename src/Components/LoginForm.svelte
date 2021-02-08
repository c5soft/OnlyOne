<script lang="ts">
    import { userProfile } from "../utils/store";
    import { replace } from "svelte-spa-router";
    import Message from "./Message.svelte";
    import { toast } from "../utils/toast";

    let id: string = "";
    let password: string = "";
    let captcha: string = "";
    let msg = "";
    let msgOpened = false;
    let displayTimeMs = 2000;
    async function login(e: Event) {
        $userProfile = await $userProfile.login(id, password, captcha);
        if ($userProfile.logined) replace($userProfile.homePage);
        else {
            toast($userProfile.msg);//, "success", displayTimeMs);
            //danger($userProfile.msg);
            //msg = $userProfile.msg;
            //msgOpened = true;
        }
    }
</script>

<div class="content columns m-5">
    <form class="form column is-narrow" on:submit|preventDefault={login}>
        <div class="control has-icons-left field">
            <input
                class="input is-rounded"
                type="text"
                placeholder="用户名"
                required
                on:change={() => (msgOpened = false)}
                bind:value={id} />
            <span class="icon is-small is-left">
                <i class="fal fa-user" />
            </span>
        </div>
        <div class="control has-icons-left field">
            <input
                class="input is-rounded"
                type="password"
                placeholder="密码"
                on:change={() => (msgOpened = false)}
                bind:value={password} />
            <span class="icon is-small is-left">
                <i class="fal fa-key" />
            </span>
        </div>
        <div class="control field">
            <button class="button is-rounded" type="submit">登录</button>
            <button
                class="button is-rounded ml-2"
                type="reset"
                on:click={() => (msgOpened = false)}>清空</button>
        </div>
    </form>
    <div class="column is-narrow">
        {#if msgOpened}
            <Message title="登录失败" bind:isOpened={msgOpened}>
                {@html msg}
            </Message>
        {/if}
    </div>
</div>
