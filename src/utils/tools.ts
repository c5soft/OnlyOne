import { base16Encode } from "./base16";

// declare global {
//     interface Window {
//         beepSound: HTMLMediaElement | undefined;
//     }
// }


let beepSound: HTMLMediaElement = null;
export function beep() {
    if (!beepSound) {
        beepSound = new Audio('/sound/beep.wav');
    }
    beepSound.pause();
    beepSound.currentTime = 0;
    beepSound.play();
}

export async function fetchAskData(ask: string, params: object): Promise<any> {
    let paramsStr = JSON.stringify(params);
    let qs = "ask=" + ask + "&params=" + base16Encode(paramsStr);
    let response = await fetch("/api/ask?" + qs);
    return await response.json();
}

export async function fetchActData(act: string, params: object): Promise<any> {
    let paramsStr = JSON.stringify(params);
    let response = await fetch("/api/act", {
        method: "POST",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:"act=" + act + "&params=" + base16Encode(paramsStr)
    });
    return await response.json();
}
