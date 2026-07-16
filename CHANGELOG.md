# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.4] - 2026-07-16

### Changed
- TFM video moved from YouTube to Google Drive (PR #110) — YouTube
  phone-number verification kept failing, so the public vídeo del TFM
  now lives on Drive and embeds via the `/preview` URL pattern.

## [1.2.3] - 2026-07-16

### Changed
- TFM rubric alignment pass on the README and the slide deck (PR #108):
  modules renamed to match the landing (Native Sounds with 45 sound
  topics, Connected Speech, Flow & Connectors, Real Talk); sections
  reordered so the evaluator sees features before stack; funcionalidades
  section expanded with concrete metrics; 12 → 17 slides with new
  Buenas prácticas, Seguridad, Arquitectura backend, Arquitectura
  cliente (4 capas) and Un pod por dentro slides.
- MiniMax and SDD (Spec-Driven Development) added as part of the
  development tooling and methodology.
- Spain-Spanish phrasing: `mockup → boceto`, `forward compatibility →
  compatibilidad futura`, `deck → presentación`.

## [1.2.2] - 2026-07-16

### Added
- TFM presentation and video served directly from the main domain
  (`ididntcatchthat.com/tfm-slides.html`, `.../tfm-video.html`) via the
  client bundle — no more `raw.githack.com` / `htmlpreview.github.io`
  third-party previewers (PR #106).
- Tribunal-ready pitch deck + repo honesty audit (PR #105).

## [1.2.1] - 2026-07-12

### Added
- Native `<AppSelect>` on `@base-ui/react` replacing 7 native selects
  across the UI (PR #103).
- Backoffice: Spain Spanish copy, observability tooltips and mobile
  responsive gaps (PR #102).
- Backoffice UI polish — game charts overhaul + flashcards search &
  UX (PR #101).

### Changed
- TFM code-review polish sprint A across auth, game, study, summary,
  toast, profile cache and hardest pagination (PR #100).
- Seed from dev, Makefile split into `make/` modules, docs refresh
  (PR #99).

## [1.1.0] - 2026-07-09

### Added
- Landing auth flow, backoffice audio recovery and TFM video assets
  (PR #97).
- Online preview links for the slide deck (PR #96).
- TFM submission section in the README and the HTML slide deck itself
  (PR #95).

### Fixed
- VPS Docker port hardening and security-audit tooling (PR #93).
- Landing auth on mobile + compact play chrome (PR #92).

## [1.0.0] - 2026-07-06

### Added
- **Core domain**: 8 bounded contexts (content, gaming, identity,
  progress, ranking, achievement, analytics, observability) wired
  through a RabbitMQ event bus with retry, DLQ and idempotent
  subscribers.
- **APIs**: 100% line coverage on use cases, domain services,
  repositories, infrastructure and domain layers (90/100/100/100
  thresholds).
- **Cliente**: 75/78/80/80 coverage thresholds after excluding two
  legacy files; container/presentational pattern enforced at pod
  level; TanStack Query + Zustand + Zod.
- **Observability**: Prometheus metrics, Loki logs, Grafana
  dashboards, OpenTelemetry tracing across API ↔ RabbitMQ ↔
  subscribers.
- **CI**: GitHub Actions pipelines (lint, type-check, unit, e2e) on
  every PR.

### Changed
- Migration to monorepo with `apps/api` (NestJS + Clean Architecture +
  DDD) and `apps/client` (React 19 + Vite + TailwindCSS).
- Infrastructure externalised to Aiven (Postgres) and Cloudflare R2 +
  CDN for audio assets; VPS only runs app containers behind nginx.
- 33 Architecture Decision Records (ADRs) documenting every infra and
  architecture call.

### Security
- JWT (access + refresh) with `httpOnly` + `secure` cookies.
- OAuth Google integration with guest-token migration to registered
  users.
- Role-based authorization via guards, voters and `@CurrentUser`.
- Threat model in ADR-033; supply chain scanned by Trivy in CI;
  secrets in Doppler (zero credentials in the repo).

## Earlier releases

The repo started as the TFM project and accumulated feature work
through ~94 PRs that fed the v1.0.0 release. Highlights of that
pre-1.0 work include the initial Clean Architecture + DDD setup, the
8 bounded-context layout, the event-driven integration between them,
the first end-to-end coverage thresholds, the RabbitMQ + retry +
DLQ + inbox pattern, the guest-to-user migration flow, the OAuth
Google integration, the backoffice CRUD on flashcards with the
DeepSeek + ElevenLabs content pipeline, and the first deploy to the
OVHcloud VPS behind nginx.

[Unreleased]: https://github.com/AbrahamVilchesDeLaCruz/ididntcatchthat/compare/v1.2.4...HEAD
[1.2.4]: https://github.com/AbrahamVilchesDeLaCruz/ididntcatchthat/compare/v1.2.3...v1.2.4
[1.2.3]: https://github.com/AbrahamVilchesDeLaCruz/ididntcatchthat/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/AbrahamVilchesDeLaCruz/ididntcatchthat/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/AbrahamVilchesDeLaCruz/ididntcatchthat/compare/v1.1.0...v1.2.1
[1.1.0]: https://github.com/AbrahamVilchesDeLaCruz/ididntcatchthat/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/AbrahamVilchesDeLaCruz/ididntcatchthat/releases/tag/v1.0.0