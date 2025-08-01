import { captionThing } from "./data.ts";

export function getRandomCaption() {
    return captionThing[Math.floor(Math.random() * captionThing.length)];
}