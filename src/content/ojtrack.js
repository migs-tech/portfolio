// OJTrack case study. Stack and contribution were checked against the project's
// source code and the capstone paper; features, workflow and evaluation scores
// match the live site (ojt-track-tau.vercel.app).
import webApp from '../assets/images/ojtrack-web-app.webp';
import webAppSm from '../assets/images/ojtrack-web-app-720.webp';
import webSteps from '../assets/images/ojtrack-web-steps.webp';
import webStepsSm from '../assets/images/ojtrack-web-steps-720.webp';
import webFeatures from '../assets/images/ojtrack-web-features.webp';
import webFeaturesSm from '../assets/images/ojtrack-web-features-720.webp';
import webRating from '../assets/images/ojtrack-web-rating.webp';
import webRatingSm from '../assets/images/ojtrack-web-rating-720.webp';
import mobileTrainee from '../assets/images/ojtrack-mobile-trainee.webp';
import mobileTraineeSm from '../assets/images/ojtrack-mobile-trainee-360.webp';
import mobileSupervisor from '../assets/images/ojtrack-mobile-supervisor.webp';
import mobileSupervisorSm from '../assets/images/ojtrack-mobile-supervisor-360.webp';
import mobileRoles from '../assets/images/ojtrack-mobile-roles.webp';
import mobileRolesSm from '../assets/images/ojtrack-mobile-roles-360.webp';

