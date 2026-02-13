import type { Router } from "oak";
import { COMPARE_URL } from "../constants.ts";

export const registerBuildInfoRoutes = (router: Router) => {
  router.get("/build-info", (ctx) => {
    const gitCommit = Deno.env.get("GIT_COMMIT") || "HEAD";
    const gitTag = Deno.env.get("GIT_TAG") || "";
    const latestTag = Deno.env.get("LATEST_TAG") || "v1.0.0";

    ctx.response.body = {
      gitCommit: gitCommit,
      compareUrl: `${COMPARE_URL}/${latestTag}...${gitCommit}`,
      gitTag: gitTag,
    };
  });
};
