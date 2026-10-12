// What the job fit checker (components/sections/JobFit.jsx) looks for in a pasted job post.
//
// `skills` are on my résumé. Each lists the words a job post might use for it:
// `terms` match in any case, plurals included; `caseTerms` match only as written,
// for words that are also plain English. `from` names a skill in `skillLinks`
// (profile.js) to borrow where I used it; `where` adds hub ids from `skillHubs`
// or short notes. Only add what the résumé or projects back up.
//
// `notYet` are common requirements I can't claim yet. They count against the
// score, so the result stays honest.
//
// `weight` (default 1): soft skills and background count half, so they can't
// carry a technical role on their own.
export const fitSkills = [
  // Development
  { label: 'React', terms: ['react', 'react.js', 'reactjs'], from: 'React' },
  { label: 'React Native & Expo', terms: ['react native', 'expo'], from: 'React Native' },
  { label: 'Vue.js', terms: ['vue', 'vue.js', 'vuejs', 'vue 3'], from: 'Vue.js' },
  { label: 'JavaScript', terms: ['javascript', 'js', 'es6', 'ecmascript'], from: 'JavaScript' },
  { label: 'HTML', terms: ['html', 'html5'], from: 'HTML' },
  { label: 'CSS', terms: ['css', 'css3'], from: 'CSS' },
  { label: 'Tailwind CSS', terms: ['tailwind', 'tailwind css', 'tailwindcss'], from: 'Tailwind CSS' },
  { label: 'Responsive design', terms: ['responsive', 'mobile-first', 'cross-browser'], where: ['ojtrack', 'primesys'] },
  { label: 'Web development', terms: ['web development', 'web developer', 'website', 'web application', 'web app', 'front-end', 'frontend'], where: ['primesys', 'Freelance clients'] },
  { label: 'Full-stack development', terms: ['full-stack', 'full stack', 'end-to-end', 'end to end'], where: ['ojtrack', 'primesys'] },
  { label: 'PHP', terms: ['php'], from: 'PHP' },
  { label: 'Node.js', terms: ['node.js', 'nodejs', 'node'], from: 'Node.js' },
  { label: 'Express', terms: ['express.js', 'expressjs'], caseTerms: ['Express'], from: 'Express' },
  { label: 'REST APIs', terms: ['rest api', 'restful', 'api', 'web services', 'backend', 'back-end'], from: 'REST APIs' },
  { label: 'MySQL / SQL databases', terms: ['mysql', 'mariadb', 'sql', 'database', 'relational database'], from: 'MySQL' },
  { label: 'Real-time features', terms: ['socket.io', 'websocket', 'real-time', 'realtime'], where: ['primesys'] },
  { label: 'Mobile apps', terms: ['mobile app', 'mobile development', 'android'], where: ['ojtrack'] },
  { label: 'Git & version control', terms: ['git', 'github', 'version control'], where: ['ojtrack', 'primesys'] },
  { label: 'Deployment', terms: ['vercel', 'deployment', 'deploy', 'deploying', 'hosting'], from: 'Vercel' },

  // IT support
  { label: 'Technical support', terms: ['technical support', 'tech support', 'it support', 'help desk', 'helpdesk', 'service desk', 'desktop support', 'end-user support', 'user support', 'ticket'], where: ['gothong'] },
  { label: 'Troubleshooting', terms: ['troubleshoot', 'troubleshooting', 'diagnose', 'diagnosing', 'resolve issues', 'issue resolution'], where: ['gothong'] },
  { label: 'Hardware maintenance', terms: ['hardware', 'computer repair', 'pc repair', 'computer hardware'], from: 'Hardware maintenance' },
  { label: 'Software installation & setup', terms: ['software installation', 'install', 'installed', 'installing', 'installation', 'configure', 'configured', 'configuring', 'configuration', 'set up', 'setup'], from: 'Software installation' },
  { label: 'Networking', terms: ['network', 'networking', 'lan', 'wan', 'tcp/ip', 'wi-fi', 'wifi', 'router', 'connectivity'], from: 'Network troubleshooting' },
  { label: 'Printers & peripherals', terms: ['printer', 'peripheral', 'scanner'], from: 'Printers & peripherals' },
  { label: 'Preventive maintenance', terms: ['preventive maintenance', 'preventative maintenance', 'system maintenance', 'maintenance'], from: 'Preventive maintenance' },

  // Tools and office work
  { label: 'Microsoft Office', terms: ['microsoft office', 'ms office', 'office 365', 'microsoft 365', 'excel', 'powerpoint', 'ms word', 'microsoft word'] },
  { label: 'Google Workspace', terms: ['google workspace', 'g suite', 'gsuite', 'google docs', 'google sheets', 'google drive'] },
  { label: 'Data entry', terms: ['data entry', 'data encoding', 'encoding', 'encoder'] },
  { label: 'Documentation', terms: ['documentation', 'documenting', 'document'] },
  { label: 'AI data & transcription', terms: ['transcription', 'transcribe', 'annotation', 'data labeling', 'data labelling', 'speech recognition', 'asr'], where: ['AI transcription (freelance)'] },

  // Strengths
  { label: 'Problem solving', weight: 0.5, terms: ['problem solving', 'problem-solving', 'problem solver'] },
  { label: 'Analytical thinking', weight: 0.5, terms: ['analytical', 'analytical thinking', 'critical thinking'] },
  { label: 'Attention to detail', weight: 0.5, terms: ['attention to detail', 'detail-oriented', 'detail oriented'] },
  { label: 'Time management', weight: 0.5, terms: ['time management', 'deadline', 'prioritize', 'prioritise'] },
  { label: 'Adaptability', weight: 0.5, terms: ['adaptable', 'adaptability', 'flexible', 'fast-paced'] },
  { label: 'Organization & multitasking', weight: 0.5, terms: ['multitask', 'multitasking', 'multi-task', 'organized', 'organised', 'organizational'] },
  { label: 'Willingness to learn', weight: 0.5, terms: ['willing to learn', 'willingness to learn', 'eager to learn', 'quick learner', 'fast learner', 'learn quickly'] },
  { label: 'Communication', weight: 0.5, terms: ['communication', 'communicate', 'communication skills', 'interpersonal'], where: ['Freelance clients'] },
  { label: 'Teamwork', weight: 0.5, terms: ['teamwork', 'team player', 'collaborate', 'collaboration', 'cross-functional'], where: ['ojtrack'] },

  // Background
  { label: 'IT degree', weight: 0.5, terms: ['bachelor', "bachelor's", 'degree', 'information technology', 'related field'], where: ['NEMSU, Class of 2026'] },
  { label: 'Entry-level ready', weight: 0.5, terms: ['fresh graduate', 'fresh grad', 'entry level', 'entry-level', 'junior', 'graduate', 'intern', 'internship', 'ojt', 'trainee'], where: ['gothong'] },
];

