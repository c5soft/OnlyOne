<script lang="ts">
    import { onMount } from "svelte";
    import routes from "./routes";
    import Router from "svelte-spa-router";
    import Toast from "./Components/Toast.svelte";
    import { isMenuOpen, userProfile } from "./utils/store";
    import ModalForm from "./Components/ModalForm.svelte";
    import Message from "./Components/Message.svelte";
    import MainMenu from "./Components/MainMenu.svelte";

    let userProfileVisiable = false;
    onMount(async () => {
        $isMenuOpen = false;
        $userProfile = await $userProfile.load();
    });
</script>

<MainMenu bind:userProfileVisiable />
<Router {routes} />
<ModalForm bind:isOpened={userProfileVisiable}>
    <Message bind:isOpened={userProfileVisiable} title={"本人资料"}>
        {@html $userProfile.asHtml(false)}
        <label>
            默认凭证类型：
            <select class="select" bind:value={$userProfile.defaultVoucherType}>
                <option value="01">01 东校区</option>
                <option value="02">02 西校区</option>
            </select>
        </label>
    </Message>
</ModalForm>
<Toast />
