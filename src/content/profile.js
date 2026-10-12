// Personal details, links and résumé. Every fact here is taken from Felix's résumé,
// certificates or the two live projects.
// To add a link, fill in the URL; anything left as null is not rendered.
import diplomaImage from '../assets/images/cert-diploma.webp';
import diplomaThumb from '../assets/images/cert-diploma-600.webp';
import ojtImage from '../assets/images/cert-ojt.webp';
import ojtThumb from '../assets/images/cert-ojt-450.webp';

export const profile = {
  name: 'Felix Miguel M. Atenin',
  role: 'IT Support & Web Developer',
  // The hero shows `rolePrefix` followed by each of `roleWords` in turn, once,
  // ending on the first. Screen readers and the page title use `role`.
  rolePrefix: 'IT Support &',
  roleWords: ['Web Developer', 'Mobile Developer', 'Full-Stack Developer'],
  location: 'Tandag City, Surigao del Sur, Philippines',
  email: 'miguelfelix200415@gmail.com',
  availability: 'Open to work',
  resume: {
    href: '/resume/Felix-Miguel-Atenin-Resume.pdf',
    fileName: 'Felix-Miguel-Atenin-Resume.pdf',
  },
  // Short bio shown in the hero, one string per paragraph.
  bio: [
    'I’m an Information Technology graduate (NEMSU, Class of 2026) who builds full-stack web and mobile systems and keeps hardware, software and networks running.',
    'Two of my systems are live today: OJTrack, a QR-based OJT attendance app its users rated 4.47 out of 5, and PRimeSys, a procurement system for my university.',
  ],
};

// The three numbers under the hero. `unit` is shown smaller after the value.
export const highlights = [
  { value: '2', label: 'systems built and deployed, both live today' },
  { value: '4.47', unit: '/ 5', label: 'OJTrack user rating, ISO/IEC 25010' },
  { value: '10', label: 'user roles designed across both systems' },
];

// Only add profiles that actually exist. Items with a null url are hidden.
export const socialLinks = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/felix-miguel-atenin-514512276/' },
  { label: 'Facebook', url: 'https://www.facebook.com/felixmiguel.atenin.7/' },
  { label: 'Instagram', url: 'https://www.instagram.com/_miiiggsss' },
].filter((link) => link.url);

export const navItems = [
  { id: 'projects', label: 'Projects' },
  { id: 'demos', label: 'Try it' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'fit', label: 'Fit check' },
  { id: 'contact', label: 'Contact' },
];

