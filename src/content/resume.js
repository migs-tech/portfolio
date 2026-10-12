// The web version of the résumé, shown in the résumé viewer
// (components/resume/ResumeViewer.jsx). Wording matches the PDF in
// public/resume/; update both together. The street address and phone number are
// left out here on purpose (they're in the PDF): web pages are easy to scrape.
export const resume = {
  updated: 'September 2026',
  name: 'Felix Miguel M. Atenin',
  location: 'Tandag City, Surigao del Sur',
  email: 'miguelfelix200415@gmail.com',

  projects: [
    {
      name: 'OJTrack',
      title: 'Attendance Monitoring and Reporting System',
      note: 'Capstone Project',
      role: 'Full-Stack Developer',
      projectId: 'ojtrack', // opens the case study
      bullets: [
        'Designed and developed a mobile and web-based attendance monitoring system, simplified attendance tracking and report generation for OJT participants.',
        'Implemented QR code-based attendance verification, reducing manual recording processes and improving accuracy.',
      ],
    },
    {
      name: 'PRimeSys',
      title: 'Web-Based Procurement Management System',
      role: 'Full-Stack Developer',
      projectId: 'primesys',
      bullets: [
        'Developed a full-stack web application using React.js, Node.js, Express.js, and MySQL to centralize procurement records and automate procurement workflows.',
        'Implemented role-based authentication, purchase request management, supplier bidding, purchase order tracking, and real-time status monitoring features.',
      ],
    },
  ],

  work: [
    {
      role: 'OJT Intern',
      organization: 'Gothong Southern Shipping Lines',
      period: 'February 2026 – April 2026',
      certificate: 'ojt', // "View certificate" opens it
      bullets: [
        'Provided technical support and troubleshooting for hardware, software, computer systems, printers, and network devices to resolve employee IT issues.',
        'Assisted with system maintenance, software configuration, preventive maintenance, and IT-related troubleshooting to support reliable daily operations.',
      ],
    },
    {
      role: 'AI Data Transcription Specialist',
      period: 'October 2024 – December 2024',
      bullets: [
        'Transcribed, reviewed, and validated multilingual audio data for AI training and speech recognition projects while following project-specific quality standards.',
        'Corrected automated speech recognition (ASR) outputs and maintained accuracy, attention to detail, and timely completion of assigned data annotation tasks.',
      ],
    },
    {
      role: 'Web Developer',
      organization: 'Self Employed',
      period: 'July 2024 – December 2025',
      bullets: [
        'Developed responsive portfolio and e-commerce websites using HTML, CSS, JavaScript, and React.js based on client requirements.',
        'Customized website layouts and functionality, communicated with clients to gather requirements, and delivered completed web projects on schedule.',
      ],
    },
  ],

  education: {
    school: 'North Eastern Mindanao State University – Cantilan Campus',
    period: '2022–2026',
    degree: 'Bachelor of Science in Information Technology',
    graduated: 'June 16, 2026',
    certificate: 'diploma',
  },

  technicalSkills: [
    'Technical Support and Troubleshooting',
    'Hardware Maintenance',
    'Software Installation',
    'Network Troubleshooting',
    'Web Development (React.js, HTML, CSS, JavaScript)',
    'Google Workspace',
    'Microsoft Office Suite (Word, Excel, PowerPoint)',
    'Data Entry',
    'Documentation',
  ],

  personalSkills: [
    'Attention to Details',
    'Willingness to Learn',
    'Adaptability',
    'Analytical Thinking',
    'Technical Aptitude',
    'Problem Solving',
    'Time Management',
    'Organization and Multitasking',
  ],
};
