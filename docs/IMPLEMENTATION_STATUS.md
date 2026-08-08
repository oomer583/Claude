# Implementation Status

Bu dosya aktif OSS entegrasyon mimarisinin uygulanma durumunu izler.

## Kilitli mimari

- Ana uygulama: `vercel/chatbot`
- Model gateway: `decolua/9router`
- AI workspace: `onyx-dot-app/onyx`
- Product source of truth: PostgreSQL
- Fast quota/rate-limit: Redis
- Payment provider: bağlı değil

## Tamamlananlar

- `vercel/chatbot` ana uygulama tabanı içeri aktarıldı.
- Upstream commit `.upstream-vercel-chatbot` içinde sabitlendi.
- Vercel AI Gateway yerine 9Router OpenAI-compatible provider bağlantısı eklendi.
- `ROUTER_BASE_URL`, `ROUTER_API_KEY`, `ROUTER_TITLE_MODEL`, `ONYX_BASE_URL` env sözleşmeleri eklendi.
- CI: frozen-lockfile install, lint/check ve TypeScript typecheck.

## Sıradaki implementation grubu

1. Onyx server-side client ve ortak error modeli.
2. Onyx authenticated identity mapping.
3. Product Project tablosu + `onyxProjectId` mapping.
4. Project create/list/read/delete server API.
5. Project file upload -> Onyx indexing bridge.
6. Project chat -> Onyx retrieval/RAG context.
7. Web Search / Research routing.
8. Onyx memory read/write + incognito bypass.

## Kurallar

- Eski Fastify/sıfırdan backend planı aktif mimari değildir.
- Hazır upstream özellikler yeniden yazılmaz.
- CE/EE sınırları exact upstream koddan doğrulanır.
- Browser doğrudan Onyx veya 9Router'a bağlanmaz.
- Product identity ve ownership PostgreSQL'de kalır.