export const ojtrack = {
  id: 'ojtrack',
  name: 'OJTrack',
  title: 'OJTrack — OJT Attendance Monitoring and Reporting System',
  tagline: 'One-time QR attendance and AI-assisted reports for OJT trainees.',
  type: 'Capstone Project',
  role: 'Full-Stack Developer',
  platform: 'Android + Web',
  team: 'Four-person capstone team',
  year: '2025',
  status: 'Live',
  summary:
    'An Android and web system that replaces the OJT logbook. Trainees time in with a one-time QR code that their supervisor scans, daily reports are written with AI help, and coordinators follow attendance, hours and evaluations from a web portal.',

  // Shown on the project card. Keep each to one line of proof.
  highlights: [
    'Rated 4.47 / 5, “Very Functional”, by IT practitioners, faculty and trainees (ISO/IEC 25010)',
    'One-time QR codes behind an email OTP, so attendance can’t be copied or faked',
    'Android app for trainees and supervisors, web portal for coordinators and admins',
  ],
  keyStack: ['React Native', 'Vue 3', 'PHP', 'MySQL', 'OpenAI API'],

  overview:
    'OJTrack was built for the OJT program at North Eastern Mindanao State University – Cantilan Campus. It connects the four groups involved in a student’s training: the trainee, the company supervisor, the OJT coordinator and the administrator.',

  problem:
    'OJT attendance is traditionally kept in manual logbooks and daily time records, and accomplishment reports are written and collected by hand. Entries are easy to copy, supervisors are slow to confirm attendance, and the school can’t see a trainee’s progress until reports are submitted.',

  solution:
    'OJTrack moves attendance and reporting into one system. Trainees and supervisors use the Android app for day-to-day actions, and coordinators and administrators use the web portal to monitor trainees, approve report requests and review evaluations.',

  howItWorksTitle: 'How attendance works',
  howItWorks: [
    {
      title: 'Verify and get an OTP',
      text: 'The trainee confirms their Gmail once, then requests a one-time PIN from the dashboard. It arrives by email.',
    },
    {
      title: 'Generate a one-time QR code',
      text: 'Entering the OTP creates a QR code that works only once and expires shortly after.',
    },
    {
      title: 'Supervisor scans it',
      text: 'The supervisor scans the code with the phone camera to time the trainee in or out. Manual entry covers network problems.',
    },
    {
      title: 'Hours and reports build up',
      text: 'Logged time adds up toward the required OJT hours. Daily reports with photos are refined by AI, and weekly or monthly PDFs are generated and emailed once approved.',
    },
    {
      title: 'Coordinators monitor on the web',
      text: 'The web portal shows attendance, hours completion, report requests, supervisor assignments and evaluations.',
    },
  ],

  features: [
    { title: 'QR code + OTP attendance', text: 'Trainees verify an OTP sent to their email, then show a one-time QR code the supervisor scans.' },
    { title: 'AI-assisted reports', text: 'Short task notes and photos are turned into clear daily accomplishment reports.' },
    { title: 'Hours and progress tracking', text: 'Total hours, weekly attendance and completion toward the required OJT hours, updated in real time.' },
    { title: 'Trainee evaluations', text: 'Supervisors complete midterm and final evaluations that coordinators review with full score details.' },
    { title: 'Report requests', text: 'Trainees request weekly or monthly reports; once approved, the PDF is generated and emailed automatically.' },
    { title: 'Notifications and reminders', text: 'Push and email reminders for time-in, time-out and reports, plus alerts when requests are approved.' },
    { title: 'Manual entry fallback', text: 'Supervisors can record or fix attendance by hand when a phone has no connection.' },
    { title: 'Four roles, two platforms', text: 'Trainees and supervisors on Android; coordinators and administrators on the web portal.' },
  ],

  roles: [
    { title: 'Trainee', tag: 'Mobile app', text: 'Times in with a one-time QR code, submits daily reports with photos and tracks required hours.' },
    { title: 'Supervisor', tag: 'Mobile app', text: 'Scans trainee QR codes, records attendance manually when needed, reviews reports and evaluates trainees.' },
    { title: 'OJT Coordinator', tag: 'Web portal', text: 'Monitors trainees and supervisors, assigns supervisors and approves weekly or monthly report requests.' },
    { title: 'Administrator', tag: 'Web portal', text: 'Verifies coordinator accounts, manages users and sees attendance and completion across the program.' },
  ],

  // ISO/IEC 25010 user evaluation, as published on the live site.
  results: {
    standard: 'ISO/IEC 25010',
    rating: 'Very Functional',
    overall: 4.47,
    note: 'Mean ratings out of 5 from IT practitioners, faculty and OJT trainees.',
    scores: [
      { label: 'Functional suitability', value: 4.47 },
      { label: 'Usability', value: 4.46 },
      { label: 'Performance efficiency', value: 4.45 },
      { label: 'Reliability', value: 4.45 },
      { label: 'Security', value: 4.52 },
    ],
  },

  stack: [
    { layer: 'Mobile app', items: ['React Native', 'Expo', 'React Navigation', 'Zustand', 'Axios', 'Expo Camera'] },
    { layer: 'Web portal', items: ['Vue 3', 'Vite', 'Vue Router', 'Pinia', 'Chart.js'] },
    { layer: 'Backend API', items: ['PHP', 'PDO', 'TCPDF', 'PHPMailer', 'OpenAI API'] },
    { layer: 'Database', items: ['MySQL / MariaDB'] },
  ],

  contribution: [
    'Designed and developed the system as the team’s full-stack developer, covering the mobile app, the web portal and the API.',
    'Implemented the QR code-based attendance verification that replaces manual attendance recording.',
    'Worked on attendance tracking and report generation for OJT trainees.',
  ],

  learned: [
    'Planning and building a complete system with separate mobile, web and backend parts that share one database.',
    'Turning the needs of different users (trainees, supervisors, coordinators) into separate screens and permissions.',
    'Debugging problems that only show up when the app, the API and the database interact.',
    'Designing a practical attendance workflow that still works when something goes wrong, such as a manual entry fallback.',
  ],

  // Project card image.
  cover: { src: webApp, thumb: webAppSm, width: 1440, height: 789 },

  // First image is shown large; web screenshots follow, then phone screenshots.
  gallery: [
    {
      src: webApp,
      thumb: webAppSm,
      width: 1440,
      height: 789,
      kind: 'web',
      alt: 'OJTrack live site, mobile app section: a phone showing the trainee home screen with a Generate Code button, weekly attendance and total hours worked, next to a list of app features and a Download App button.',
      caption: 'Live site — the trainee app at a glance',
    },
    {
      src: webSteps,
      thumb: webStepsSm,
      width: 1440,
      height: 582,
      kind: 'web',
      alt: 'OJTrack live site, “Secure attendance in four steps”: verify your email, get your OTP, generate your QR code, supervisor scans.',
      caption: 'Secure attendance in four steps',
    },
    {
      src: webRating,
      thumb: webRatingSm,
      width: 1440,
      height: 481,
      kind: 'web',
      alt: 'OJTrack ISO/IEC 25010 evaluation: functional suitability 4.47, usability 4.46, performance efficiency 4.45, reliability 4.45, security 4.52, overall 4.47 out of 5.',
      caption: 'ISO/IEC 25010 user evaluation — 4.47 / 5 overall',
    },
    {
      src: webFeatures,
      thumb: webFeaturesSm,
      width: 1440,
      height: 891,
      kind: 'web',
      alt: 'OJTrack feature grid: QR code and OTP attendance, AI-assisted reports, hours and progress tracking, trainee evaluations, report requests, notifications and reminders.',
      caption: 'Feature overview',
    },
    {
      src: mobileTrainee,
      thumb: mobileTraineeSm,
      width: 720,
      height: 1527,
      kind: 'mobile',
      alt: 'OJTrack trainee home screen on a phone, with a Generate Code button, weekly attendance and total hours worked.',
      caption: 'Trainee home',
    },
    {
      src: mobileSupervisor,
      thumb: mobileSupervisorSm,
      width: 720,
      height: 1527,
      kind: 'mobile',
      alt: 'OJTrack supervisor home screen showing present and absent trainees and a Daily Scanning panel with Open Scanner and Manual Entry buttons.',
      caption: 'Supervisor scanner',
    },
    {
      src: mobileRoles,
      thumb: mobileRolesSm,
      width: 720,
      height: 1527,
      kind: 'mobile',
      alt: 'OJTrack account creation screen asking the user to choose between Trainee and Supervisor roles.',
      caption: 'Role selection',
    },
  ],

  // Add real URLs only. Items with a null url are hidden.
  links: [{ label: 'Visit live site', url: 'https://ojt-track-tau.vercel.app/', primary: true }].filter((link) => link.url),
};
