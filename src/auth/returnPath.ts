// After signing in, the customer goes back to the page that sent them to the login screen.
// Only same-site paths are accepted, and never the login or sign-up pages themselves.
export function returnPathFrom(state: unknown): string {
  const from =
    state && typeof state === "object" && "from" in state
      ? (state as { from: unknown }).from
      : null;
  if (typeof from !== "string") return "/";
  if (!from.startsWith("/") || from.startsWith("//")) return "/";
  if (from === "/login" || from === "/signup") return "/";
  return from;
}
