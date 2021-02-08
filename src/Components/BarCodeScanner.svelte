<script lang="ts">
    import { onMount } from "svelte";
    import { beep } from "../utils/tools";
    import { toast } from "../utils/toast";
    import { ImageScanner, scanImageData, Symbol } from "../zbar/index";
    import { ZBarSymbolType, ZBarConfigType } from "../zbar/enum";
    let scanner: ImageScanner = null;
    let video: HTMLVideoElement = null;
    let canvas: HTMLCanvasElement = null;
    // let footer: HTMLElement = null;
    let scanFound = false;

    const SCAN_PEROID_MS = 400;
    const FOUND_DELAY_MS = 600;

    //export let camera: Camera = null;
    export let cameraVisible: boolean = false;
    export let onRecognised = function (code: Symbol[] | string) {
        console.log("Barcode Detected:" + code);
    };

    // function handleResize() {
    //     const width = document.documentElement.clientWidth;
    //     const height = document.documentElement.clientHeight;
    //     //const video = document.getElementById("video");
    //     video.width = width;
    //     video.height = height;
    //     canvas.width = width;
    //     canvas.height = height;

    //     //const canvas = document.getElementById("canvas");
    //     // canvas.width = video.videoWidth;
    //     // canvas.height = video.videoHeight;
    //     if (width / video.videoWidth < height / video.videoHeight) {
    //         canvas.style.width = "100vw";
    //         canvas.style.height = "auto";
    //     } else {
    //         canvas.style.width = "auto";
    //         canvas.style.height = "100vh";
    //     }
    // }

    async function init() {
        //window.onresize = handleResize;
        const mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: "environment",
                width: { max: 640 },
                height: { max: 640 },
            },
        });
        //const video = document.getElementById("video");
        video.srcObject = mediaStream;
        video.setAttribute("playsinline", "");
        video.play();
        await new Promise((r) => {
            video.onloadedmetadata = r;
        });
        //handleResize();
    }

    function render(symbols: Array<Symbol>) {
        const ctx = canvas.getContext("2d");
        // const width = canvas.width;
        // const height = canvas.height;
        // ctx.clearRect(0, 0, width, height);
        // while (footer.firstChild) {
        //     footer.removeChild(footer.lastChild);
        // }
        ctx.font = "20px serif";
        ctx.strokeStyle = "#00ff00";
        ctx.fillStyle = "#ff0000";
        ctx.lineWidth = 6;
        for (let i = 0; i < symbols.length; ++i) {
            const sym = symbols[i];
            const points = sym.points;
            ctx.beginPath();
            for (let j = 0; j < points.length; ++j) {
                const { x, y } = points[j];
                if (j === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.stroke();
            ctx.fillText("#" + i, points[0].x, points[0].y - 10);
            // const div = document.createElement("div");
            // div.className = "footerItem";
            // div.innerText = `#${i}: Type: ${sym.typeName}; Value: "${sym.decode()}"`;
            // footer.appendChild(div);
        }
    }
    async function scan(): Promise<void> {
        const width = video.videoWidth;
        const height = video.videoHeight;
        // const width = video.width;
        // const height = video.height;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        try {
            const symbals = await scanImageData(imgData, scanner);
            if (symbals.length > 0) {
                beep();
                scanFound = true;
                onRecognised(symbals);
                render(symbals);
            }
        } catch (err) {
            toast("scan error: " + err, "danger", 4000);
        }
    }

    function sleep(ms: number) {
        return new Promise((r) => {
            setTimeout(r, ms);
        });
    }

    async function loopScan() {
        try {
            await init();
            while (cameraVisible) {
                if (video) await scan();
                else break;
                await sleep(SCAN_PEROID_MS + (scanFound ? FOUND_DELAY_MS : 0));
                scanFound = false;
            }
        } catch (err) {
            //toast("loop scan error: " + err, "danger", 4000);
            console.error("loop scan error: " + err);
        }
    }

    onMount(async () => {
        // handleResize();
        scanner = await ImageScanner.create("/wasm/zabr.wasm");
        scanner.setConfig(
            ZBarSymbolType.ZBAR_NONE,
            ZBarConfigType.ZBAR_CFG_ENABLE,
            0
        );
        [
            ZBarSymbolType.ZBAR_QRCODE,
            ZBarSymbolType.ZBAR_CODE128,
            ZBarSymbolType.ZBAR_EAN13,
            ZBarSymbolType.ZBAR_EAN8,
        ].forEach((x) =>
            scanner.setConfig(x, ZBarConfigType.ZBAR_CFG_ENABLE, 1)
        );
        console.log("scanner created");
        if (cameraVisible) {
            console.log("start loopScan", Date.now());
            await loopScan();
        }

        return () => {
            console.log("scanner destroyed");
            scanner.destroy();
        };
    });
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<div id="camera">
    <video class="camera video" bind:this={video} />
    <canvas class="camera canvas" bind:this={canvas} />
    <div class="camera scanner" />
    <!-- <div bind:this={footer}></div> -->
</div>

<style>
    /*手机*/
    @media screen and (max-width: 600px) {
        .camera {
            width: 94vw;
            height: auto;
            display: block;
            position: absolute;
        }
        @-webkit-keyframes scan {
            0% {
                top: 30%;
            }
            100% {
                top: 98%;
            }
        }
        @keyframes scan {
            0% {
                top: 30%;
            }
            100% {
                top: 98%;
            }
        }
    }
    /*平板*/
    @media screen and (min-width: 600px) and (max-width: 960px) {
        .camera {
            width: 600px;
            height: auto;
            display: block;
            position: absolute;
        }
        @-webkit-keyframes scan {
            0% {
                top: 10%;
            }
            100% {
                top: 80%;
            }
        }
        @keyframes scan {
            0% {
                top: 10%;
            }
            100% {
                top: 80%;
            }
        }
    }
    /*PC*/
    @media screen and (min-width: 960px) {
        .camera {
            width: 800px;
            height: auto;
            display: block;
            position: absolute;
        }
        @-webkit-keyframes scan {
            0% {
                top: 10%;
            }
            100% {
                top: 75%;
            }
        }
        @keyframes scan {
            0% {
                top: 10%;
            }
            100% {
                top: 75%;
            }
        }
    }
    /* .camera {
        width: 94vw;
        height: auto;
        display: block;
        position: absolute;
    } */
    .video {
        border: blue solid 1px;
        z-index: 1000;
    }
    .canvas {
        border: red solid 1px;
        z-index: 1001;
    }

    /* body {
        align-items: center;
        background: #333;
        display: flex;
        height: 100vh;
        padding: 2em 0;
        justify-content: center;
    }
    .container {
        align-items: flex-start;
        display: flex;
        height: 100%;
        justify-content: center;
        width: 50%;
    }
    .paper {
        align-items: center;
        background: white;
        box-shadow: 0 0 15px black;
        display: flex;
        height: 300px;
        justify-content: center;
        position: relative;
        width: 50%;
        z-index: 1;
    } */
    .scanner {
        -webkit-animation: scan 2s linear alternate infinite;
        animation: scan 2s linear alternate infinite;
        background-color: rgb(220, 220, 220);
        box-shadow: 0 0 4px rgb(156, 156, 156);
        height: 2px;
        z-index: 1002;
    }
</style>
