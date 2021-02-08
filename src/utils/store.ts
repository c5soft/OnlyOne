import { writable, Writable } from "svelte/store";
import { UserProfile } from "./userProfile";
export const isMenuOpen: Writable<boolean> = writable(false);
export const userProfile: Writable<UserProfile> = writable(new UserProfile("TCMate"));