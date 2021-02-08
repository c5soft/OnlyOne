//migrated from https://www.npmjs.com/package/easy-js-camera

interface CameraDevice {
    deviceId: string;
    label: string;
    kind?: string;
}

//import CameraModel from "./CameraModel";
export class CameraModel {
    id: string;
    label: string;
    constructor(camera: CameraDevice) {
        this.id = camera.deviceId;
        this.label = camera.label;
    }
}

export class Constraints {
    video: any;
    audio: any;
    constructor() {
        this.video = {
            facingMode: 'user'
        };
        this.audio = false;
    }
    switchFacingMode(tryAgain = false) {
        if (this.video.facingMode === 'user') {
            this.video.facingMode = 'environment';
        } else if (tryAgain) {
            this.video.facingMode = {
                exact: 'environment'
            }
        } else {
            this.video.facingMode = 'user';
        }
        return this;
    }
    getConstraint() {
        return {
            video: this.video,
            audio: this.audio
        }
    }
}

export class Camera {
    devices: CameraModel[];
    stream: any;
    canvasElement: HTMLCanvasElement;
    videoElement: HTMLVideoElement;
    constraints: Constraints;
    started: boolean;
    constructor(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
        this.devices = [];
        this.stream = null;
        this.canvasElement = canvas;
        this.videoElement = video;
        this.constraints = new Constraints();
        this.started = false;
    }
    async getDevices(): Promise<CameraModel[]> {
        if (this.devices.length > 0) {
            return this.devices;
        }
        try {
            let devices: CameraDevice[] = await navigator.mediaDevices.enumerateDevices();
            devices.forEach(device => {
                if (device.kind && device.kind.toLocaleLowerCase() === 'videoinput')
                    this.devices.push(new CameraModel(device));
            });
            return this.devices;
        } catch (error) {
            console.error('GetDevices', error);
            throw error;
        }
    }
    setVideoConstraints(videoConstraints) {
        if (!this.constraints) {
            this.constraints = new Constraints();
        }
        this.constraints.video = videoConstraints;
        return this;
    }
    snap() {
        this.canvasElement.width = this.videoElement.videoWidth;
        this.canvasElement.height = this.videoElement.videoHeight;
        let context = this.canvasElement.getContext('2d');
        context.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
        return this.canvasElement;
    }
    /**
     * @return String
     */
    snapAsDataUrl() {
        this.snap();
        let data = this.canvasElement.toDataURL('image/png');
        return data;
    }
    /**
     * @return Promise
     */
    snapAsBlob() {
        this.snap();
        return new Promise((resolve) => {
            this.canvasElement.toBlob((blob) => {
                resolve(blob);
            }, 'image/png', 1);
        });
    }
    async start() {
        try {
            await this.getDevices();
            let stream = await navigator.mediaDevices.getUserMedia(this.constraints.getConstraint());
            this.videoElement.srcObject = stream;
            this.stream = stream;
            this.started = true;
        }
        catch (error) {
            console.error('StartCamera', error);
            //throw error;
        }
    }
    stop() {
        this.started = false;
        if (!this.stream) return;
        let tracks = (this.videoElement.srcObject as any).getTracks();
        console.dir(tracks);
        tracks.forEach(track => track.stop());
    }
    switch(tryAgain = false) {
        return new Promise(async (resolve: (value?: any) => void, reject: (reason?: any) => void) => {
            this.constraints = this.constraints.switchFacingMode(tryAgain);
            this.stop();
            try {
                await this.start();
                resolve();
            }
            catch (error) {
                console.error('SwitchCamera', error);
                reject(error);
            }
        });
    }

    static isCameraSupported() {
        return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    }
    static async tryInvokePermission(video: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<Camera> {
        await navigator.mediaDevices.getUserMedia(new Constraints());
        return new Camera(video, canvas);
    }
}
