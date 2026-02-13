import type { Router } from "oak";
import { extractYaml } from "@std/front-matter";
import type { ResumeFrontMatter } from "../types.ts";

type ResumeRouteOptions = {
  resumeFile: URL;
};

export const registerResumeRoutes = (
  router: Router,
  options: ResumeRouteOptions,
) => {
  const { resumeFile } = options;

  router.get("/resume", async (ctx) => {
    try {
      const content = await Deno.readTextFile(resumeFile);
      const { attrs } = extractYaml<ResumeFrontMatter>(content);
      ctx.response.body = attrs;
    } catch (err) {
      console.error(
        "could not read resume file:",
        err instanceof Error ? err.message : String(err),
      );
      ctx.throw(
        err instanceof Deno.errors.NotFound ? 404 : 500,
        "Internal Server Error",
      );
    }
  });
};