export const notYet = [
  { label: 'TypeScript', terms: ['typescript'] },
  { label: 'Python', terms: ['python'] },
  { label: 'Java', terms: ['java'] },
  { label: 'C#', terms: ['c#'] },
  { label: 'C++', terms: ['c++'] },
  { label: '.NET', terms: ['.net', 'asp.net', 'dotnet'] },
  { label: 'Go', terms: ['golang'] },
  { label: 'Ruby on Rails', terms: ['ruby', 'rails'] },
  { label: 'Kotlin', terms: ['kotlin'] },
  { label: 'Swift', terms: ['swiftui'], caseTerms: ['Swift'] },
  { label: 'Flutter', terms: ['flutter', 'dart'] },
  { label: 'Angular', terms: ['angular', 'angularjs'] },
  { label: 'Next.js', terms: ['next.js', 'nextjs'] },
  { label: 'Svelte', terms: ['svelte'] },
  { label: 'Laravel', terms: ['laravel'] },
  { label: 'Django', terms: ['django'] },
  { label: 'Spring Boot', terms: ['spring boot'] },
  { label: 'PostgreSQL', terms: ['postgresql', 'postgres'] },
  { label: 'MongoDB', terms: ['mongodb', 'mongo'] },
  { label: 'Firebase', terms: ['firebase'] },
  { label: 'Redis', terms: ['redis'] },
  { label: 'GraphQL', terms: ['graphql'] },
  { label: 'Docker', terms: ['docker', 'containers'] },
  { label: 'Kubernetes', terms: ['kubernetes', 'k8s'] },
  { label: 'AWS', terms: ['aws', 'amazon web services'] },
  { label: 'Azure', terms: ['azure'] },
  { label: 'Google Cloud', terms: ['google cloud', 'gcp'] },
  { label: 'Linux', terms: ['linux', 'ubuntu', 'unix'] },
  { label: 'Active Directory', terms: ['active directory'] },
  { label: 'Windows Server', terms: ['windows server'] },
  { label: 'Cisco / CCNA', terms: ['cisco', 'ccna'] },
  { label: 'ITIL', terms: ['itil'] },
  { label: 'Jira', terms: ['jira'] },
  { label: 'CI/CD', terms: ['ci/cd', 'continuous integration', 'jenkins', 'github actions'] },
  { label: 'Automated testing', terms: ['unit test', 'unit testing', 'automated testing', 'jest', 'cypress', 'selenium'] },
  { label: 'Figma', terms: ['figma'] },
  { label: 'WordPress', terms: ['wordpress'] },
  { label: 'Power BI / Tableau', terms: ['power bi', 'tableau'] },
  { label: 'SAP / Salesforce', terms: ['sap', 'salesforce'] },
  { label: 'Virtualization', terms: ['vmware', 'virtualization', 'hyper-v'] },
  { label: 'Cybersecurity', terms: ['cybersecurity', 'cyber security', 'firewall', 'siem'] },
];

// Ready-made posts for visitors who don't have one to hand.
export const samplePosts = [
  {
    label: 'IT Support Specialist',
    text: `IT Support Specialist

We're looking for an IT Support Specialist to keep our office running.

Responsibilities
- Provide technical support to employees by phone, email and in person
- Troubleshoot hardware, software and network issues
- Install and configure software; set up new workstations
- Maintain printers and peripherals and perform preventive maintenance
- Document fixes and keep the inventory up to date

Requirements
- Bachelor's degree in Information Technology or a related field
- Familiar with Windows, Active Directory and Microsoft Office
- Good communication and problem-solving skills, attention to detail
- Fresh graduates are welcome to apply`,
  },
  {
    label: 'Junior Web Developer',
    text: `Junior Web Developer

Join our team to build fast, responsive websites and web apps.

What you'll do
- Build pages with HTML, CSS and JavaScript
- Develop features in React and connect them to REST APIs
- Use Git for version control and help deploy releases
- Collaborate with designers and back-end developers

Nice to have
- TypeScript, Tailwind CSS, Figma

We value problem-solving, teamwork and a willingness to learn. Entry-level applicants welcome.`,
  },
  {
    label: 'Full-Stack Developer',
    text: `Full-Stack Developer (React / Node.js)

Build features end to end for our operations platform.

- Front end in React; back end in Node.js and Express
- Design MySQL databases and RESTful APIs
- Add real-time updates with WebSockets
- Deploy to the cloud (AWS or Vercel)

Bonus points for Docker, PostgreSQL and CI/CD experience.
Strong communication and time management required.`,
  },
];
