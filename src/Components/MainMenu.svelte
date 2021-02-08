<script lang="ts">
    import { isMenuOpen, userProfile } from "../utils/store";
    import { replace } from "svelte-spa-router";
    export let userProfileVisiable: boolean = false;
    async function logout() {
        $userProfile = await $userProfile.logout();
        userProfileVisiable = false;
        replace("/");
    }

    interface MenuItem {
        label: string;
        loginRequired?: boolean;
        href?: string;
        icon?: string;
        operRight?: string;
        subMenu?: MenuItem[];
    }
    const mainMenu: MenuItem[] = [
        { label: "报销指南", href: "onlyone" },
        {
            label: "差旅报销标准",
            subMenu: [
                {
                    label: "国内差旅住宿标准",
                    href: "hotelfee",
                    icon: "fa fa-train",
                },
                {
                    label: "国际差旅住宿标准",
                    href: "globalfee",
                    icon: "fa fa-plane",
                },
            ],
        },
        {
            label: "查询",
            loginRequired: true,
            subMenu: [
                {
                    label: "明细账查询",
                    href: "ledger",
                    icon: "fa fa-books",
                },
                {
                    label: "余额查询",
                    href: "balance",
                    icon: "fa fa-book",
                },
            ],
        },
        {
            label: "业务",
            loginRequired: true,
            subMenu: [
                {
                    label: "凭证复核",
                    href: "examer",
                    operRight: "S",
                    icon: "fa fa-scanner",
                },
                {
                    label: "后勤返还标记",
                    href: "wujinfh",
                    icon: "fa fa-highlighter",
                },
            ],
        },
        {
            label: "工作量统计",
            loginRequired: true,
            subMenu: [
                {
                    label: "部门工作量",
                    href: "workloaddept",
                    icon: "fa fa-building",
                },
                {
                    label: "个人工作量",
                    href: "workloadoper",
                    icon: "fa fa-user",
                },
            ],
        },
        {
            label: "数据检查",
            loginRequired: true,
            subMenu: [
                {
                    label: "年初余额检查",
                    href: "checkncye",
                    icon: "fa fa-tools",
                },
            ],
        },
    ];
</script>

<nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
        <a class="navbar-item" href="/">
            <img src="images/logo-navi.jpg" alt="logo" />
        </a>
        <!-- svelte-ignore a11y-missing-attribute -->
        <a
            role="button"
            class="navbar-burger"
            class:is-active={$isMenuOpen}
            aria-label="menu"
            aria-expanded="false"
            data-target="navbarMainMenu"
            on:click={() => {
                $isMenuOpen = !$isMenuOpen;
            }}
        >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
        </a>
    </div>

    <div id="navbarMainMenu" class="navbar-menu" class:is-active={$isMenuOpen}>
        <div class="navbar-start">
            {#each mainMenu.filter((m) => !m.loginRequired) as m}
                {#if !m.subMenu}
                    <a class="navbar-item" href="/#/{m.href}"> {m.label} </a>
                {:else}
                    <div class="navbar-item has-dropdown is-hoverable">
                        <!-- svelte-ignore a11y-missing-attribute -->
                        <a class="navbar-link">{m.label}</a>
                        <div class="navbar-dropdown">
                            {#each m.subMenu as m}
                                <a class="navbar-item" href="/#/{m.href}">
                                    {#if m.icon}
                                        <span class="icon mr-2 has-text-link">
                                            <i class={m.icon} />
                                        </span>
                                    {/if}
                                    {m.label}
                                </a>
                            {/each}
                        </div>
                    </div>
                {/if}
            {/each}
            {#if $userProfile.logined}
                {#each mainMenu.filter((m) => m.loginRequired) as m}
                    {#if $userProfile.userRightCheck(m.operRight)}
                        {#if !m.subMenu}
                            <a class="navbar-item" href="/#/{m.href}">
                                {m.label}
                            </a>
                        {:else}
                            <div class="navbar-item has-dropdown is-hoverable">
                                <!-- svelte-ignore a11y-missing-attribute -->
                                <a class="navbar-link">{m.label}</a>
                                <div class="navbar-dropdown">
                                    {#each m.subMenu as m}
                                        {#if $userProfile.userRightCheck(m.operRight)}
                                            <a
                                                class="navbar-item"
                                                href="/#/{m.href}"
                                            >
                                                {#if m.icon}
                                                    <span
                                                        class="icon mr-2 has-text-link"
                                                    >
                                                        <i class={m.icon} />
                                                    </span>
                                                {/if}
                                                {m.label}
                                            </a>
                                        {/if}
                                    {/each}
                                </div>
                            </div>
                        {/if}
                    {/if}
                {/each}
            {/if}
        </div>
        <div class="navbar-end">
            <div class="navbar-item">
                {#if $userProfile.logined}
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <a
                        class="button is-light is-rounded"
                        on:click={() =>
                            (userProfileVisiable = !userProfileVisiable)}
                        >{$userProfile.userName}</a
                    >
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <a class="button is-light is-rounded" on:click={logout}
                        >退出</a
                    >
                {:else}
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <a
                        class="button is-light is-rounded"
                        on:click={() => replace("/login")}>登录</a
                    >
                {/if}
            </div>
        </div>
    </div>
</nav>
