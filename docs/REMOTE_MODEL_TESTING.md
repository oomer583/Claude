# Remote self-hosted model testing

The product can now test basic chat against either 9Router or any OpenAI-compatible remote model server without changing application code.

## Supported paths

Normal path:

```text
Product -> 9Router -> provider/model
```

Direct test path:

```text
Product -> remote OpenAI-compatible server -> local/self-hosted model
```

The direct path is intended for development and migration testing. Production can stay behind 9Router.

## Basic chat without Onyx

Set:

```env
BASIC_CHAT_ONLY=1
```

Then Onyx credentials are not required by environment validation or upstream preflight. Features backed by Onyx (Projects, Memory, Research, MCP, Code Interpreter, file generation/editing) are not expected to work in this mode.

## Connect directly to a remote llama.cpp/vLLM-compatible server

Set:

```env
MODEL_GATEWAY_BASE_URL=http://YOUR_SERVER_IP:8000/v1
MODEL_GATEWAY_API_KEY=YOUR_SINGLE_SERVER_KEY
MODEL_ID=YOUR_EXPOSED_MODEL_ID
```

`MODEL_GATEWAY_*` takes priority over `ROUTER_*`. The application uses the OpenAI-compatible `/v1/models` and chat-completions interface.

For a single self-hosted model, `MODEL_ID` forces all chat and title requests to the model exposed by the remote server. This lets the existing UI work while the remote model is being tested.

## Keep 9Router in front

For normal routing, leave `MODEL_GATEWAY_*` and `MODEL_ID` blank and use:

```env
ROUTER_BASE_URL=http://host.docker.internal:20128/v1
ROUTER_API_KEY=YOUR_ONE_SERVER_SIDE_KEY
```

All product users share this server-side gateway connection. The key is never sent to the browser.

## Verify

After `.env` is ready:

```sh
pnpm deploy:check
```

For a direct remote model server, verify its OpenAI-compatible model list before starting the app:

```sh
curl -H "Authorization: Bearer $MODEL_GATEWAY_API_KEY" \
  "$MODEL_GATEWAY_BASE_URL/models"
```

Then start the product stack and run preflight:

```sh
docker compose up -d --build
pnpm deploy:preflight
```

When moving from a temporary machine to a stronger server, keep the application unchanged and update only `MODEL_GATEWAY_BASE_URL` / `MODEL_ID`, or update the upstream provider inside 9Router.
