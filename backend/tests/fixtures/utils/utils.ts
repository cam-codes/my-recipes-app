import { Application } from "oak";

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: HeadersInit;
};

// Utility to perform HTTP-like requests
export async function request(
  app: Application,
  url: string,
  options: RequestOptions = {},
) {
  const { method = "GET", body, headers } = options;
  const finalHeaders = new Headers(headers);
  let finalBody: string | undefined;

  if (body !== undefined) {
    finalBody = typeof body === "string" ? body : JSON.stringify(body);
    if (!finalHeaders.has("content-type")) {
      finalHeaders.set("content-type", "application/json");
    }
  }

  const req = new Request(`http://localhost${url}`, {
    method,
    headers: finalHeaders,
    body: finalBody,
  });
  const resp = await app.handle(req);
  const text = await resp?.text();
  return { status: resp?.status, body: text };
}
