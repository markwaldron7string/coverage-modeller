"use client";

import { useEffect } from "react";
import { useScenarioStore } from "@/store/scenarioStore";
import { encodeState, decodeState } from "@/lib/urlState";

/**
 * Keeps the URL and the store in sync. Renders nothing.
 *
 * Runs only on the client (inside an effect), so it is SSR-safe: the server and
 * the first client render both use the store's defaults, avoiding a hydration
 * mismatch, and the URL takes over once mounted.
 */
export function UrlStateSync() {
  useEffect(() => {
    // 1. Load direction: hydrate the store from the URL on first mount.
    const params = new URLSearchParams(window.location.search);
    if (Array.from(params.keys()).length > 0) {
      const { policyA, policyB } = decodeState(params);
      useScenarioStore.getState().hydrate(policyA, policyB);
    }

    // 2. Save direction: mirror the store back into the URL.
    const writeUrl = () => {
      const { policyA, policyB } = useScenarioStore.getState();
      const query = encodeState(policyA, policyB);
      // replaceState (not pushState) so dragging a slider doesn't flood history.
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?${query}`,
      );
    };
    writeUrl(); // reflect current state immediately (also self-heals invalid params)

    return useScenarioStore.subscribe(writeUrl);
  }, []);

  return null;
}
