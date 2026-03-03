# SemanticNotes Refactoring Planı

## Durum Göstergesi
- [ ] = Yapılmadı
- [x] = Tamamlandı
- [~] = Devam ediyor

---

## Aşama 1 — Temel Altyapı (bağımsız, risksiz)

- [x] **1.1** `apps/web/src/lib/apiClient.ts` oluştur → 3 service'teki `apiFetch` kopyaları tek yerden
- [x] **1.2** `apps/web/src/services/searchService.ts` oluştur → `noteService.ts`'den `searchService` taşı
- [x] **1.3** `apps/web/src/services/statusService.ts` oluştur → `agentService.ts`'den `statusService` taşı
- [x] **1.4** `packages/shared/src/schemas/settings.ts` oluştur → `AppSettings` + `UpdateSettingsInput` `search.ts`'den buraya
- [x] **1.5** `apps/web/src/lib/utils.ts`'den `Result<T>` + `tryCatch()` kaldır → `packages/shared`'den import et

---

## Aşama 2 — Server Refactor

- [x] **2.1** `apps/server/src/services/searchService.ts` oluştur → `routes/search.ts`'deki dedup/merge/sort logic'i buraya
- [x] **2.2** `apps/server/src/repositories/agentRunRepository.ts` oluştur → `agentRepository.ts`'den `agentRunRepository` ayrıştır
- [x] **2.3** `ollamaService.ts` settings config inject et → her embed/chat çağrısında `settingsRepository.get()` DB hit kaldır
- [x] **2.4** `vectorService.ts` broken singleton düzelt → `isOnline()` her seferinde yeni ChromaClient yaratıyor

---

## Aşama 3 — Molecule Katmanı (Atomic Design)

- [x] **3.1** `apps/web/src/components/molecules/NoteItem/` → `Sidebar.tsx`'den `NoteItem` bileşenini çıkar
- [x] **3.2** `apps/web/src/components/molecules/AgentCard/` → `AgentPanel.tsx`'den çıkar
- [x] **3.3** `apps/web/src/components/molecules/AgentRunItem/` → `AgentPanel.tsx`'den çıkar
- [x] **3.4** `apps/web/src/components/molecules/StatusBadge/` → `AgentPanel.tsx`'den çıkar
- [x] **3.5** `apps/web/src/hooks/useNoteList.ts` → `useNote.ts`'den ayır
- [x] **3.6** `apps/web/src/hooks/useNoteHierarchy.ts` → `useNote.ts`'den ayır
- [x] **3.7** `apps/web/src/hooks/useArchivedNotes.ts` → `useNote.ts`'den ayır
- [x] **3.8** `apps/web/src/hooks/useAgentList.ts` → `useAgent.ts`'den ayır
- [x] **3.9** `apps/web/src/hooks/useAgentRun.ts` → `useAgent.ts`'den ayır

---

## Aşama 4 — Bug Fix & İyileştirme

- [x] **4.1** `Sidebar.tsx` child note `onClick={() => {}}` bug'ı düzelt → not altındaki notlara tıklamak çalışmıyor
- [x] **4.2** `Sidebar.tsx` doğrudan `noteService.archive()` çağrısını kaldır → `onArchive` prop aracılığıyla Sidebar'a taşındı
- [x] **4.3** `BlockEditor.tsx` `theme="light"` hardcoded → `uiStore`'dan theme oku
- [x] **4.4** `AgentFormDialog.tsx` `handleSubmit as any` cast kaldır → form id + submit button
- [x] **4.5** `AgentFormDialog.tsx` eksik `on_select` trigger ekle
- [x] **4.6** `uiStore.ts` DOM side effect (`document.documentElement.classList`) → `App.tsx` useEffect'e taşı
- [x] **4.7** `SettingsPage.tsx` anlık-fire pattern → save/discard pattern'e çevir
- [x] **4.8** `CommandPalette.tsx` çift `useNoteStore()` çağrısını tek destructure'a indir

---

## Bilinen Mimari Borçlar

- [x] `use_transformers_fallback` dead feature → silindi (schema, SettingsPage, i18n, dist)
- [x] `agentTools.ts` inline `zodToJsonSchema()` → `zod-to-json-schema` paketi kullanılıyor (`pnpm install` gerekli)
- [x] `db/migrate.ts` raw SQL → Drizzle migration dosyaları üretildi (`src/db/migrations/`), migrate.ts sadeleştirildi
- [ ] `BlockEditor` block format hack → BlockNote native schema'ya tam geçiş veya proper conversion layer (ertelendi)

---

## Dosya Yapısı Hedef (Tamamlandığında)

```
apps/web/src/
├── lib/
│   ├── apiClient.ts       ← YENİ
│   ├── constants.ts
│   └── utils.ts           ← Result<T> kaldırıldı
├── services/
│   ├── noteService.ts     ← sadece note CRUD
│   ├── searchService.ts   ← YENİ (noteService'ten taşındı)
│   ├── agentService.ts    ← sadece agent CRUD
│   ├── statusService.ts   ← YENİ (agentService'ten taşındı)
│   └── settingsService.ts
├── hooks/
│   ├── useNoteList.ts     ← YENİ
│   ├── useNote.ts         ← sadece single note
│   ├── useNoteHierarchy.ts← YENİ
│   ├── useArchivedNotes.ts← YENİ
│   ├── useAgentList.ts    ← YENİ
│   ├── useAgentRun.ts     ← YENİ
│   ├── useKeyboardShortcuts.ts
│   ├── useOllamaStatus.ts
│   ├── useSemantic.ts
│   └── useSettings.ts
└── components/
    ├── atoms/             ← değişiklik yok
    ├── molecules/         ← YENİ katman
    │   ├── NoteItem/
    │   ├── AgentCard/
    │   ├── AgentRunItem/
    │   └── StatusBadge/
    ├── organisms/
    ├── pages/
    └── templates/

apps/server/src/
├── services/
│   └── searchService.ts   ← YENİ
├── repositories/
│   ├── noteRepository.ts
│   ├── agentRepository.ts ← sadece agent CRUD
│   └── agentRunRepository.ts ← YENİ

packages/shared/src/schemas/
├── note.ts
├── agent.ts
├── search.ts              ← AppSettings kaldırıldı
└── settings.ts            ← YENİ
```
