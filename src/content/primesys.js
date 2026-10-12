// PRimeSys case study. Workflow, roles and features follow the live site's own
// copy (landing, sign-in and sign-up pages); the stack was confirmed from the
// deployed front-end bundle and API (the MySQL database is from Felix's résumé).
import webLanding from '../assets/images/primesys-web-landing.webp';
import webLandingSm from '../assets/images/primesys-web-landing-720.webp';
import webStages from '../assets/images/primesys-web-stages.webp';
import webStagesSm from '../assets/images/primesys-web-stages-720.webp';
import webRoles from '../assets/images/primesys-web-roles.webp';
import webRolesSm from '../assets/images/primesys-web-roles-720.webp';
import webFeatures from '../assets/images/primesys-web-features.webp';
import webFeaturesSm from '../assets/images/primesys-web-features-720.webp';
import webLogin from '../assets/images/primesys-web-login.webp';
import webLoginSm from '../assets/images/primesys-web-login-720.webp';
import mobileLanding from '../assets/images/primesys-mobile-landing.webp';
import mobileLandingSm from '../assets/images/primesys-mobile-landing-360.webp';

export const primesys = {
  id: 'primesys',
  name: 'PRimeSys',
  title: 'PRimeSys — Procurement Management System',
  tagline: 'Campus procurement on one live record, from PPMP to delivery.',
  type: 'Web Application',
  role: 'Full-Stack Developer',
  team: 'Solo project',
  platform: 'Web',
  year: '2026',
  status: 'Live',
  summary:
    'A procurement system for North Eastern Mindanao State University – Cantilan Campus. End Users, the TWG, the BAC, Procurement and Supply work on the same record, so anyone involved can see where a purchase request is, who has it now and what happens next.',

  // Shown on the project card. Keep each to one line of proof.
  highlights: [
    'Six roles and six stages on one record, with live status updates over Socket.IO',
    'Prints the forms offices still sign: PR, RFQ, TWG certificates, Notice of Award and PO',
    'Designed, built and deployed solo: React on Vercel, Node.js and Express API on Render',
  ],
  keyStack: ['React', 'TanStack Query', 'Tailwind CSS', 'Node.js', 'Express', 'Socket.IO'],

  overview:
    'PRimeSys (the “PR” stands for purchase request) digitizes the campus procurement process. It connects everyone who touches a purchase: the End User who files the request, the Technical Working Group (TWG), the Bids and Awards Committee (BAC), the Procurement Office, the Supply Office and the system administrator.',

  problem:
    'A purchase request used to travel between offices on paper. It passes through review, canvassing, quotations, award, ordering and delivery before it is closed, and at any point nobody could easily say where it was or who had it.',

  solution:
    'PRimeSys keeps the whole lifecycle on a single record. Each role signs in to its own desk and sees only the records that belong to it, the next person is told when it is their turn, and the forms the office still signs print straight from the record.',

  howItWorksTitle: 'The six stages',
  howItWorks: [
    {
      title: 'File the request',
      text: 'The End User picks the quarter and adds items from the office PPMP. Requests are held against the plan, so they never go past what was approved.',
    },
    {
      title: 'TWG review',
      text: 'The TWG member for the category checks each item against its PPMP line, then approves it, asks for changes or turns it down.',
    },
    {
      title: 'Canvass',
      text: 'Procurement assigns the PR number and prints the Request for Quotation, as a PDF or Word file, for canvassers to take to suppliers.',
    },
    {
      title: 'Quotations and compliance',
      text: 'The BAC enters each returned quotation. The TWG marks every offer compliant or not, gives the reason and certifies the results.',
    },
    {
      title: 'Award',
      text: 'One winner per lot. PRimeSys recommends the lowest total among fully compliant suppliers, and the BAC makes the decision.',
    },
    {
      title: 'Order and delivery',
      text: 'Each awarded supplier gets its own purchase order. Supply records deliveries item by item, and the request closes once everything has arrived.',
    },
  ],

  features: [
    { title: 'Live status', text: 'Changes appear without reloading. The next person is notified in the app, and by email for deliveries and reminders.' },
    { title: 'Forms ready to sign', text: 'Purchase requests, RFQs, TWG certificates, BAC resolutions, Notices of Award and purchase orders print from the record.' },
    { title: 'PPMP by quarter', text: 'Requests draw on the office procurement plan quarter by quarter, so nothing goes past what was planned.' },
    { title: 'Full history', text: 'Every status change keeps who made it and when. Finished requests move to the Archive and stay there.' },
    { title: 'Reminders', text: 'Set a reminder on a request for yourself or a colleague. It arrives by email when it is due.' },
    { title: 'Reports and export', text: 'Spending by quarter and category, filters for the whole year, and CSV export from the Archive.' },
    { title: 'Role-based desks', text: 'Six roles, each with a dashboard that shows only the records that belong to it.' },
    { title: 'Approved sign-ups', text: 'Faculty and staff register as End Users; an administrator approves each account and assigns staff roles.' },
  ],

  roles: [
    { title: 'End User', text: 'Files requests from the office PPMP and follows each one until it is delivered.' },
    { title: 'Technical Working Group', text: 'Reviews requests in their assigned categories and certifies the offers suppliers send.' },
    { title: 'Procurement Office', text: 'Starts the canvass, prints the Request for Quotation and issues the purchase orders.' },
    { title: 'Bids and Awards Committee', text: 'Records the quotations and awards each lot to a supplier the TWG found compliant.' },
    { title: 'Supply Office', text: 'Receives what was ordered and records each delivery, item by item.' },
    { title: 'Administrator', text: 'Manages accounts, roles, offices and signatories, and oversees the whole flow.' },
  ],

  stack: [
    { layer: 'Front end', items: ['React', 'Vite', 'React Router', 'TanStack Query', 'Tailwind CSS', 'Radix UI'] },
    { layer: 'Data and real time', items: ['Axios', 'Socket.IO'] },
    { layer: 'Backend API', items: ['Node.js', 'Express'] },
    { layer: 'Database', items: ['MySQL'] },
    { layer: 'Hosting', items: ['Vercel', 'Render'] },
  ],

  contribution: [
    'Designed and built the system alone, covering the React front end, the Node.js and Express API on MySQL, and the real-time layer.',
    'Built the six-stage purchase request workflow on a single record, with its status history and a dashboard for each of the six roles.',
    'Added live updates with Socket.IO, plus email for deliveries and reminders, so the next person knows it is their turn without manual follow-ups.',
    'Built the printable forms generated from each record, the spending reports and the CSV export.',
    'Deployed the front end on Vercel and the API on Render, and connected them in production.',
  ],

  learned: [
    'Modelling a multi-office approval workflow as clear stages, so each person always knows whose turn it is.',
    'Pushing status changes to users in real time instead of relying on manual follow-ups.',
    'Keeping records auditable: who changed what and when, and archiving instead of deleting.',
    'Fitting software around an existing paper process by printing the forms offices still sign.',
    'Deploying a front end and an API separately and connecting them in production.',
  ],

  // Project card image.
  cover: { src: webLanding, thumb: webLandingSm, width: 1440, height: 900 },

  // First image is shown large; web screenshots follow, then phone screenshots.
  gallery: [
    {
      src: webLanding,
      thumb: webLandingSm,
      width: 1440,
      height: 900,
      kind: 'web',
      alt: 'PRimeSys landing page with the headline “Every purchase request, from PPMP to delivery.” next to a live request card showing a seven-step status tracker for printer toner and bond paper.',
      caption: 'Landing page with a live request tracker',
    },
    {
      src: webStages,
      thumb: webStagesSm,
      width: 1440,
      height: 900,
      kind: 'web',
      alt: 'PRimeSys “Six stages, one record that moves from desk to desk”, with a stage list on the left and the Canvass stage card on the right.',
      caption: 'Six stages, one record',
    },
    {
      src: webRoles,
      thumb: webRolesSm,
      width: 1440,
      height: 788,
      kind: 'web',
      alt: 'PRimeSys “Six roles, each with its own desk”: End User, Technical Working Group, Procurement Office, Bids and Awards Committee, Supply Office and Administrator.',
      caption: 'Six roles, each with its own desk',
    },
    {
      src: webFeatures,
      thumb: webFeaturesSm,
      width: 1440,
      height: 1011,
      kind: 'web',
      alt: 'PRimeSys features: printable forms fanned out next to Live status, Forms ready to sign, PPMP by quarter and Full history.',
      caption: 'Printable forms and features',
    },
    {
      src: webLogin,
      thumb: webLoginSm,
      width: 1440,
      height: 900,
      kind: 'web',
      alt: 'PRimeSys sign-in page with a request status preview on the left and username and password fields on the right.',
      caption: 'Sign-in',
    },
    {
      src: mobileLanding,
      thumb: mobileLandingSm,
      width: 720,
      height: 1558,
      kind: 'mobile',
      alt: 'PRimeSys landing page on a phone, with the headline, Sign in and Create an account buttons.',
      caption: 'Responsive on phones',
    },
  ],

  links: [{ label: 'Visit live site', url: 'https://primesys.vercel.app/', primary: true }],
};
