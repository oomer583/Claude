# Claude-like AI Workspace

Claude benzeri production AI çalışma alanı. Proje büyük özellikleri sıfırdan yeniden yazmak yerine mevcut açık kaynak sistemleri bridge/adapter katmanlarıyla birleştirir.

## Mimari

```text
Browser
  |
  v
vercel/chatbot tabanlı ana uygulama
  |
  +------ server-side ------> 9Router ------> LLM sağlayıcıları
  |
  +------ server-side ------> Onyx
                              |- Projects / RAG
                              |- File ingestion
                              |- Web Search
                              |- Deep Research
                              |- Memory
                              |- MCP / Actions
                              `- Code / generated files

PostgreSQL -> ürün source of truth
Redis      -> quota / rate-limit
```

Ana bileşenler:

- `vercel/chatbot`: UI, auth, chat/history, PostgreSQL, streaming ve artifacts.
- `decolua/9router`: tek model/provider gateway, routing ve fallback.
- `onyx-dot-app/onyx`: Projects/RAG, dosyalar, Search, Deep Research, Memory, MCP/Actions ve güvenli code/file execution.
- Redis + `rate-limiter-flexible`: hot-path limitler.

Şimdilik Mem0, OpenMeter ve gerçek payment processor bağlanmaz.

## Mevcut durum

Aktif implementation branch'i: `codex/oss-integration-foundation`.

`vercel/chatbot` upstream uygulaması otomatik bootstrap ile bu branch'e import edilmiştir. Kullanılan upstream commit `.upstream-vercel-chatbot` içinde kayıtlıdır. Bundan sonraki çalışma ana uygulamayı 9Router ve Onyx'e bağlayan küçük entegrasyon katmanlarına odaklanır.

## Temel ilke

> **Ada yapma, köprü yap.**

Aynı işlev seçilen upstream projede zaten varsa yeniden yazılmaz. Upstream davranışı korunur; yalnız entegrasyon, product ownership, güvenlik, entitlement ve kullanıcı deneyimi için özel kod eklenir.

## İlk public production kapsamı

İlk public release tamamlanmadan aşağıdaki çekirdek özellikler fake/mock/placeholder olmadan uçtan uca çalışmalıdır:

- doğal streaming chat
- uzun document workflow
- Projects + knowledge + instructions
- kalıcı memory + chat history
- artifacts
- DOCX/XLSX/PPTX/PDF/code dosyası üretme ve düzenleme
- Web Search + citations
- Deep Research
- Extended Thinking
- MCP/connectors/actions
- Custom Styles/personas
- Incognito chat
- image/document analysis, summarization, writing, brainstorming, translation ve multimodal kullanım

Public MVP/V1/V2 şeklinde eksik çekirdek sürüm yayınlanmaz; geliştirme yalnız içeride fazlara ayrılabilir.

## Geliştirme

Upstream uygulama `pnpm` kullanır. Kurulum için `.env.example` esas alınır; gerçek secret'lar repoya commit edilmez.

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

Güncel repo kuralları ve mimari öncelikleri için `AGENTS.md` bağlayıcıdır. Eski `docs/ARCHITECTURE.md` / `docs/ROADMAP.md` içindeki sıfırdan Fastify/backend geliştirme yaklaşımı tarihsel planlama materyalidir.

## Lisans disiplini

Yeni dependency eklerken MIT/Apache-2.0/BSD/ISC gibi permissive lisanslar tercih edilir. Onyx özelliklerinde CE/EE sınırı kod seviyesinde doğrulanır; proprietary/EE kod CE gibi kullanılmaz.
