export function detectOS() {
  const sUserAgent = navigator.userAgent;

  const isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows");
  const isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
  if (isMac) return "Mac";
  const isUnix = (navigator.platform == "X11") && !isWin && !isMac;
  if (isUnix) return "Unix";
  const isLinux = (String(navigator.platform).indexOf("Linux") > -1);

  const bIsAndroid = (sUserAgent.toLowerCase().match(/android/i) || [''])[0] === "android";
  if (isLinux) {
    if (bIsAndroid) return "Android";
    else return "Linux";
  }
  if (isWin) {
    const isWin2K = sUserAgent.indexOf("Windows NT 5.0") > -1 || sUserAgent.indexOf("Windows 2000") > -1;
    if (isWin2K) return "Win2000";
    const isWinXP = sUserAgent.indexOf("Windows NT 5.1") > -1 ||
      sUserAgent.indexOf("Windows XP") > -1;
    if (isWinXP) return "WinXP";
    const isWin2003 = sUserAgent.indexOf("Windows NT 5.2") > -1 || sUserAgent.indexOf("Windows 2003") > -1;
    if (isWin2003) return "Win2003";
    const isWinVista = sUserAgent.indexOf("Windows NT 6.0") > -1 || sUserAgent.indexOf("Windows Vista") > -1;
    if (isWinVista) return "WinVista";
    const isWin7 = sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1;
    if (isWin7) return "Win7";
    const isWin10 = sUserAgent.indexOf("Windows NT 10") > -1;
    if (isWin10) return "Win10";
  }
  return "Other";
}
export default function browserInfo() {
  const sys = { browser: "", ver: "", os: "", isPC: true };
  const ua = navigator.userAgent.toLowerCase();
  const m = ua.match(/(msie|edge).*?([\d.]+)/) || ua.match(/(chrome|firefox|opera|safari|version).*?([\d.]+)/) || ["", "", ""];
  sys.browser = m[1].replace(/version/, "safari");
  sys.ver = m[2];
  sys.os = detectOS();
  sys.isPC = sys.os.search('Win') !== -1;
  return sys;
}
const bi = browserInfo();
const isPC = bi.isPC, os = bi.os, browser = bi.browser;
export { isPC, browser, os };

export function isFullScreen() {
  return document.fullscreenElement;
}
export function toggleFullScreen() {
  if (!isFullScreen()) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}