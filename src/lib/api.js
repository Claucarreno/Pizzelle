export async function api(path, options = {}) {
  const hasBody = options.body !== undefined;
  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "No se pudo completar la solicitud.");
  return data;
}
