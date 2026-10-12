import { education } from '../../content/profile';
import { openCertificate } from '../../lib/certificates';
import { Icon } from '../ui/Icon';
import { Reveal } from '../ui/Section';

// Degree card, shown in the Experience section. The capstone link opens its case
// study; "View diploma" opens the diploma from the Certificates list.
export function Education() {
  const { capstone } = education;

  return (
    <Reveal className="edu-card spotlight" data-pointer style={{ '--i': 1 }}>
      <p className="timeline-period">{education.period}</p>
      <h4 className="edu-degree">{education.degree}</h4>
      <p className="edu-school">{education.school}</p>
      <p className="edu-grad">Graduated {education.graduated}</p>
      {capstone && (
        <p className="edu-capstone">
          Capstone project: <a href={`#project-${capstone.projectId}`}>{capstone.name}</a>
          {capstone.note && `, ${capstone.note}`}
        </p>
      )}
      {education.certificate && (
        <button type="button" className="text-link cert-link" onClick={() => openCertificate(education.certificate)}>
          <Icon name="award" size={15} /> View diploma
        </button>
      )}
    </Reveal>
  );
}
