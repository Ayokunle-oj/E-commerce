import { useSyncExternalStore } from "react";
import { getGreeting } from "../utils/greeting";

// Re-check every minute and when the tab comes back into view,
// so the greeting changes by itself at noon, in the evening and at midnight.
function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 60_000);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener("visibilitychange", onChange);
  };
}

interface UseGreetingOptions {
  birthday?: string;
  justSignedIn?: boolean;
}

export function useGreeting({
  birthday,
  justSignedIn,
}: UseGreetingOptions = {}) {
  return useSyncExternalStore(subscribe, () =>
    getGreeting({ birthday, justSignedIn }),
  );
}
