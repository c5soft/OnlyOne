<script>
    // Import the router component
    // Normally, this would be: `import Router from 'svelte-spa-router'`
    import Router from "svelte-spa-router";
    import { link } from "svelte-spa-router";
    import active from "svelte-spa-router/active";
    // Import the list of routes
    import routes from "./routes";
</script>

<style>
    /* Style for "active" links; need to mark this :global because the router adds the class directly */
    :global(a.active) {
        color: red;
    }
    /* a.active {
        color: red;
    } */
</style>

<h1>svelte-spa-router sample</h1>
<h2>Basic routing</h2>

<!-- Navigation links -->
<ul>
    <li><a href="/" use:link use:active>Home</a></li>
    <li>
        <a href="/hello/svelte" use:link use:active={'/hello/*'}>Say hi!</a>
    </li>
    <li><a href="/wild/card" use:link use:active>Wildcard route</a></li>
    <li><a href="/doc" use:link use:active>Doc</a></li>
    <li><a href="/does/not/exist" use:link use:active>Not found</a></li>
</ul>

<!-- Show the router -->
<Router {routes} />

