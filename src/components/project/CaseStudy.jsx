// Case study body shown inside the project dialog.
// Blocks without content (e.g. no roles or contribution listed) are skipped.
export function CaseStudy({ project }) {
  const contribution = project.contribution ?? [];
  const hasMyRole = project.role || contribution.length > 0;

  const blocks = [
    { title: 'Overview', body: <p>{project.overview}</p> },
    { title: 'Problem', body: <p>{project.problem}</p> },
    {
      title: 'Solution',
      body: (
        <>
          <p>{project.solution}</p>
          {project.howItWorksTitle && <p className="steps-title">{project.howItWorksTitle}</p>}
          <ol className="steps">
            {project.howItWorks.map((step) => (
              <li key={step.title}>
                <p className="step-title">{step.title}</p>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </>
      ),
    },
    project.roles?.length > 0 && {
      title: 'Who uses it',
      body: (
        <dl className="role-list">
          {project.roles.map((role) => (
            <div key={role.title}>
              <dt>
                {role.title}
                {role.tag && <span className="role-tag">{role.tag}</span>}
              </dt>
              <dd>{role.text}</dd>
            </div>
          ))}
        </dl>
      ),
    },
    hasMyRole && {
      title: 'My role',
      body: (
        <>
          {project.role && (
            <p>
              {project.role}
              {project.team && ` on a ${project.team.toLowerCase()}`}.
            </p>
          )}
          {contribution.length > 0 && (
            <ul className="bullets">
              {contribution.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </>
      ),
    },
    project.learned?.length > 0 && {
      title: 'What I learned',
      body: (
        <ul className="bullets">
          {project.learned.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ),
    },
  ].filter(Boolean);

  return (
    <div className="case-study">
      {blocks.map((block, i) => (
        <section key={block.title} className="case-block">
          <h3 className="case-title">
            <span className="case-num">{String(i + 1).padStart(2, '0')}</span>
            {block.title}
          </h3>
          <div className="case-body">{block.body}</div>
        </section>
      ))}
    </div>
  );
}
