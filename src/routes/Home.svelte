<script lang="ts">
    let url: string;
    let html: string = "";
    async function fetchSth(url: string): Promise<string> {
        let response = await fetch(url, {
            method: "GET",
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "text/plain",
            },
            mode: "no-cors",
        });
        html = await response.text();
        return html;
    }
</script>

<section class="content m-5">
    <img src="/images/logo.jpg" alt="logo" />
</section>
