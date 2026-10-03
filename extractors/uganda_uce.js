// Uganda NCDC UCE extractor (S1–S4)
// Shape: terms[].themes[].topics[]
window.extractUgandaUCE = function (json) {
  const meta = json.curriculum_metadata ?? {};
  const classLevel = meta.class_group ?? "";

  function domainFrom(d) {
    const s = String(d || "").toLowerCase();
    const att = /attitude|value|v\/a|\(v\)|\(a\)/.test(s);
    const sk = /skill|\(s\)|\bs\b/.test(s);
    const kn = /knowledge|understanding|\(k\)|\(u\)/.test(s);
    if (att && !sk && !kn) return "attitudes";
    if (sk && !kn && !att) return "skills";
    if (kn) return "knowledge";
    if (sk) return "skills";
    if (att) return "attitudes";
    return "other";
  }

  function normalizeTitle(s) {
    return String(s || "").toLowerCase()
      .replace(/^topic\s*\d+\s*[:.\-]\s*/i, "")
      .replace(/^unit\s*\d+\s*[:.\-]\s*/i, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function isLooseMatch(a, b) {
    if (!a || !b) return false;
    if (a === b) return true;
    const [shorter, longer] = a.length < b.length ? [a, b] : [b, a];
    if (shorter.length < 4) return false;
    // Word-boundary containment check
    const re = new RegExp(`\\b${escapeRegex(shorter)}\\b`);
    if (!re.test(longer)) return false;
    // Length ratio threshold (was 0.5, lowered to 0.35 to catch "excretion" inside "excretion in animals")
    if (shorter.length / longer.length < 0.35) return false;
    return true;
  }

  // Reassign topics that are sitting under the wrong theme.
  // Trigger: a theme has NO topics, and a sibling theme holds a topic whose
  // title loosely matches this empty theme's title.
  function fixThemeAssignments(themes) {
    const titleMap = new Map();
    for (const th of themes) {
      const n = normalizeTitle(th.themeTitle);
      if (n) titleMap.set(n, th);
    }
    for (const th of themes) {
      for (let i = th.topics.length - 1; i >= 0; i--) {
        const t = th.topics[i];
        const tNorm = normalizeTitle(t.title);
        if (!tNorm) continue;
        for (const [themeNorm, otherTheme] of titleMap.entries()) {
          if (otherTheme === th) continue;
          if (isLooseMatch(tNorm, themeNorm) && otherTheme.topics.length === 0) {
            otherTheme.topics.unshift(t);
            th.topics.splice(i, 1);
            break;
          }
        }
      }
    }
  }

  function dedupeTopics(themes) {
    for (const th of themes) {
      const seen = new Set();
      th.topics = th.topics.filter(t => {
        const key = normalizeTitle(t.title);
        if (!key) return true;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
  }

  const terms = (json.terms ?? []).map(term => {
    const themes = (term.themes ?? []).map(theme => ({
      themeTitle: theme.theme_title ?? "",
      themeDescription: theme.theme_description ?? "",
      topics: (theme.topics ?? []).map(t => {
        const m = t.topic_metadata ?? {};
        const outcomes = (t.learning_outcomes ?? []).map(o => ({
          text: o.outcome_text ?? "",
          domain: domainFrom(o.domain),
          rawDomain: o.domain ?? ""
        }));
        const activities = (t.suggested_learning_activities ?? []).map(a => ({
          type: a.activity_type ?? "",
          description: a.description ?? ""
        }));
        const assessments = (t.suggested_assessment_activities ?? []).map(a => ({
          type: a.assessment_type ?? "",
          description: a.description ?? ""
        }));
        const equipment = [];
        (t.practical_requirements?.practicals ?? []).forEach(p =>
          (p.equipment_list ?? []).forEach(e => equipment.push(e)));
        return {
          id: m.topic_id ?? "",
          title: m.topic_title ?? "",
          order: Number(m.sequence_order) || 0,
          duration: Number(m.recommended_duration_periods) || 0,
          competency: t.core_competency ?? "",
          outcomes: {
            all: outcomes,
            knowledge: outcomes.filter(o => o.domain === "knowledge").map(o => o.text),
            skills: outcomes.filter(o => o.domain === "skills").map(o => o.text),
            attitudes: outcomes.filter(o => o.domain === "attitudes").map(o => o.text)
          },
          contentScope: {
            mustCover: t.content_scope?.must_cover ?? [],
            excluded: (t.content_scope?.explicitly_excluded ?? [])
              .map(e => typeof e === "string" ? e : e.text_verbatim).filter(Boolean)
          },
          activities,
          assessments,
          materials: Array.from(new Set(equipment)),
          practicals: t.practical_requirements?.practicals ?? [],
          ict: t.ict_guidance?.suggested_uses ?? [],
          project: t.project_requirements?.is_project_required
            ? { required: true, details: t.project_requirements.project_scope_verbatim ?? "" } : null,
          notes: (t.syllabus_notes ?? []).map(n => n.text_verbatim).filter(Boolean)
        };
      })
    }));

    fixThemeAssignments(themes);
    dedupeTopics(themes);

    return {
      termNumber: term.term_number ?? 1,
      termName: term.term_name ?? "",
      themes
    };
  });

  return {
    country: "uganda", curriculum: "ncdc", level: "uce",
    subject: meta.subject ?? "", classLevel,
    terminology: { item: "Topic", group: "Theme" },
    terms
  };
};