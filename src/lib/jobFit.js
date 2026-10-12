import { fitSkills, notYet } from '../content/jobFit';
import { profile, skillHubs, skillLinks } from '../content/profile';

// Matches a pasted job post against content/jobFit.js. Runs entirely in the
// browser; the text is never sent or stored.

const hubs = Object.fromEntries(skillHubs.map((hub) => [hub.id, hub]));
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Whole words only, with plurals and space/hyphen variants: "problem solving"
// also finds "problem-solving", and "printer" finds "printers".
function pattern(term, flags) {
  const body = escape(term).replace(/-/g, '[\\s-]?').replace(/ /g, '[\\s-]+');
  const plural = /\p{L}$/u.test(term) ? '(?:e?s)?' : '';
  return new RegExp(`(?<![\\p{L}\\p{N}])${body}${plural}(?![\\p{L}\\p{N}])`, flags);
}

function evidenceFor(skill) {
  const ids = [...(skill.from ? (skillLinks[skill.from] ?? []) : []), ...(skill.where ?? [])];
  return [...new Set(ids)].map((id) => (hubs[id] ? { label: hubs[id].label, href: hubs[id].href } : { label: id }));
}

const catalog = [...fitSkills.map((skill) => ({ ...skill, has: true })), ...notYet.map((skill) => ({ ...skill, has: false }))].map(
  (skill) => ({
    ...skill,
    weight: skill.weight ?? 1,
    evidence: skill.has ? evidenceFor(skill) : [],
    patterns: [...skill.terms.map((term) => pattern(term, 'giu')), ...(skill.caseTerms ?? []).map((term) => pattern(term, 'gu'))],
  }),
);

const levels = [
  { min: 80, label: 'Strong match', tone: 'ok' },
  { min: 60, label: 'Good match', tone: 'ok' },
  { min: 40, label: 'Partial match', tone: 'accent' },
  { min: 0, label: 'Stretch role', tone: 'warn' },
];

// The post's first line, when it looks like a job title.
function titleOf(text) {
  const line = text.split('\n').map((part) => part.trim()).find(Boolean) ?? '';
  const title = line.replace(/^(job title|position|role)\s*[:\-–]\s*/i, '');
  return title.length >= 3 && title.length <= 80 ? title : null;
}

export function analyzeJob(text) {
  const hits = [];
  for (const skill of catalog) {
    for (const re of skill.patterns) {
      for (const match of text.matchAll(re)) hits.push({ start: match.index, end: match.index + match[0].length, skill });
    }
  }
  // Where terms overlap, the longest wins: "React Native" over "React", "node.js" over "js".
  hits.sort((a, b) => b.end - b.start - (a.end - a.start) || a.start - b.start);
  const kept = [];
  for (const hit of hits) {
    if (!kept.some((other) => hit.start < other.end && other.start < hit.end)) kept.push(hit);
  }
  kept.sort((a, b) => a.start - b.start);

  const found = catalog.filter((skill) => kept.some((hit) => hit.skill === skill));
  const matched = found.filter((skill) => skill.has);
  const missing = found.filter((skill) => !skill.has);
  const weigh = (list) => list.reduce((total, skill) => total + skill.weight, 0);
  const total = weigh(matched) + weigh(missing);
  const score = total ? Math.round((100 * weigh(matched)) / total) : null;

  // The post split into plain text and highlighted skill words, for display.
  const segments = [];
  let at = 0;
  for (const hit of kept) {
    if (hit.start > at) segments.push({ text: text.slice(at, hit.start) });
    segments.push({ text: text.slice(hit.start, hit.end), has: hit.skill.has, label: hit.skill.label });
    at = hit.end;
  }
  if (at < text.length) segments.push({ text: text.slice(at) });

  return {
    score,
    level: score === null ? null : levels.find((level) => score >= level.min),
    matched,
    missing,
    segments,
    title: titleOf(text),
  };
}

// Plain-text summary a recruiter can paste into their notes.
export function fitSummary(result, link) {
  return [
    `${profile.name}: ${result.score}% fit${result.title ? ` for "${result.title}"` : ''} (${result.level.label})`,
    `On his résumé: ${result.matched.map((skill) => skill.label).join(', ')}`,
    result.missing.length > 0 && `Not on it yet: ${result.missing.map((skill) => skill.label).join(', ')}`,
    `Portfolio: ${link}`,
    `Email: ${profile.email}`,
  ]
    .filter(Boolean)
    .join('\n');
}

// A first message for the contact form.
export function fitMessage(result) {
  const top = result.matched.slice(0, 6).map((skill) => skill.label);
  return `Hi Felix,\n\nI'm hiring for ${result.title ? `"${result.title}"` : 'a role'} and ran it through your fit check (${result.score}%, ${result.level.label.toLowerCase()}): ${top.join(', ')}.\n\nI'd like to talk about it.`;
}
