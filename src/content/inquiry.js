// What a client can pick in the "Start a project" brief
// (components/inquiry/ProjectBrief.jsx). Services and budgets are Felix's own;
// `usd` is the rough dollar equivalent shown when the visitor switches to $.
export const inquiry = {
  replyTime: 'within 24 hours',

  // `icon` is a name from components/ui/Icon.jsx. `proof` is one line of past work;
  // `prompt` is the hint in the last step's "Tell me about it" box.
  services: [
    {
      id: 'website',
      label: 'Website',
      icon: 'layout',
      text: 'Landing pages, portfolios and business sites that work on every screen.',
      proof: 'I’ve built portfolio sites for clients',
      prompt: 'What’s the site for, who will visit it, and any sites you like the look of?',
      features: [
        'Contact or inquiry form',
        'Booking or appointments',
        'Blog or news updates',
        'Photo gallery',
        'Content I can edit myself',
        'Domain and hosting setup',
      ],
    },
    {
      id: 'store',
      label: 'Online store',
      icon: 'cart',
      text: 'E-commerce sites with a product catalog, cart and checkout.',
      proof: 'I’ve built e-commerce sites for clients',
      prompt: 'What will you sell, roughly how many products, and how do you take orders today?',
      features: [
        'Product catalog',
        'Cart and checkout',
        'Online payments',
        'Order tracking',
        'Inventory management',
        'Admin dashboard',
      ],
    },
    {
      id: 'system',
      label: 'Web system',
      icon: 'server',
      text: 'Custom systems with logins, roles, workflows and dashboards.',
      proof: 'Like PRimeSys, a procurement system I was commissioned to build',
      prompt: 'Which process should it handle, who will use it, and how is it done today?',
      features: [
        'User accounts and roles',
        'Admin dashboard',
        'Approval workflows',
        'Reports and printable forms',
        'Live status updates',
        'Email notifications',
      ],
    },
  ],

  budgets: [
    { id: 'under-10k', php: 'Under ₱10,000', usd: 'Under $180' },
    { id: '10k-25k', php: '₱10,000 – ₱25,000', usd: '$180 – $450' },
    { id: '25k-50k', php: '₱25,000 – ₱50,000', usd: '$450 – $900' },
    { id: '50k-plus', php: '₱50,000+', usd: '$900+' },
    { id: 'unsure', php: 'Not sure yet', usd: 'Not sure yet' },
  ],

  timelines: ['As soon as possible', 'Within a month', '1–3 months', 'Flexible'],
};
