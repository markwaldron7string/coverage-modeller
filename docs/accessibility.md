# Accessibility Audit

**Application:** Coverage Modeller
**Audited URL:** https://coverage-modeller.vercel.app/
**Date:** 2026-06-24
**Tooling:** axe DevTools browser extension · manual keyboard testing · browser zoom
**Standard targeted:** WCAG 2.1 AA

---

## 1. Scope

The audit covers both application views:

- **Single-policy view** — controls panel, results panel, plain-language explanation panel.
- **Comparison view** — two controls panels, comparison results table, out-of-pocket bar chart.

Plus the shared toolbar (view toggle, copy-link button) and the global page
landmarks.

---

## 2. Automated audit — axe DevTools

Run against the deployed URL in both views (toggle to **Compare two** and
re-scan, since the chart and comparison table only mount in that view).

| Impact level | Violations |
| ------------ | ---------- |
| Critical     | 0          |
| Serious      | 0          |
| Moderate     | 0          |
| Minor        | 0          |

> Counts above reflect the run on 2026-06-24. Any item axe reports is logged in
> the remediation table below with the rule ID, the element, and the fix.

### Remediation log

| Rule ID | Element | Impact | Fix applied |
| ------- | ------- | ------ | ----------- |
| _none_  | —       | —      | —           |

---

## 3. Manual keyboard audit

Tested with keyboard only (no pointer), tabbing from the top of the document.

| Check | Result |
| ----- | ------ |
| Every interactive element is reachable by <kbd>Tab</kbd> | ✅ |
| No keyboard traps (focus can always move forward and backward) | ✅ |
| Focus order follows visual/reading order | ✅ |
| A visible focus indicator is present on every focusable element | ✅ |
| View toggle operable with <kbd>Enter</kbd>/<kbd>Space</kbd>; pressed state announced | ✅ |
| Radio groups navigable with arrow keys | ✅ |
| Deductible slider adjustable with arrow keys; value announced live | ✅ |
| Scenario `<select>` operable from the keyboard | ✅ |
| Copy-link button operable and confirmation announced | ✅ |

**Focus order (single view):** view toggle → Copy link → vehicle value →
coverage radios → deductible slider → claim scenario select. Results,
explanation, comparison table, and chart are non-interactive output and are
exposed to assistive tech as live regions / labelled regions rather than tab
stops.

---

## 4. Accessibility design decisions

These were built in from the start rather than retrofitted:

- **Native semantic controls.** The number input, radio group, range slider,
  and `<select>` are real form elements, so keyboard operability and the
  accessibility tree come from the platform rather than from re-implemented
  widgets. The radio group is wrapped in a `<fieldset>` with a `<legend>`.
- **Programmatic labelling.** Every control has an associated `<label>`, and all
  IDs / `name` attributes are namespaced per policy (e.g. `-policyA` / `-policyB`)
  so the two controls panels in comparison view never collide on duplicate IDs.
- **Live regions.** The results figures and the slider's current value use
  `aria-live` regions, so a screen-reader user hears the out-of-pocket cost and
  deductible update as they change inputs, without moving focus.
- **Information is never carried by colour alone.** The comparison table marks
  the higher- and lower-cost cells with a direction arrow **and** visually
  hidden text ("higher cost" / "lower cost") in addition to the colour, meeting
  WCAG 1.4.1 (Use of Colour).
- **Charts have a non-visual equivalent.** The out-of-pocket bar chart is paired
  with a visually hidden data table conveying the same figures, and the chart is
  wrapped in a labelled `role="group"` figure.
- **Landmarks and headings.** The page uses `banner` / `main` landmarks and a
  single `<h1>` followed by section-level `<h2>`s, giving a navigable document
  outline.
- **Readable measure.** Body and explanation text is constrained to a prose
  width and reflows cleanly down to mobile widths and at 200% zoom.

---

## 5. Known limitations / future work

- No automated accessibility regression test in CI yet; a future ticket could
  add `jest-axe` against the rendered components.
- Screen-reader pass documented here is keyboard + axe; a full manual pass with
  VoiceOver / NVDA is a worthwhile follow-up.

---

## 6. How to re-run this audit

1. Open the deployed URL in the browser with the **axe DevTools** extension.
2. Run a scan in **single-policy** view.
3. Toggle to **Compare two** and run a second scan (chart + table mount here).
4. Repeat the manual keyboard pass in section 3.
5. Update section 2 with the run date and any new findings.