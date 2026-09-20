export async function readJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    const reason =
      response.status === 404
        ? "Endpoint not found on the server (HTTP 404)."
        : `Server returned HTML instead of JSON (HTTP ${response.status}).`;
    throw new Error(
      `${reason} The backend may be down, outdated, or misconfigured.`,
    );
  }
}