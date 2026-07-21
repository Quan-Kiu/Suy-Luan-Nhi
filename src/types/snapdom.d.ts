import "@zumer/snapdom";

declare module "@zumer/snapdom" {
  interface SnapdomOptions {
    clip?: "viewport" | { x: number; y: number; width: number; height: number };
  }
}
