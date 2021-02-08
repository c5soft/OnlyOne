<script lang="ts">
    import {onMount, afterUpdate} from "svelte";
    import type {Grid, GridOptions, GridParams, FirstDataRenderedEvent} from "ag-grid-community";
    import {AG_GRID_LOCALE_CN} from "../utils/agGridLocaleText";

    export let options: GridOptions = null;
    export let theme: string = "fresh";
    export let params: GridParams = null;
    let grid: Grid = null;
    let gridNode: HTMLElement;

    function createGrid() {
        options.localeText = AG_GRID_LOCALE_CN;
        options.enableCharts = true;
        options.onFirstDataRendered = (e: FirstDataRenderedEvent) => {
            e.columnApi.autoSizeAllColumns(false);
        };
        return new (<any>window).agGrid.Grid(gridNode, options, params);
    }

    type OnloadEvent = () => void;

    function loadStyle(id: string, onload: OnloadEvent = null) {
        if (!document.getElementById(id)) {
            const link = document.createElement("link");
            link.id = id;
            link.rel = "stylesheet";
            link.href = "/styles/" + id + ".min.css";
            if (onload) link.onload = onload;
            document.head.appendChild(link);
        }
    }

    onMount(() => {
        loadStyle("ag-grid");
        loadStyle("ag-theme-" + theme);
        return () => {
            if (grid) {
                grid.destroy()
                grid = null;
            }
        };
    });
    afterUpdate(() => {
        if (grid) grid.destroy();
        grid = createGrid();
    });
</script>

<div class={"ag-theme-" + theme} style="width:100%;height:100%" bind:this={gridNode}></div>
