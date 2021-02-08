// Initialize the Svelte app and inject it in the DOM
import App from './App.svelte'

(<any>window).agGrid.LicenseManager.setLicenseKey(
    "agGrid_MTg5NjA0ODAwMDAwMA==1c4f09efcabdc6cc4a167e1dd8d614fb"
);


const app = new App({
    target: document.body
})

export default app
