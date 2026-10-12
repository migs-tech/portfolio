import { useState } from 'react';
import { skillGroups } from '../../content/profile';
import { TagList } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Reveal, Section } from '../ui/Section';
import { SkillGalaxy } from './SkillGalaxy';

// Two views of the same skills: the interactive galaxy (where each one was used)
// and the grouped cards. Phones always get the cards; the galaxy needs room for its labels.
export function Skills() {
  const [view, setView] = useState('galaxy');

  return (
    <Section
      id="skills"
      index="04"
      label="Skills"
      title="Tools I’ve used on real work"
      intro="Everything here was used on the job or in the two projects above. The galaxy shows where."
      className="section-alt"
    >
      <div className="skills-toolbar" role="group" aria-label="Skills view">
        {[
          ['galaxy', 'Galaxy'],
          ['cards', 'Cards'],
        ].map(([id, label]) => (
          <button key={id} type="button" aria-pressed={view === id} onClick={() => setView(id)}>
            {label}
          </button>
        ))}
      </div>

      <div className={`skills-views is-${view}`}>
        <SkillGalaxy />
        <ul className="skill-grid" role="list">
          {skillGroups.map((group, i) => (
            <Reveal
              as="li"
              key={group.title}
              className={`skill-card spotlight${group.wide ? ' is-wide' : ''}`}
              data-pointer
              style={{ '--i': i }}
            >
              {group.icon && (
                <span className="skill-icon">
                  <Icon name={group.icon} size={20} />
                </span>
              )}
              <h3 className="skill-title">{group.title}</h3>
              {group.summary && <p className="skill-summary">{group.summary}</p>}
              <TagList items={group.items} className="tags-sm" />
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  );
}
