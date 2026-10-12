import { useMemo, useState } from 'react';
import { skillHubs, skillLinks } from '../../content/profile';
import { Reveal } from '../ui/Section';

// Skill constellation: every skill links to where it was used (skillLinks in
// profile.js). Hover or focus a skill to light up its links; hover a project to
// light up its skills; click a project to open it. Tapping a skill pins it.
const WIDTH = 1100;
const HEIGHT = 620;
const HUB_AT = { ojtrack: [380, 310], primesys: [760, 200], gothong: [760, 470] };
// Columns of skills, by which hubs they link to: x, and the vertical span to fill.
const COLUMNS = {
  ojtrack: { x: 150, top: 150, bottom: 470 },
  'ojtrack primesys': { x: 570, top: 130, bottom: 490 },
  primesys: { x: 960, top: 60, bottom: 285 },
  gothong: { x: 960, top: 355, bottom: 585 },
};

function buildLayout() {
  const groups = {};
  for (const [skill, hubs] of Object.entries(skillLinks)) (groups[hubs.join(' ')] ??= []).push({ skill, hubs });
  const nodes = [];
  for (const [key, list] of Object.entries(groups)) {
    const column = COLUMNS[key] ?? COLUMNS['ojtrack primesys'];
    list.forEach((item, i) => {
      const y = list.length === 1 ? (column.top + column.bottom) / 2 : column.top + ((column.bottom - column.top) * i) / (list.length - 1);
      nodes.push({ ...item, x: column.x, y, w: item.skill.length * 8.4 + 32 });
    });
  }
  // Gently curved links from each skill to each of its hubs.
  const edges = nodes.flatMap((node) =>
    node.hubs.map((hub) => {
      const [hx, hy] = HUB_AT[hub];
      const mx = (node.x + hx) / 2;
      const my = (node.y + hy) / 2;
      const bend = 0.12;
      const d = `M ${node.x} ${node.y} Q ${mx - (hy - node.y) * bend} ${my + (hx - node.x) * bend} ${hx} ${hy}`;
      return { key: `${node.skill}-${hub}`, skill: node.skill, hub, d };
    }),
  );
  return { nodes, edges };
}

const hubLabel = (id) => skillHubs.find((hub) => hub.id === id)?.label ?? id;
const skillsOf = (hubId) => Object.keys(skillLinks).filter((skill) => skillLinks[skill].includes(hubId));

export function SkillMap() {
  const { nodes, edges } = useMemo(() => buildLayout(), []);
  const [hover, setHover] = useState(null);
  const [pinned, setPinned] = useState(null);
  const focus = hover ?? pinned;

  const hotSkills = new Set();
  const hotHubs = new Set();
  if (focus?.type === 'skill') {
    hotSkills.add(focus.id);
    skillLinks[focus.id].forEach((hub) => hotHubs.add(hub));
  } else if (focus?.type === 'hub') {
    hotHubs.add(focus.id);
    skillsOf(focus.id).forEach((skill) => hotSkills.add(skill));
  }
  const state = (isHot) => (focus ? (isHot ? 'is-hot' : 'is-dim') : '');

  const info = !focus
    ? 'Hover or tap a skill to see where it was used. Click a project to open it.'
    : focus.type === 'skill'
      ? `${focus.id}: used in ${skillLinks[focus.id].map(hubLabel).join(' and ')}`
      : `${hubLabel(focus.id)}: ${skillsOf(focus.id).join(', ')}`;

  const pin = (skill) => setPinned((current) => (current?.id === skill ? null : { type: 'skill', id: skill }));
  const openHub = (hub) => window.location.assign(hub.href);
  const onKey = (action) => (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  return (
    <Reveal className="skill-map">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="skill-map-svg" role="group" aria-label="Skill map: which skills were used where">
        <g className="sm-edges" aria-hidden="true">
          {edges.map((edge, i) => (
            <path
              key={edge.key}
              d={edge.d}
              pathLength="1"
              className={`sm-edge ${state(edge.skill === focus?.id || edge.hub === focus?.id)}`}
              style={{ '--i': i }}
            />
          ))}
        </g>

        {skillHubs.map((hub, i) => {
          const [x, y] = HUB_AT[hub.id];
          return (
            <g
              key={hub.id}
              transform={`translate(${x} ${y})`}
              className={`sm-hub ${state(hotHubs.has(hub.id))}`}
              tabIndex={0}
              role="button"
              aria-label={`${hub.label}, ${hub.note}. Skills: ${skillsOf(hub.id).join(', ')}. Open`}
              onMouseEnter={() => setHover({ type: 'hub', id: hub.id })}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover({ type: 'hub', id: hub.id })}
              onBlur={() => setHover(null)}
              onClick={() => openHub(hub)}
              onKeyDown={onKey(() => openHub(hub))}
            >
              <g className="sm-pop" style={{ '--i': i }}>
                <circle className="sm-halo" r="60" />
                <circle className="sm-core" r="44" />
                <text className="sm-hub-label" y="5">
                  {hub.label}
                </text>
                <text className="sm-hub-note" y="72">
                  {hub.note}
                </text>
              </g>
            </g>
          );
        })}

        {nodes.map((node, i) => (
          <g
            key={node.skill}
            transform={`translate(${node.x} ${node.y})`}
            className={`sm-skill ${state(hotSkills.has(node.skill))}${pinned?.id === node.skill ? ' is-pinned' : ''}`}
            tabIndex={0}
            role="button"
            aria-pressed={pinned?.id === node.skill}
            aria-label={`${node.skill}, used in ${node.hubs.map(hubLabel).join(' and ')}`}
            onMouseEnter={() => setHover({ type: 'skill', id: node.skill })}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover({ type: 'skill', id: node.skill })}
            onBlur={() => setHover(null)}
            onClick={() => pin(node.skill)}
            onKeyDown={onKey(() => pin(node.skill))}
          >
            <g className="sm-pop" style={{ '--i': i + 3 }}>
              <rect x={-node.w / 2} y="-17" width={node.w} height="34" rx="17" />
              <text y="5">{node.skill}</text>
            </g>
          </g>
        ))}
      </svg>
      <p className="skill-map-info" aria-live="polite">
        {info}
      </p>
    </Reveal>
  );
}
