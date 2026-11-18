"use client";

import { useCallback, useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import { LocalStorage, TOKEN_KEYS } from "@/src/utility/localStorage";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Bullet {
  label: string;
  text: string;
}

interface Section {
  sectionNumber: number;
  title: string;
  content: string;
  bulletPoints: Bullet[];
}

interface Policy {
  _id: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  introduction: string;
  sections: Section[];
  contactInfo: { website: string; details: string };
  isActive: boolean;
  updatedAt: string;
}

type Draft = Pick<
  Policy,
  "title" | "subtitle" | "lastUpdated" | "introduction" | "sections" | "contactInfo"
>;

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";
const PURPLE = "#55234F";

const input =
  "w-full rounded-[10px] border border-[#E5E5E5] bg-white px-3 py-2 text-[14px] text-black placeholder:text-[#616161] focus-visible:outline-2 focus-visible:outline-[#6E2D6B]";
const label = "mb-1 block text-[12px] font-medium text-[#616161]";
const ghost =
  "rounded-full border border-[#E5E5E5] bg-white px-4 py-1.5 text-[12px] font-medium text-black hover:border-[#6E2D6B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E2D6B] disabled:opacity-50";
const solid =
  "rounded-full px-5 py-2 text-[13px] font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E2D6B] disabled:cursor-not-allowed disabled:opacity-50";

const authHeaders = (): Record<string, string> => {
  const token = LocalStorage.getItem(TOKEN_KEYS.customer);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const toDraft = (p: Policy): Draft => ({
  title: p.title,
  subtitle: p.subtitle,
  lastUpdated: p.lastUpdated,
  introduction: p.introduction,
  sections: p.sections.map((s) => ({
    ...s,
    bulletPoints: s.bulletPoints.map((b) => ({ ...b })),
  })),
  contactInfo: { ...p.contactInfo },
});

const renumber = (sections: Section[]): Section[] =>
  sections.map((s, i) => ({ ...s, sectionNumber: i + 1 }));

/* ------------------------------------------------------------------ */
/* Single component: list + edit icon + prefilled form + PATCH         */
/* ------------------------------------------------------------------ */

export default function PrivacyPolicyAdmin() {
  const [items, setItems] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  /* ---------- GET /privacy-policy ---------- */
  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`${BASE_URL}/privacy-policy`, {
        headers: { "Content-Type": "application/json", ...authHeaders() },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || `Request failed (${res.status})`);
      }
      // `data` can be one object or an array: normalise to a list.
      const data = json.data;
      setItems(Array.isArray(data) ? data : data ? [data] : []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  /* ---------- Edit icon click: open form with data ---------- */
  const openEdit = (p: Policy) => {
    setEditingId(p._id);
    setDraft(toDraft(p));
    setSaveError(null);
  };

  const closeEdit = () => {
    if (saving) return;
    setEditingId(null);
    setDraft(null);
    setSaveError(null);
  };

  useEffect(() => {
    if (!editingId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) {
        setEditingId(null);
        setDraft(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editingId, saving]);

  /* ---------- PATCH /privacy-policy/:id ---------- */
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !draft) return;

    const body: Draft = { ...draft, sections: renumber(draft.sections) };
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`${BASE_URL}/privacy-policy/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || `Request failed (${res.status})`);
      }
      const updated: Policy | undefined = json.data?._id ? json.data : undefined;
      setItems((prev) =>
        prev.map((p) =>
          p._id === editingId ? (updated ?? { ...p, ...body }) : p
        )
      );
      setEditingId(null);
      setDraft(null);
      setNotice("Privacy policy updated.");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Draft setters (inline, no sub-components) ---------- */
  const patchDraft = (p: Partial<Draft>) =>
    setDraft((d) => (d ? { ...d, ...p } : d));

  const patchSection = (i: number, p: Partial<Section>) =>
    setDraft((d) =>
      d
        ? {
            ...d,
            sections: d.sections.map((s, idx) => (idx === i ? { ...s, ...p } : s)),
          }
        : d
    );

  const patchBullet = (si: number, bi: number, p: Partial<Bullet>) =>
    setDraft((d) =>
      d
        ? {
            ...d,
            sections: d.sections.map((s, idx) =>
              idx === si
                ? {
                    ...s,
                    bulletPoints: s.bulletPoints.map((b, j) =>
                      j === bi ? { ...b, ...p } : b
                    ),
                  }
                : s
            ),
          }
        : d
    );

  /* ---------- Render ---------- */
  return (
    <div
      className={`${poppins.className} mx-auto w-full max-w-[960px] px-4 pb-12 pt-[112px] sm:px-6 lg:pt-[144px]`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-[24px] font-semibold text-black sm:text-[32px]">
          Privacy Policy
        </h1>
        <p role="status" className="text-[13px] font-medium text-[#1B6B34]">
          {notice}
        </p>
      </div>

      {/* ---------------- List ---------------- */}
      <div className="rounded-[20px] bg-[#F1F1F1] p-4 sm:p-6" aria-busy={loading}>
        {loading ? (
          <ul className="space-y-3" aria-hidden="true">
            {[0, 1].map((i) => (
              <li key={i} className="h-16 animate-pulse rounded-[14px] bg-white" />
            ))}
          </ul>
        ) : loadError ? (
          <div
            role="alert"
            className="flex flex-col items-start gap-3 text-[14px] text-[#C41E1E] sm:flex-row sm:items-center sm:justify-between"
          >
            <p>Couldn&apos;t load the privacy policy. {loadError}</p>
            <button
              type="button"
              onClick={load}
              className={solid}
              style={{ backgroundColor: PURPLE }}
            >
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="text-[14px] text-[#616161]">No privacy policy found.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((p) => (
              <li
                key={p._id}
                className="flex items-center justify-between gap-3 rounded-[14px] bg-white px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium text-black sm:text-[16px]">
                    {p.title}
                  </p>
                  <p className="text-[12px] text-[#616161] sm:text-[13px]">
                    {p.sections.length} sections · Last updated {p.lastUpdated}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-[12px] font-medium ${
                      p.isActive
                        ? "bg-[#E3F6E8] text-[#1B6B34]"
                        : "bg-[#FFECEC] text-[#C41E1E]"
                    }`}
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </span>

                  {/* Edit icon */}
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    aria-label={`Edit ${p.title}`}
                    className="flex size-9 items-center justify-center rounded-full border border-[#E5E5E5] text-black transition-colors hover:border-[#6E2D6B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E2D6B]"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="size-4"
                    >
                      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.4 2.6a2 2 0 0 1 2.9 2.9L12 14.8 8 16l1.2-4Z" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ---------------- Edit form (modal, prefilled) ---------------- */}
      {editingId && draft && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeEdit();
          }}
        >
          <form
            onSubmit={save}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-policy-heading"
            className="w-full max-w-[820px] rounded-[20px] bg-white p-4 sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2
                id="edit-policy-heading"
                className="text-[20px] font-semibold text-black sm:text-[24px]"
              >
                Edit Privacy Policy
              </h2>
              <button
                type="button"
                onClick={closeEdit}
                aria-label="Close"
                className={ghost}
              >
                Close
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <label className="block">
                <span className={label}>Title</span>
                <input
                  className={input}
                  value={draft.title}
                  onChange={(e) => patchDraft({ title: e.target.value })}
                  required
                />
              </label>

              <label className="block">
                <span className={label}>Subtitle / notice</span>
                <textarea
                  className={`${input} min-h-[80px]`}
                  value={draft.subtitle}
                  onChange={(e) => patchDraft({ subtitle: e.target.value })}
                />
              </label>

              <label className="block">
                <span className={label}>Last updated</span>
                <input
                  className={input}
                  value={draft.lastUpdated}
                  onChange={(e) => patchDraft({ lastUpdated: e.target.value })}
                />
              </label>

              <label className="block">
                <span className={label}>Introduction</span>
                <textarea
                  className={`${input} min-h-[110px]`}
                  value={draft.introduction}
                  onChange={(e) => patchDraft({ introduction: e.target.value })}
                />
              </label>

              {/* Sections */}
              {draft.sections.map((s, i) => (
                <fieldset
                  key={i}
                  className="rounded-[16px] border border-[#E5E5E5] bg-[#FAFAFA] p-4"
                >
                  <legend className="px-2 text-[13px] font-medium text-[#616161]">
                    Section {i + 1}
                  </legend>

                  <div className="flex flex-col gap-3">
                    <label className="block">
                      <span className={label}>Section title</span>
                      <input
                        className={input}
                        value={s.title}
                        onChange={(e) => patchSection(i, { title: e.target.value })}
                        required
                      />
                    </label>

                    <label className="block">
                      <span className={label}>Content</span>
                      <textarea
                        className={`${input} min-h-[90px]`}
                        value={s.content}
                        onChange={(e) =>
                          patchSection(i, { content: e.target.value })
                        }
                      />
                    </label>

                    {s.bulletPoints.map((b, bi) => (
                      <div
                        key={bi}
                        className="grid gap-2 rounded-[12px] bg-white p-3 sm:grid-cols-[1fr_2fr_auto]"
                      >
                        <input
                          aria-label={`Section ${i + 1} bullet ${bi + 1} label`}
                          placeholder="Label"
                          className={input}
                          value={b.label}
                          onChange={(e) =>
                            patchBullet(i, bi, { label: e.target.value })
                          }
                        />
                        <input
                          aria-label={`Section ${i + 1} bullet ${bi + 1} text`}
                          placeholder="Text"
                          className={input}
                          value={b.text}
                          onChange={(e) =>
                            patchBullet(i, bi, { text: e.target.value })
                          }
                        />
                        <button
                          type="button"
                          className={ghost}
                          onClick={() =>
                            patchSection(i, {
                              bulletPoints: s.bulletPoints.filter(
                                (_, j) => j !== bi
                              ),
                            })
                          }
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={ghost}
                        onClick={() =>
                          patchSection(i, {
                            bulletPoints: [
                              ...s.bulletPoints,
                              { label: "", text: "" },
                            ],
                          })
                        }
                      >
                        + Add bullet
                      </button>
                      <button
                        type="button"
                        className={`${ghost} text-[#C41E1E]`}
                        onClick={() =>
                          patchDraft({
                            sections: renumber(
                              draft.sections.filter((_, idx) => idx !== i)
                            ),
                          })
                        }
                      >
                        Delete section
                      </button>
                    </div>
                  </div>
                </fieldset>
              ))}

              <button
                type="button"
                className={`${ghost} self-start`}
                onClick={() =>
                  patchDraft({
                    sections: renumber([
                      ...draft.sections,
                      { sectionNumber: 0, title: "", content: "", bulletPoints: [] },
                    ]),
                  })
                }
              >
                + Add section
              </button>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className={label}>Website</span>
                  <input
                    className={input}
                    value={draft.contactInfo.website}
                    onChange={(e) =>
                      patchDraft({
                        contactInfo: {
                          ...draft.contactInfo,
                          website: e.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label className="block">
                  <span className={label}>Contact details</span>
                  <textarea
                    className={`${input} min-h-[80px]`}
                    value={draft.contactInfo.details}
                    onChange={(e) =>
                      patchDraft({
                        contactInfo: {
                          ...draft.contactInfo,
                          details: e.target.value,
                        },
                      })
                    }
                  />
                </label>
              </div>

              {saveError && (
                <p role="alert" className="text-[14px] text-[#C41E1E]">
                  Couldn&apos;t save changes. {saveError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className={solid}
                  style={{ backgroundColor: PURPLE }}
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  className={ghost}
                  onClick={closeEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}