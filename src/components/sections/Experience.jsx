import { inquiry } from '../../content/inquiry';
import { experience } from '../../content/profile';
import { openCertificate } from '../../lib/certificates';
import { BriefButton, TagList } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Reveal, Section } from '../ui/Section';
import { Certificates } from './Certificates';
import { Education } from './Education';

// Work history on the left, education (and certificates, once added) on the right.
export function Experience() {
  return (
    <Section id="experience" index="03" label="Experience" title="Experience and education">
      <div className="background-grid">
        <div>
          <h3 className="subhead">
            <Icon name="briefcase" size={18} />
            Work
          </h3>
          <ol className="timeline" role="list">
            {experience.map((job, i) => (
              <Reveal
                as="li"
                key={job.role}
                className="timeline-item spotlight"
                data-pointer
                style={{ '--i': i }}
              >
                <span className="timeline-dot" aria-hidden="true" />
                <div className="timeline-head">
                  <h4 className="timeline-role">{job.role}</h4>
                  <p className="timeline-period">
                    {job.period}
                    {job.hours && ` · ${job.hours}`}
                  </p>
                </div>
                <p className="timeline-org">{job.organization}</p>
                <p className="timeline-summary">{job.summary}</p>
                {job.tags?.length > 0 && <TagList items={job.tags} className="tags-sm" />}
                {job.certificate && (
                  <button type="button" className="text-link cert-link" onClick={() => openCertificate(job.certificate)}>
                    <Icon name="award" size={15} /> View certificate
                  </button>
                )}
                {job.inquiry && (
                  <div className="timeline-cta">
                    <BriefButton className="btn-sm" />
                    <span className="timeline-cta-note">
                      <span className="status-dot" aria-hidden="true" />
                      Open for projects · I reply {inquiry.replyTime}
                    </span>
                  </div>
                )}
              </Reveal>
            ))}
          </ol>
        </div>

        <div>
          <h3 className="subhead">
            <Icon name="graduation" size={18} />
            Education
          </h3>
          <Education />
          <Certificates />
        </div>
      </div>
    </Section>
  );
}
