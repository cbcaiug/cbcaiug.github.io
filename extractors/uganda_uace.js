// Uganda NCDC UACE extractor (S5–S6)
// Shape: classes[].terms[].themes[].topics[]
window.extractUgandaUACE = function (json) {
  const meta = json.curriculum_metadata ?? {};
  const classes = Array.isArray(json.classes) ? json.classes : [];
  const firstClass = classes[0] ?? {};
  const classLevel = firstClass.class_code ?? firstClass.class_name ?? meta.class_group ?? "";

  function parseTopicHeader(title) {
    const m = String(title || "").match(/^(Topic\s+\d+(?:\.\d+)*)\s*:\s*(.+)$/i);
    if (m) return { code: m[1].trim(), title: m[2].trim() };
    return { code: "", title: String(title || "") };
  }

  function domainFrom(d) {
    const s = String(d || "").toLowerCase();
    const letters = [];
    if (/knowledge|\(k\)|\bk\b/.test(s)) letters.push("k");
    if (/understanding|\(u\)|\bu\b/.test(s)) letters.push("u");
    if (/skill|\(s\)|\bs\b/.test(s)) letters.push("s");
    if (/value|\(v\)|\bv\b/.test(s)) letters.push("v");
    if (/attitude|\(a\)|\ba\b/.test(s)) letters.push("a");
    if (/generic|\(gs\)|\bgs\b/.test(s)) letters.push("gs");
    return letters.join(", ") || (d || "");
  }

  const terms = [];
  for (const cls of classes) {
    for (const term of cls.terms ?? []) {
      const termEntry = {
        termNumber: term.term_number ?? 1,
        termName: term.term_name ?? "",
        topics: []
      };

      for (const theme of term.themes ?? []) {
        const { code: topicCode, title: topicTitle } = parseTopicHeader(theme.theme_title);
        const topicCompetency = theme.theme_description || "";
        const subRaw = theme.topics ?? [];

        const noSubtopics = subRaw.length === 1 &&
          String(subRaw[0].topic_metadata?.topic_title ?? "").trim().toLowerCase() ===
          topicTitle.trim().toLowerCase();

        const subtopics = [];
        if (noSubtopics) {
          const t = subRaw[0];
          const m = t.topic_metadata ?? {};
          subtopics.push({
            id: m.topic_id ?? "", code: "", title: topicTitle,
            order: Number(m.sequence_order) || 1,
            duration: Number(m.recommended_duration_periods) || 0,
            outcomes: (t.learning_outcomes ?? []).map(o => ({ text: o.outcome_text ?? "", domain: domainFrom(o.domain), rawDomain: o.domain ?? "" })),
            contentScope: { mustCover: t.content_scope?.must_cover ?? [], excluded: (t.content_scope?.explicitly_excluded ?? []).map(e => typeof e === "string" ? e : e.text_verbatim).filter(Boolean) },
            activities: (t.suggested_learning_activities ?? []).map(a => ({ type: a.activity_type ?? "", description: a.description ?? "" })),
            assessments: (t.suggested_assessment_activities ?? []).map(a => ({ type: a.assessment_type ?? "", description: a.description ?? "" })),
            practicals: t.practical_requirements?.practicals ?? [],
            project: t.project_requirements?.is_project_required ? { required: true, details: t.project_requirements.project_scope_verbatim ?? "" } : null,
            notes: (t.syllabus_notes ?? []).map(n => n.text_verbatim).filter(Boolean),
            hasSub: false
          });
        } else {
          subRaw.forEach((t, i) => {
            const m = t.topic_metadata ?? {};
            subtopics.push({
              id: m.topic_id ?? "", code: "", title: m.topic_title ?? "",
              order: Number(m.sequence_order) || (i + 1),
              duration: Number(m.recommended_duration_periods) || 0,
              outcomes: (t.learning_outcomes ?? []).map(o => ({ text: o.outcome_text ?? "", domain: domainFrom(o.domain), rawDomain: o.domain ?? "" })),
              contentScope: { mustCover: t.content_scope?.must_cover ?? [], excluded: (t.content_scope?.explicitly_excluded ?? []).map(e => typeof e === "string" ? e : e.text_verbatim).filter(Boolean) },
              activities: (t.suggested_learning_activities ?? []).map(a => ({ type: a.activity_type ?? "", description: a.description ?? "" })),
              assessments: (t.suggested_assessment_activities ?? []).map(a => ({ type: a.assessment_type ?? "", description: a.description ?? "" })),
              practicals: t.practical_requirements?.practicals ?? [],
              project: t.project_requirements?.is_project_required ? { required: true, details: t.project_requirements.project_scope_verbatim ?? "" } : null,
              notes: (t.syllabus_notes ?? []).map(n => n.text_verbatim).filter(Boolean),
              hasSub: true
            });
          });
        }

        termEntry.topics.push({ topicCode, topicTitle, topicCompetency, subtopics });
      }

      terms.push(termEntry);
    }
  }

  return {
    country: "uganda", curriculum: "ncdc", level: "uace",
    subject: meta.subject ?? "", classLevel,
    terminology: { item: "Topic", subitem: "Sub-topic", group: "Topic" },
    terms
  };
};