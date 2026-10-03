// Rwanda REB extractor
// Shape: terms[].themes[].topics[]
// Terminology: Unit → Theme
window.extractRwanda = function (json) {
  const meta = json.curriculum_metadata ?? {};
  const classLevel = meta.class_group ?? "";
  const m = String(classLevel).match(/S(\d)/i);
  const level = m ? (parseInt(m[1], 10) <= 3 ? "o-level" : "a-level") : null;

  const terms = (json.terms ?? []).map(term => ({
    termNumber: term.term_number ?? 1,
    termName: term.term_name ?? "",
    themes: (term.themes ?? []).map(theme => ({
      themeTitle: theme.theme_title ?? "",
      themeDescription: theme.theme_description ?? "",
      topics: (theme.topics ?? []).map(t => {
        const m2 = t.topic_metadata ?? {};
        const lod = t.learning_objectives_by_domain ?? {};
        const knowledge = (lod.knowledge_and_understanding ?? []).map(String);
        const skills = (lod.skills ?? []).map(String);
        const attitudes = (lod.attitudes_and_values ?? []).map(String);
        const excluded = (t.content_scope?.explicitly_excluded ?? [])
          .map(e => typeof e === "string" ? e : e.text_verbatim).filter(Boolean);
        return {
          id: m2.topic_id ?? "",
          label: m2.unit_label ?? "",
          title: m2.topic_title ?? "",
          subTopicArea: m2.sub_topic_area ?? "",
          order: Number(m2.sequence_order) || 0,
          duration: Number(m2.recommended_duration_periods) || 0,
          competency: t.core_competency ?? "",
          outcomes: {
            knowledge, skills, attitudes,
            all: [
              ...knowledge.map(x => ({ text: x, domain: "knowledge" })),
              ...skills.map(x => ({ text: x, domain: "skills" })),
              ...attitudes.map(x => ({ text: x, domain: "attitudes" }))
            ]
          },
          contentScope: {
            mustCover: t.content_scope?.must_cover ?? [],
            optionalEnrichment: t.content_scope?.optional_enrichment ?? [],
            excluded,
            depthLimitations: t.content_scope?.depth_limitations ?? []
          },
          activities: (t.suggested_learning_activities ?? []).map(a => ({
            type: a.activity_type ?? "",
            description: a.description ?? ""
          })),
          assessments: [],
          assessmentCriteria: t.assessment_criteria_verbatim ?? "",
          materials: (t.materials_verbatim ?? "").replace(/\.$/, "").split(/[,;]/).map(s => s.trim()).filter(Boolean),
          project: t.project_requirements?.is_project_required
            ? { required: true, details: t.project_requirements.project_scope_verbatim ?? "" } : null,
          notes: (t.syllabus_notes ?? []).map(n => n.text_verbatim).filter(Boolean)
        };
      })
    }))
  }));

  return {
    country: "rwanda", curriculum: "reb", level,
    subject: meta.subject ?? "", classLevel,
    terminology: { item: "Unit", group: "Theme" },
    terms
  };
};