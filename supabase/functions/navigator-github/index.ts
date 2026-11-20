import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { SignJWT, importPKCS8 } from "npm:jose@5";

const REPOSITORY = "Animic-Protein/Animic-Protein.github.io";
const ZONE = "github:" + REPOSITORY;
const CAPABILITIES = new Set([
  "repository.read", "repository.list", "pull-request.read", "issue.read", "workflow.status.read",
  "branch.create", "file.create", "file.update", "issue.create", "issue.comment.create",
  "pull-request.draft.create", "workflow.dispatch", "workflow.rerun",
  "pull-request.merge", "issue.close", "release.create", "pages.deploy"
]);
const MAX_BODY = 96 * 1024;
const encoder = new TextEncoder();
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://animic-protein.github.io",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Vary": "Origin"
};
const respond = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" } });
const fail = (status: number, code: string) => respond(status, { status: "denied", code });
const canonical = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value as Record<string, unknown>).sort().map(k => [k, canonical((value as Record<string, unknown>)[k])]));
  }
  return value;
};
const sha256 = async (value: unknown) => {
  const bytes = await crypto.subtle.digest("SHA-256", encoder.encode(JSON.stringify(canonical(value))));
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, "0")).join("");
};
const safePath = (value: unknown) => typeof value === "string" && value.length > 0 && value.length <= 240 &&
  value.trim() === value && !value.startsWith("/") && !value.includes("\\") &&
  !/[?#\u0000-\u001f\u007f]/.test(value) &&
  value.split("/").every(s => s && s !== "." && s !== ".." && !/%(?:2e|2f|5c)/i.test(s));
const escapePath = (value: string) => value.split("/").map(encodeURIComponent).join("/");
const jsonBody = async (req: Request) => {
  const length = Number(req.headers.get("content-length") || 0);
  if (length > MAX_BODY) throw new Error("body_too_large");
  const raw = await req.text();
  if (raw.length > MAX_BODY) throw new Error("body_too_large");
  return JSON.parse(raw);
};
const required = (value: unknown, max = 3000) => typeof value === "string" && value.trim().length > 0 && value.length <= max;
const jsonResponse = async (url: string, token: string, method = "GET", data?: unknown) => {
  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + token,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "NAVIGATOR-0.9-human-gated-backend",
      ...(data === undefined ? {} : { "Content-Type": "application/json" })
    },
    ...(data === undefined ? {} : { body: JSON.stringify(data) })
  });
  const text = await response.text();
  let result: unknown = null;
  try { result = text ? JSON.parse(text) : null; } catch { result = { message: text.slice(0, 500) }; }
  if (!response.ok) throw Object.assign(new Error("github_api_error"), { status: response.status, result });
  return result;
};
const ghBase = "https://api.github.com/repos/" + REPOSITORY;
const getInstallationToken = async () => {
  const appId = Deno.env.get("GITHUB_APP_ID");
  const installationId = Deno.env.get("GITHUB_APP_INSTALLATION_ID");
  const privateKeyPem = Deno.env.get("GITHUB_APP_PRIVATE_KEY")?.replace(/\\n/g, "\n");
  if (!appId || !installationId || !privateKeyPem) throw new Error("github_app_not_configured");
  const key = await importPKCS8(privateKeyPem, "RS256");
  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({ iat: now - 30, exp: now + 540, iss: appId })
    .setProtectedHeader({ alg: "RS256" }).sign(key);
  const response = await fetch("https://api.github.com/app/installations/" + encodeURIComponent(installationId) + "/access_tokens", {
    method: "POST",
    headers: { Accept: "application/vnd.github+json", Authorization: "Bearer " + jwt, "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "NAVIGATOR-0.9-human-gated-backend" },
    body: "{}"
  });
  const result = await response.json();
  if (!response.ok || typeof result.token !== "string") throw new Error("github_installation_token_failed");
  return result.token as string;
};
const parseWorkflowAllowlist = () => {
  try {
    const parsed = JSON.parse(Deno.env.get("NAVIGATOR_ALLOWED_WORKFLOWS") || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, string[]>;
  } catch { return {}; }
};
const routeGithub = async (token: string, operation: string, resource: string, details: Record<string, unknown>) => {
  const contentsPath = safePath(resource) ? escapePath(resource) : "";
  if (["repository.read", "repository.list"].includes(operation)) {
    if (!contentsPath) throw Object.assign(new Error("invalid_resource_path"), { status: 400 });
    return await jsonResponse(ghBase + "/contents/" + contentsPath + "?ref=main", token);
  }
  if (operation === "pull-request.read" && /^pulls\/[1-9]\d*$/.test(resource)) return await jsonResponse(ghBase + "/" + resource, token);
  if (operation === "issue.read" && /^issues\/[1-9]\d*$/.test(resource)) return await jsonResponse(ghBase + "/" + resource, token);
  if (operation === "workflow.status.read" && /^actions\/runs\/[1-9]\d*$/.test(resource)) return await jsonResponse(ghBase + "/" + resource, token);

  if (operation === "branch.create") {
    if (!/^navigator\/[a-zA-Z0-9._/-]{1,100}$/.test(resource) || !required(details.baseRef, 100)) throw Object.assign(new Error("invalid_branch_request"), { status: 400 });
    const base = await jsonResponse(ghBase + "/git/ref/heads/" + escapePath(String(details.baseRef)), token) as Record<string, unknown>;
    const sha = (base.object as Record<string, unknown> | undefined)?.sha;
    if (typeof sha !== "string") throw Object.assign(new Error("base_ref_not_found"), { status: 404 });
    return await jsonResponse(ghBase + "/git/refs", token, "POST", { ref: "refs/heads/" + resource, sha });
  }
  if (["file.create", "file.update"].includes(operation)) {
    if (!contentsPath || !/^navigator\\/[a-zA-Z0-9._/-]{1,100}$/.test(String(details.branch || "")) || !required(details.message, 200) || typeof details.content !== "string" || details.content.length > 64000) throw Object.assign(new Error("invalid_file_request"), { status: 400 });
    if (operation === "file.update" && !required(details.sha, 100)) throw Object.assign(new Error("file_sha_required"), { status: 400 });
    if (operation === "file.create" && details.sha) throw Object.assign(new Error("create_must_not_replace"), { status: 400 });
    const bytes = encoder.encode(details.content);
    let binary = ""; for (const b of bytes) binary += String.fromCharCode(b);
    return await jsonResponse(ghBase + "/contents/" + contentsPath, token, "PUT", {
      message: details.message, content: btoa(binary), branch: details.branch, ...(details.sha ? { sha: details.sha } : {})
    });
  }
  if (operation === "issue.create") {
    if (resource !== "issues" || !required(details.title, 250) || !required(details.body, 10000)) throw Object.assign(new Error("invalid_issue_request"), { status: 400 });
    return await jsonResponse(ghBase + "/issues", token, "POST", { title: details.title, body: details.body });
  }
  if (operation === "issue.comment.create" && /^issues\/[1-9]\d*\/comments$/.test(resource)) {
    if (!required(details.body, 10000)) throw Object.assign(new Error("comment_body_required"), { status: 400 });
    return await jsonResponse(ghBase + "/" + resource, token, "POST", { body: details.body });
  }
  if (operation === "pull-request.draft.create") {
    if (resource !== "pulls" || !required(details.title, 250) || !/^navigator\\/[a-zA-Z0-9._/-]{1,100}$/.test(String(details.head || "")) || details.base !== "main" || !required(details.body, 10000)) throw Object.assign(new Error("invalid_draft_request"), { status: 400 });
    return await jsonResponse(ghBase + "/pulls", token, "POST", { title: details.title, head: details.head, base: "main", body: details.body, draft: true });
  }
  if (operation === "workflow.dispatch" || operation === "pages.deploy") {
    const allowlist = parseWorkflowAllowlist();
    const refs = allowlist[resource];
    if (!safePath(resource) || !Array.isArray(refs) || !refs.includes("main") || details.ref !== "main") throw Object.assign(new Error("workflow_not_allowlisted"), { status: 403 });
    if (operation === "pages.deploy" && resource !== Deno.env.get("NAVIGATOR_PAGES_WORKFLOW")) throw Object.assign(new Error("pages_workflow_not_configured"), { status: 403 });
    const inputs = details.inputs && typeof details.inputs === "object" && !Array.isArray(details.inputs) ? details.inputs : {};
    return await jsonResponse(ghBase + "/actions/workflows/" + escapePath(resource) + "/dispatches", token, "POST", { ref: "main", inputs });
  }
  if (operation === "workflow.rerun" && /^actions\/runs\/[1-9]\d*\/rerun$/.test(resource)) {
    return await jsonResponse(ghBase + "/" + resource, token, "POST", {});
  }
  if (operation === "pull-request.merge" && /^pulls\/[1-9]\d*$/.test(resource)) {
    if (!required(details.sha, 100) || !["merge", "squash", "rebase"].includes(String(details.mergeMethod))) throw Object.assign(new Error("merge_sha_and_method_required"), { status: 400 });
    const currentPr = await jsonResponse(ghBase + "/" + resource, token) as Record<string, unknown>;
    if (currentPr.draft === true || currentPr.state !== "open" || (currentPr.head as Record<string, unknown> | undefined)?.sha !== details.sha) throw Object.assign(new Error("pull_request_state_or_head_mismatch"), { status: 409 });
    const checks = await jsonResponse(ghBase + "/commits/" + encodeURIComponent(String(details.sha)) + "/check-runs", token) as Record<string, unknown>;
    const checkRuns = Array.isArray(checks.check_runs) ? checks.check_runs as Array<Record<string, unknown>> : [];
    if (checkRuns.length === 0 || checkRuns.some(c => c.status !== "completed" || c.conclusion !== "success")) throw Object.assign(new Error("required_checks_not_green"), { status: 409 });
    return await jsonResponse(ghBase + "/" + resource + "/merge", token, "PUT", { sha: details.sha, merge_method: details.mergeMethod });
  }
  if (operation === "issue.close" && /^issues\/[1-9]\d*$/.test(resource)) {
    return await jsonResponse(ghBase + "/" + resource, token, "PATCH", { state: "closed" });
  }
  if (operation === "release.create") {
    if (resource !== "releases" || !required(details.tagName, 100) || !required(details.name, 250) || !required(details.body, 10000)) throw Object.assign(new Error("invalid_release_request"), { status: 400 });
    return await jsonResponse(ghBase + "/releases", token, "POST", { tag_name: details.tagName, name: details.name, body: details.body, draft: true, prerelease: true });
  }
  throw Object.assign(new Error("operation_not_implemented"), { status: 403 });
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  const origin = req.headers.get("Origin");
  if (origin && origin !== "https://animic-protein.github.io" && !origin.startsWith("http://localhost:")) return fail(403, "origin_not_allowed");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !serviceKey || !anonKey) return fail(503, "backend_not_configured");
  const authorization = req.headers.get("Authorization") || "";
  const bearer = authorization.replace(/^Bearer\s+/i, "");
  if (!bearer) return fail(401, "authentication_required");
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data: authData, error: authError } = await createClient(supabaseUrl, anonKey, { auth: { persistSession: false } }).auth.getUser(bearer);
  if (authError || !authData.user) return fail(401, "invalid_session");
  const user = authData.user;
  const providers = Array.isArray(user.app_metadata?.providers) ? user.app_metadata.providers : [user.app_metadata?.provider];
  if (!providers.includes("github")) return fail(403, "github_authenticated_user_required");
  const login = user.user_metadata?.user_name || user.user_metadata?.preferred_username;
  if (typeof login !== "string" || !/^[A-Za-z0-9-]{1,39}$/.test(login)) return fail(403, "github_login_missing");

  let body: Record<string, unknown>;
  try { body = await jsonBody(req); } catch { return fail(400, "invalid_json_or_body_too_large"); }

  if (req.method === "POST" && body.action === "issue-mandate") {
    const capabilities = Array.isArray(body.capabilities) ? [...new Set(body.capabilities)] : [];
    const maxRequests = Number(body.maxRequests || 12);
    const lifetimeMinutes = Number(body.lifetimeMinutes || 15);
    if (!capabilities.length || capabilities.some(c => typeof c !== "string" || !CAPABILITIES.has(c)) ||
        !Number.isInteger(maxRequests) || maxRequests < 1 || maxRequests > 12 ||
        !Number.isInteger(lifetimeMinutes) || lifetimeMinutes < 1 || lifetimeMinutes > 15) return fail(400, "invalid_mandate_scope");
    const expiresAt = new Date(Date.now() + lifetimeMinutes * 60000).toISOString();
    const { data, error } = await supabase.from("navigator_mandates").insert({
      user_id: user.id, repository: REPOSITORY, capabilities, expires_at: expiresAt, max_requests: maxRequests
    }).select("id,repository,capabilities,issued_at,expires_at,max_requests,status").single();
    if (error) return fail(500, "mandate_storage_failed");
    return respond(201, { format: "navigator-zone-mandate/v1", mandate: data, authenticatedGithubLogin: login });
  }

  if (req.method === "POST" && body.action === "revoke-mandate") {
    if (!required(body.mandateId, 60)) return fail(400, "mandate_id_required");
    const { data, error } = await supabase.from("navigator_mandates").update({ status: "revoked", revoked_at: new Date().toISOString() })
      .eq("id", body.mandateId).eq("user_id", user.id).eq("status", "active").select("id,status,revoked_at").maybeSingle();
    if (error) return fail(500, "revocation_failed");
    if (!data) return fail(404, "active_mandate_not_found");
    return respond(200, { status: "revoked", mandate: data });
  }

  if (req.method !== "POST" || body.action !== "execute") return fail(404, "endpoint_not_found");
  const { mandateId, requestId, operation, resource, details, decision, actionDigest } = body;
  if (!required(mandateId, 60) || !required(requestId, 100) || !/^[A-Za-z0-9._:-]+$/.test(String(requestId)) ||
      !required(operation, 100) || !required(resource, 300) || !details || typeof details !== "object" || Array.isArray(details)) return fail(400, "invalid_execution_request");
  if (decision !== "approve") return fail(403, "fresh_human_approval_required");
  const { data: mandate, error: mandateError } = await supabase.from("navigator_mandates").select("*").eq("id", mandateId).eq("user_id", user.id).maybeSingle();
  if (mandateError || !mandate) return fail(404, "mandate_not_found");
  if (mandate.status !== "active" || Date.parse(mandate.expires_at) <= Date.now()) return fail(403, "mandate_inactive_or_expired");
  if (mandate.repository !== REPOSITORY || !mandate.capabilities.includes(operation)) return fail(403, "operation_outside_mandate");
  const exactDigest = await sha256({ mandateId, zone: ZONE, operation, repository: REPOSITORY, resource: String(resource).trim(), details });
  if (actionDigest !== exactDigest) return fail(409, "action_digest_mismatch");
  const { error: insertError } = await supabase.from("navigator_executions").insert({
    request_id: requestId, mandate_id: mandateId, user_id: user.id, operation, repository: REPOSITORY,
    resource, action_digest: exactDigest, human_decision: "approve", status: "authorized"
  });
  if (insertError?.code === "23505") return fail(409, "request_already_used");
  if (insertError) return fail(500, "execution_ledger_failed");
  const { data: consumed, error: consumeError } = await supabase.rpc("navigator_consume_mandate", { p_mandate_id: mandateId, p_user_id: user.id });
  if (consumeError || consumed !== true) {
    await supabase.from("navigator_executions").update({ status: "denied", error_code: "mandate_budget_exhausted" }).eq("request_id", requestId);
    return fail(403, "mandate_budget_exhausted");
  }

  try {
    const token = await getInstallationToken();
    const permission = await jsonResponse(ghBase + "/collaborators/" + encodeURIComponent(login) + "/permission", token) as Record<string, unknown>;
    if (!["admin", "maintain", "write"].includes(String(permission.permission))) throw Object.assign(new Error("github_user_lacks_write_permission"), { status: 403 });
    await supabase.from("navigator_executions").update({ status: "executing" }).eq("request_id", requestId);
    const result = await routeGithub(token, String(operation), String(resource), details as Record<string, unknown>);
    const safeResult = result && typeof result === "object" ? result : { result };
    await supabase.from("navigator_executions").update({ status: "executed", result: safeResult, executed_at: new Date().toISOString() }).eq("request_id", requestId);
    return respond(200, {
      format: "navigator-execution-result/v1", status: "executed", execution: "executed",
      requestId, mandateId, operation, repository: REPOSITORY, resource, actionDigest: exactDigest,
      authenticatedGithubActor: login, humanDecision: "approve", executedAt: new Date().toISOString(), result
    });
  } catch (error) {
    const status = Number((error as { status?: number }).status || 500);
    await supabase.from("navigator_executions").update({ status: "failed", error_code: error instanceof Error ? error.message.slice(0, 120) : "execution_failed" }).eq("request_id", requestId);
    return fail(status >= 400 && status < 500 ? status : 502, error instanceof Error ? error.message.slice(0, 120) : "execution_failed");
  }
});
