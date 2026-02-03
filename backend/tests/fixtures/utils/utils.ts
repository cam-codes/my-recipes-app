import { Application } from "oak";

// Utility to perform HTTP-like requests
export async function request(app: Application, url: string, method = "GET") {
  const req = new Request(`http://localhost${url}`, { method });
  const resp = await app.handle(req);
  const body = await resp?.text();
  return { status: resp?.status, body };
}
