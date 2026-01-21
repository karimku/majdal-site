export async function handler(event) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ok: true,
      message: "Netlify Functions are working ✅",
      method: event.httpMethod,
      path: event.path,
      time: new Date().toISOString(),
    }),
  };
}
