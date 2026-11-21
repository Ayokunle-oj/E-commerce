// A lazy-loaded file that cannot be fetched (bad connection, or a stale file name
// after a new deploy) fails with one of these messages, depending on the browser.
const CHUNK_ERROR =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Loading chunk [\w-]+ failed|Loading CSS chunk/i;

export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.name === "ChunkLoadError" || CHUNK_ERROR.test(error.message);
}
