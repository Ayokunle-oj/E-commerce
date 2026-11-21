import { lazy } from "react";
import type { ComponentType } from "react";
import { isChunkLoadError } from "./isChunkLoadError";

const RELOAD_FLAG = "quikit-chunk-reload";

// Returns true only the first time, so a missing file can never cause a reload loop.
// If session storage is blocked we cannot remember the reload, so we do not reload.
function markReload(): boolean {
  try {
    if (sessionStorage.getItem(RELOAD_FLAG) === "1") return false;
    sessionStorage.setItem(RELOAD_FLAG, "1");
    return true;
  } catch {
    return false;
  }
}

function clearReloadMark(): void {
  try {
    sessionStorage.removeItem(RELOAD_FLAG);
  } catch {
    // Nothing to clear if storage is blocked.
  }
}

// Same as React.lazy, but when the file fails to load it reloads the page once
// (a reload fetches the new file names after a deploy). If it fails again, the
// error goes to the nearest ErrorBoundary, which shows a retry screen.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithRetry<T extends ComponentType<any>>(
  load: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      const module = await load();
      clearReloadMark();
      return module;
    } catch (error) {
      if (isChunkLoadError(error) && markReload()) {
        window.location.reload();
        // Keep the Suspense loading state on screen while the page reloads.
        return new Promise<{ default: T }>(() => {});
      }
      throw error;
    }
  });
}