// `icon` is a name from components/ui/Icon.jsx. `wide` cards span two columns.
export const skillGroups = [
  {
    title: 'Frontend',
    icon: 'layout',
    summary: 'Responsive interfaces in React and Vue, styled with CSS and Tailwind.',
    items: ['React', 'Vue.js', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'],
  },
  {
    title: 'Backend & data',
    icon: 'server',
    summary: 'REST APIs in PHP and Node.js on MySQL, with PDFs, email and live updates.',
    items: ['PHP', 'Node.js', 'Express', 'REST APIs', 'MySQL'],
  },
  {
    title: 'Mobile',
    icon: 'phone',
    summary: 'Android apps with React Native and Expo, including camera QR scanning.',
    items: ['React Native', 'Expo'],
  },
  {
    title: 'IT support',
    icon: 'wrench',
    wide: true,
    summary: 'Hands-on technical support and troubleshooting from my OJT internship at Gothong Southern.',
    items: [
      'Hardware maintenance',
      'Software installation',
      'Software configuration',
      'Network troubleshooting',
      'Printers & peripherals',
      'Preventive maintenance',
    ],
  },
  {
    title: 'Tools',
    icon: 'terminal',
    summary: 'Version control, deployment and everyday office work.',
    items: ['Git', 'Vercel', 'Render', 'Google Workspace', 'Microsoft Office'],
  },
];

// Skill map: where each skill was used. Hubs are the places; every link below is
// backed by a project's stack or the résumé. Skills without solid evidence of
// where they were used (e.g. Git, Microsoft Office) stay out of the map.
export const skillHubs = [
  { id: 'ojtrack', label: 'OJTrack', note: 'Capstone · 2025', href: '#project-ojtrack' },
  { id: 'primesys', label: 'PRimeSys', note: 'Solo build · 2026', href: '#project-primesys' },
  { id: 'gothong', label: 'ICT OJT', note: 'Gothong Southern', href: '#experience' },
];

export const skillLinks = {
  'React Native': ['ojtrack'],
  Expo: ['ojtrack'],
  'Vue.js': ['ojtrack'],
  PHP: ['ojtrack'],
  MySQL: ['ojtrack', 'primesys'],
  JavaScript: ['ojtrack', 'primesys'],
  HTML: ['ojtrack', 'primesys'],
  CSS: ['ojtrack', 'primesys'],
  'REST APIs': ['ojtrack', 'primesys'],
  Vercel: ['ojtrack', 'primesys'],
  React: ['primesys'],
  'Tailwind CSS': ['primesys'],
  'Node.js': ['primesys'],
  Express: ['primesys'],
  Render: ['primesys'],
  'Hardware maintenance': ['gothong'],
  'Software installation': ['gothong'],
  'Software configuration': ['gothong'],
  'Network troubleshooting': ['gothong'],
  'Printers & peripherals': ['gothong'],
  'Preventive maintenance': ['gothong'],
};

export const experience = [
  {
    organization: 'Gothong Southern Shipping Lines',
    role: 'OJT Intern',
    period: 'Feb – Apr 2026',
    hours: '486 hours', // from the Certificate of Completion
    year: '2026',
    summary:
      'Provided technical support and troubleshooting for hardware, software, computer systems, printers and network devices, and assisted with system maintenance, software configuration and preventive maintenance.',
    tags: ['Technical support', 'Hardware', 'Networking', 'Software configuration', 'Preventive maintenance'],
    certificate: 'ojt', // id in `certificates` below
  },
  {
    organization: 'Self-employed',
    role: 'Web Developer',
    period: 'Jul 2024 – Dec 2025',
    year: '2025',
    summary:
      'Built responsive portfolio and e-commerce websites for clients with HTML, CSS, JavaScript and React: gathered requirements, customized layouts and features, and delivered on schedule.',
    tags: ['React', 'JavaScript', 'HTML & CSS', 'Client work'],
  },
  {
    organization: 'Freelance',
    role: 'AI Data Transcription Specialist',
    period: 'Oct – Dec 2024',
    year: '2024',
    summary:
      'Transcribed and validated multilingual speech data for AI training, and corrected automated speech recognition (ASR) output to project quality standards.',
    tags: ['Speech data', 'ASR correction', 'Quality checks'],
  },
];

export const education = {
  school: 'North Eastern Mindanao State University – Cantilan Campus',
  degree: 'BS Information Technology',
  period: '2022 – 2026',
  graduated: 'June 16, 2026',
  // Links to the project's case study.
  capstone: { name: 'OJTrack', projectId: 'ojtrack', note: 'rated 4.47 / 5 by its users' },
  certificate: 'diploma', // id in `certificates` below
};

// Certificates, shown under Education with a zoomable view. Images come from
// scripts/optimize-images.mjs, which blurs the signatures. Keep personal records
// such as the full transcript (TOR) off the site.
export const certificates = [
  {
    id: 'diploma',
    kind: 'Diploma',
    title: 'Bachelor of Science in Information Technology',
    issuer: 'North Eastern Mindanao State University – Cantilan Campus',
    date: 'June 16, 2026',
    note: 'Board of Regents Resolution No. 44, s. 2026',
    image: { src: diplomaImage, thumb: diplomaThumb, width: 1170, height: 903 },
    alt: 'Diploma of Felix Miguel M. Atenin for the degree of Bachelor of Science in Information Technology, conferred by North Eastern Mindanao State University – Cantilan Campus on June 16, 2026. Signatures blurred for privacy.',
  },
  {
    id: 'ojt',
    kind: 'OJT certificate',
    title: 'Certificate of Completion: 486 hours of internship',
    issuer: 'Gothong Southern group of companies',
    date: 'April 21, 2026',
    note: 'Given at Yello! Hotel',
    image: { src: ojtImage, thumb: ojtThumb, width: 900, height: 1164 },
    alt: 'Certificate of Completion presented to Felix Miguel M. Atenin by the Gothong Southern group of companies for completing 486 hours of internship, given April 21, 2026 at Yello! Hotel. Signature blurred for privacy.',
  },
];
