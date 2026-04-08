import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { fetchJiraSearch, isJiraConfigured } from "./server/jira/fetchIssues.ts";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      {
        name: "jira-api-dev",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const pathname = req.url?.split("?")[0];
            if (pathname !== "/api/jira/search") {
              next();
              return;
            }
            if (req.method !== "GET") {
              res.statusCode = 405;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Method not allowed" }));
              return;
            }

            const jiraEnv = {
              JIRA_BASE_URL: env.JIRA_BASE_URL,
              JIRA_EMAIL: env.JIRA_EMAIL,
              JIRA_API_TOKEN: env.JIRA_API_TOKEN,
              JIRA_DEFAULT_JQL: env.JIRA_DEFAULT_JQL,
            };

            if (!isJiraConfigured(jiraEnv)) {
              res.statusCode = 503;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  configured: false,
                  error:
                    "Jira is not configured. Set JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN in .env",
                }),
              );
              return;
            }

            try {
              const fullUrl = new URL(req.url ?? "", "http://localhost");
              const jql = fullUrl.searchParams.get("jql") ?? undefined;
              const maxResultsRaw = fullUrl.searchParams.get("maxResults");
              const nextPageToken = fullUrl.searchParams.get("nextPageToken") ?? undefined;
              const result = await fetchJiraSearch(jiraEnv, {
                jql,
                maxResults: maxResultsRaw != null ? Number(maxResultsRaw) : undefined,
                nextPageToken,
              });
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(result));
            } catch (e) {
              const message = e instanceof Error ? e.message : "Unknown error";
              console.error("[jira-api-dev]", message);
              res.statusCode = 502;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: message }));
            }
          });
        },
      },
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
  };
});
