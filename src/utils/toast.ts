import { writable, Writable } from "svelte/store";
export type ToastType = "default" | "danger" | "warning" | "info" | "success";
export interface IToastNotification {
  type: ToastType;
  msg: string;
  timeout: number;
}
export const notification: Writable<IToastNotification> = writable(null)
export function toast(msg: string, type: ToastType = "danger", timeout: number = 2000) {
  notification.set({ type, msg, timeout })
}

export function danger(msg: string, timeout: number = 2000) {
  toast(msg, "danger", timeout)
}

export function warning(msg: string, timeout: number = 2000) {
  toast(msg, "warning", timeout)
}

export function info(msg: string, timeout: number = 2000) {
  toast(msg, "info", timeout)
}

export function success(msg: string, timeout: number = 2000) {
  toast(msg, "success", timeout)
}