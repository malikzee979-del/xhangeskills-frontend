// Lightweight realistic mock data for local development

export const mockUsers = [
  {
    id: 1,
    username: 'alice',
    email: 'alice@example.com',
    displayName: 'Alice Johnson',
    bio: 'Full-stack developer and instructor',
    avatar: '/logo.jfif',
    role: 'seller',
    location: 'New York, USA',
  },
  {
    id: 2,
    username: 'bob',
    email: 'bob@example.com',
    displayName: 'Bob Martinez',
    bio: 'Graphic designer and illustrator',
    avatar: '/logo.jfif',
    role: 'seller',
    location: 'Madrid, Spain',
  },
  {
    id: 3,
    username: 'carol',
    email: 'carol@example.com',
    displayName: 'Carol Lee',
    bio: 'Digital marketer and growth specialist',
    avatar: '/logo.jfif',
    role: 'buyer',
    location: 'Toronto, Canada',
  },
  {
    id: 4,
    username: 'dave',
    email: 'dave@example.com',
    displayName: 'Dave Kim',
    bio: 'Backend engineer and API expert',
    avatar: '/logo.jfif',
    role: 'seller',
    location: 'Seoul, Korea',
  },
  {
    id: 5,
    username: 'eva',
    email: 'eva@example.com',
    displayName: 'Eva Green',
    bio: 'Product manager and strategist',
    avatar: '/logo.jfif',
    role: 'buyer',
    location: 'Berlin, Germany',
  },
  {
    id: 6,
    username: 'frank',
    email: 'frank@example.com',
    displayName: 'Frank Liu',
    bio: 'Data scientist and ML engineer',
    avatar: '/logo.jfif',
    role: 'seller',
    location: 'San Francisco, USA',
  },
  {
    id: 7,
    username: 'gina',
    email: 'gina@example.com',
    displayName: 'Gina Torres',
    bio: 'Copywriter and content creator',
    avatar: '/logo.jfif',
    role: 'seller',
    location: 'London, UK',
  },
  {
    id: 8,
    username: 'harry',
    email: 'harry@example.com',
    displayName: 'Harry Singh',
    bio: 'DevOps engineer',
    avatar: '/logo.jfif',
    role: 'seller',
    location: 'Mumbai, India',
  },
];

const now = () => new Date().toISOString();

export const mockCategories = [
  { id: '1', name: 'Programming', slug: 'programming', description: 'Coding and software development', icon: 'code', createdAt: now(), updatedAt: now() },
  { id: '2', name: 'Design', slug: 'design', description: 'UI/UX and visual design', icon: 'palette', createdAt: now(), updatedAt: now() },
  { id: '3', name: 'Marketing', slug: 'marketing', description: 'Growth, SEO, and ads', icon: 'megaphone', createdAt: now(), updatedAt: now() },
  { id: '4', name: 'Business', slug: 'business', description: 'Strategy and product', icon: 'briefcase', createdAt: now(), updatedAt: now() },
  { id: '5', name: 'Data Science', slug: 'data-science', description: 'Analytics and ML', icon: 'bar-chart', createdAt: now(), updatedAt: now() },
];

export const mockSkillsRaw = [
  {
    id: '101',
    title: 'React Development',
    description: 'Build interactive UIs with React and Next.js',
    price: 50,
    ownerId: 1,
    categoryId: '1',
    rating: 4.8,
    reviewsCount: 24,
    deliveryDays: 3,
    tags: ['react', 'nextjs', 'frontend'],
    marketplace: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=1200&q=80',
    status: 'approved',
    createdAt: now(),
  },
  {
    id: '102',
    title: 'UI/UX Design',
    description: 'Design beautiful and user-friendly interfaces',
    price: 40,
    ownerId: 2,
    categoryId: '2',
    rating: 4.6,
    reviewsCount: 12,
    deliveryDays: 5,
    tags: ['design', 'figma', 'ux'],
    marketplace: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    status: 'approved',
    createdAt: now(),
  },
  {
    id: '103',
    title: 'SEO & Content Strategy',
    description: 'Improve organic traffic and content performance',
    price: 70,
    ownerId: 3,
    categoryId: '3',
    rating: 4.4,
    reviewsCount: 8,
    deliveryDays: 7,
    tags: ['seo', 'content', 'marketing'],
    marketplace: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
    status: 'approved',
    createdAt: now(),
  },
  {
    id: '104',
    title: 'API Design & Implementation',
    description: 'Design scalable RESTful and GraphQL APIs',
    price: 80,
    ownerId: 4,
    categoryId: '1',
    rating: 4.9,
    reviewsCount: 30,
    deliveryDays: 4,
    tags: ['api', 'backend', 'nodejs'],
    marketplace: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
    status: 'approved',
    createdAt: now(),
  },
  {
    id: '105',
    title: 'Data Analysis with Python',
    description: 'Perform data cleaning, visualization, and analysis using pandas and matplotlib',
    price: 60,
    ownerId: 6,
    categoryId: '5',
    rating: 4.7,
    reviewsCount: 10,
    deliveryDays: 5,
    tags: ['python', 'pandas', 'data-analysis'],
    marketplace: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    status: 'approved',
    createdAt: now(),
  },
  {
    id: '106',
    title: 'Figma Prototyping',
    description: 'High-fidelity prototypes and design systems',
    price: 45,
    ownerId: 2,
    categoryId: '2',
    rating: 4.5,
    reviewsCount: 9,
    deliveryDays: 3,
    tags: ['figma', 'prototype', 'design'],
    marketplace: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1706426622953-deb20641984c?q=80&w=880&auto=format&fit=crop',
    status: 'approved',
    createdAt: now(),
  },
  {
    id: '107',
    title: 'Google Ads Campaigns',
    description: 'Setup and optimize Google Ads for ROI',
    price: 90,
    ownerId: 3,
    categoryId: '3',
    rating: 4.3,
    reviewsCount: 6,
    deliveryDays: 7,
    tags: ['ads', 'google-ads', 'marketing'],
    marketplace: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1200&q=80',
    status: 'approved',
    createdAt: now(),
  },
  {
    id: '108',
    title: 'Technical Writing',
    description: 'Create clear technical documentation and API guides',
    price: 55,
    ownerId: 7,
    categoryId: '4',
    rating: 4.6,
    reviewsCount: 5,
    deliveryDays: 4,
    tags: ['writing', 'docs', 'api'],
    marketplace: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80',
    status: 'approved',
    createdAt: now(),
  },
  {
    id: '109',
    title: 'Kubernetes Setup',
    description: 'Deploy and maintain Kubernetes clusters with Helm',
    price: 150,
    ownerId: 8,
    categoryId: '1',
    rating: 4.9,
    reviewsCount: 14,
    deliveryDays: 10,
    tags: ['kubernetes', 'devops', 'helm'],
    marketplace: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1505238680356-667803448bb6?auto=format&fit=crop&w=1200&q=80',
    status: 'approved',
    createdAt: now(),
  },
  {
    id: '110',
    title: 'Logo and Brand Identity',
    description: 'Branding packages including logos, color palette, and guidelines',
    price: 120,
    ownerId: 2,
    categoryId: '2',
    rating: 4.7,
    reviewsCount: 20,
    deliveryDays: 7,
    tags: ['branding', 'logo', 'identity'],
    marketplace: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1485841890310-6a055c88698a?auto=format&fit=crop&w=1200&q=80',
    status: 'approved',
    createdAt: now(),
  },
];

// Enriched skills include embedded `category` and `user` objects matching the Skill interface
export const mockSkills = mockSkillsRaw.map((s) => {
  const category = mockCategories.find((c) => String(c.id) === String(s.categoryId));
  const user = mockUsers.find((u) => u.id === s.ownerId) || null;
  return {
    ...s,
    id: String(s.id),
    category: category ? { id: String(category.id), name: category.name } : undefined,
    user: user ? { id: String(user.id), username: user.username, email: user.email } : { id: String(s.ownerId), username: 'unknown', email: '' },
  } as any;
});

type ServiceMode = 'REMOTE' | 'ONSITE' | 'HYBRID';
type ServiceRequestStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

const daysAgo = (n: number) => new Date(Date.now() - 1000 * 60 * 60 * 24 * n).toISOString();

function embedSkill(skillId: string | number) {
  const s = mockSkills.find((sk) => String(sk.id) === String(skillId));
  if (!s) return null;
  return {
    id: String(s.id),
    title: s.title,
    coverImageUrl: s.coverImageUrl,
    category: s.category ? { id: s.category.id, name: s.category.name } : undefined,
  };
}

function embedUser(userId: number) {
  const u = mockUsers.find((m) => m.id === userId);
  if (!u) return null;
  return {
    id: String(u.id),
    username: u.username,
    displayName: u.displayName,
    email: u.email,
    avatar: u.avatar,
  };
}

const serviceRequestSeed: Array<{
  id: string;
  skillId: string;
  requesterId: number;
  status: ServiceRequestStatus;
  requestDetails: string;
  serviceMode: ServiceMode;
  serviceLocation?: string;
  duration: number;
  requestedTime: string;
  createdAt: string;
  respondedAt?: string;
  responseNote?: string;
}> = [
  {
    id: '201', skillId: '101', requesterId: 3, status: 'pending',
    requestDetails: 'Need help building a React dashboard with charts and auth',
    serviceMode: 'REMOTE', duration: 60, requestedTime: 'Jan 25, 2026 - 3:00 PM',
    createdAt: daysAgo(3),
  },
  {
    id: '202', skillId: '102', requesterId: 5, status: 'accepted',
    requestDetails: 'Redesign landing page with a fresh look and motion',
    serviceMode: 'REMOTE', duration: 90, requestedTime: 'Jan 24, 2026 - 2:00 PM',
    createdAt: daysAgo(10), respondedAt: daysAgo(9),
  },
  {
    id: '203', skillId: '104', requesterId: 2, status: 'completed',
    requestDetails: 'Implement authentication and role-based access',
    serviceMode: 'HYBRID', serviceLocation: 'Starbucks Downtown',
    duration: 120, requestedTime: 'Jan 22, 2026 - 5:00 PM',
    createdAt: daysAgo(30), respondedAt: daysAgo(28),
  },
  {
    id: '204', skillId: '105', requesterId: 1, status: 'pending',
    requestDetails: 'Analyze sales dataset and provide insights',
    serviceMode: 'REMOTE', duration: 120, requestedTime: 'Jan 26, 2026 - 10:00 AM',
    createdAt: daysAgo(2),
  },
  {
    id: '205', skillId: '106', requesterId: 5, status: 'accepted',
    requestDetails: 'Prototype a new mobile flow for onboarding',
    serviceMode: 'REMOTE', duration: 150, requestedTime: 'Jan 23, 2026 - 9:00 AM',
    createdAt: daysAgo(8), respondedAt: daysAgo(7),
  },
  {
    id: '206', skillId: '109', requesterId: 4, status: 'pending',
    requestDetails: 'Help migrate Kubernetes cluster to AKS',
    serviceMode: 'ONSITE', serviceLocation: 'Tech Park, Building A',
    duration: 180, requestedTime: 'Jan 27, 2026 - 11:00 AM',
    createdAt: daysAgo(1),
  },
  {
    id: '207', skillId: '108', requesterId: 7, status: 'rejected',
    requestDetails: 'Write API documentation for v2 endpoints',
    serviceMode: 'REMOTE', duration: 90, requestedTime: 'Jan 20, 2026 - 4:00 PM',
    createdAt: daysAgo(6), respondedAt: daysAgo(5),
    responseNote: 'Not available for this timeframe',
  },
  {
    id: '208', skillId: '110', requesterId: 3, status: 'rejected',
    requestDetails: 'Design a brand identity package for a startup',
    serviceMode: 'REMOTE', duration: 120, requestedTime: 'Jan 21, 2026 - 3:00 PM',
    createdAt: daysAgo(15), respondedAt: daysAgo(14),
    responseNote: 'Booked with another learner',
  },
];

export const mockServiceRequests = serviceRequestSeed.map((sr) => ({
  id: sr.id,
  status: sr.status,
  requestDetails: sr.requestDetails,
  createdAt: sr.createdAt,
  serviceMode: sr.serviceMode,
  serviceLocation: sr.serviceLocation,
  duration: sr.duration,
  requestedTime: sr.requestedTime,
  respondedAt: sr.respondedAt,
  responseNote: sr.responseNote,
  skill: embedSkill(sr.skillId),
  requester: embedUser(sr.requesterId),
}));

export const mockChats = [
  {
    id: 'c1',
    participants: [
      mockUsers.find((u) => u.id === 1) || { id: 1, username: 'alice' },
      mockUsers.find((u) => u.id === 3) || { id: 3, username: 'carol' },
    ],
    messages: [
      {
        id: 'm1',
        chat: 'c1',
        sender: mockUsers.find((u) => u.id === 3) || { id: 3 },
        recipient: mockUsers.find((u) => u.id === 1) || { id: 1 },
        content: 'Hi Alice — interested in your React service',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      },
      {
        id: 'm2',
        chat: 'c1',
        sender: mockUsers.find((u) => u.id === 1) || { id: 1 },
        recipient: mockUsers.find((u) => u.id === 3) || { id: 3 },
        content: 'Thanks — happy to help. What do you need?',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 20).toISOString(),
      },
      {
        id: 'm3',
        chat: 'c1',
        sender: mockUsers.find((u) => u.id === 3) || { id: 3 },
        recipient: mockUsers.find((u) => u.id === 1) || { id: 1 },
        content: 'Dashboard with charts and auth',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 40).toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'c2',
    participants: [
      mockUsers.find((u) => u.id === 2) || { id: 2, username: 'bob' },
      mockUsers.find((u) => u.id === 3) || { id: 3, username: 'carol' },
    ],
    messages: [
      {
        id: 'm4',
        chat: 'c2',
        sender: mockUsers.find((u) => u.id === 3) || { id: 3 },
        recipient: mockUsers.find((u) => u.id === 2) || { id: 2 },
        content: 'Can you redesign our homepage?',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      },
      {
        id: 'm5',
        chat: 'c2',
        sender: mockUsers.find((u) => u.id === 2) || { id: 2 },
        recipient: mockUsers.find((u) => u.id === 3) || { id: 3 },
        content: 'Sure — sending portfolio now',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 15).toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'c3',
    participants: [
      mockUsers.find((u) => u.id === 6) || { id: 6, username: 'frank' },
      mockUsers.find((u) => u.id === 1) || { id: 1, username: 'alice' },
    ],
    messages: [
      {
        id: 'm6',
        chat: 'c3',
        sender: mockUsers.find((u) => u.id === 6) || { id: 6 },
        recipient: mockUsers.find((u) => u.id === 1) || { id: 1 },
        content: 'Can you help with data pipeline?',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
      },
      {
        id: 'm7',
        chat: 'c3',
        sender: mockUsers.find((u) => u.id === 1) || { id: 1 },
        recipient: mockUsers.find((u) => u.id === 6) || { id: 6 },
        content: 'Yes — share details and sample data',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6 + 1000 * 60 * 10).toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'c4',
    participants: [
      mockUsers.find((u) => u.id === 7) || { id: 7, username: 'gina' },
      mockUsers.find((u) => u.id === 5) || { id: 5, username: 'eva' },
    ],
    messages: [
      {
        id: 'm8',
        chat: 'c4',
        sender: mockUsers.find((u) => u.id === 7) || { id: 7 },
        recipient: mockUsers.find((u) => u.id === 5) || { id: 5 },
        content: 'I can draft blog posts for your product',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
      },
      {
        id: 'm9',
        chat: 'c4',
        sender: mockUsers.find((u) => u.id === 5) || { id: 5 },
        recipient: mockUsers.find((u) => u.id === 7) || { id: 7 },
        content: 'Great — please send a sample',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12 + 1000 * 60 * 5).toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'c5',
    participants: [
      mockUsers.find((u) => u.id === 8) || { id: 8, username: 'harry' },
      mockUsers.find((u) => u.id === 4) || { id: 4, username: 'dave' },
    ],
    messages: [
      {
        id: 'm10',
        chat: 'c5',
        sender: mockUsers.find((u) => u.id === 8) || { id: 8 },
        recipient: mockUsers.find((u) => u.id === 4) || { id: 4 },
        content: 'Need help automating deployment',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
      {
        id: 'm11',
        chat: 'c5',
        sender: mockUsers.find((u) => u.id === 4) || { id: 4 },
        recipient: mockUsers.find((u) => u.id === 8) || { id: 8 },
        content: 'I can assist with CI/CD and scripts',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 30).toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const reviewSeed: Array<{ id: string; skillId: string; reviewerId: number; rating: number; comment: string; daysAgo: number }> = [
  { id: '301', skillId: '101', reviewerId: 3, rating: 5, comment: 'Excellent work, fast delivery and great communication throughout the project.', daysAgo: 15 },
  { id: '302', skillId: '101', reviewerId: 2, rating: 4, comment: 'Good job overall, though documentation could be clearer.', daysAgo: 40 },
  { id: '303', skillId: '102', reviewerId: 3, rating: 5, comment: 'Beautiful design, very creative and professional.', daysAgo: 12 },
  { id: '304', skillId: '104', reviewerId: 2, rating: 5, comment: 'API was rock solid and well documented. Highly recommend.', daysAgo: 60 },
  { id: '305', skillId: '105', reviewerId: 1, rating: 5, comment: 'Great data analysis and actionable insights.', daysAgo: 5 },
  { id: '306', skillId: '106', reviewerId: 5, rating: 4, comment: 'Nice prototype overall, just minor tweaks needed before handoff.', daysAgo: 20 },
  { id: '307', skillId: '109', reviewerId: 4, rating: 5, comment: 'K8s migration was flawless with zero downtime.', daysAgo: 25 },
  { id: '308', skillId: '110', reviewerId: 3, rating: 5, comment: 'Branding package exceeded expectations.', daysAgo: 18 },
  { id: '309', skillId: '101', reviewerId: 6, rating: 4, comment: 'Good work, delivered on time and within scope.', daysAgo: 7 },
  { id: '310', skillId: '104', reviewerId: 1, rating: 5, comment: 'Excellent API design and thorough testing.', daysAgo: 45 },
];

export const mockReviews = reviewSeed.map((r) => ({
  id: r.id,
  rating: r.rating,
  comment: r.comment,
  createdAt: daysAgo(r.daysAgo),
  skill: embedSkill(r.skillId),
  reviewer: embedUser(r.reviewerId),
}));

export const mockReports = [
  { id: 401, reporterId: 3, targetType: 'user', targetId: 2, reason: 'Inappropriate content', status: 'open', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7 },
  { id: 402, reporterId: 2, targetType: 'skill', targetId: 103, reason: 'Spam listing', status: 'reviewed', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20 },
  { id: 403, reporterId: 5, targetType: 'user', targetId: 8, reason: 'Fake profile', status: 'open', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3 },
  { id: 404, reporterId: 6, targetType: 'skill', targetId: 110, reason: 'Copyright complaint', status: 'resolved', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 40 },
];

// Derived counts and helper getters
export function getCounts() {
  return {
    users: mockUsers.length,
    skills: mockSkills.length,
    serviceRequests: mockServiceRequests.length,
    chats: mockChats.length,
    reviews: mockReviews.length,
    reports: mockReports.length,
  };
}

export function findUserById(id: number) {
  return mockUsers.find((u) => u.id === Number(id) || String(u.id) === String(id)) || null;
}

export function findSkillById(id: number) {
  return mockSkills.find((s) => String(s.id) === String(id)) || null;
}

export function getSkillsByCategory(categoryId: number) {
  return mockSkills.filter((s) => String(s.categoryId) === String(categoryId));
}

export function getReviewsForSkill(skillId: number) {
  return mockReviews.filter((r) => String(r.skill?.id) === String(skillId));
}

export function getProfile(id: number) {
  const user = findUserById(id);
  if (!user) return null;
  const skills = mockSkills.filter((s) => String(s.ownerId) === String(id) || String(s.user?.id) === String(id));
  const reviews = mockReviews.filter((r) => skills.some((sk) => String(sk.id) === String(r.skill?.id)));
  const requests = mockServiceRequests.filter((sr) => String(sr.requester?.id) === String(id) || skills.some((sk) => String(sk.id) === String(sr.skill?.id)));
  return {
    ...user,
    stats: {
      skillsCount: skills.length,
      reviewsCount: reviews.length,
      requestsCount: requests.length,
      rating: skills.length ? Number((skills.reduce((a, b) => a + (Number((b as any).rating) || 0), 0) / skills.length).toFixed(2)) : 0,
    },
    skills,
  };
}

export function searchMarketplace(query: string) {
  const q = (query || '').toLowerCase();
  return mockSkills.filter((s) => s.marketplace && (s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || (s.tags || []).some((t: string) => t.includes(q))));
}

export type MockNotificationType = 'success' | 'warning' | 'info' | 'message';

export const mockNotifications: Array<{
  id: string;
  type: MockNotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionLink?: string;
}> = [
  {
    id: '501', type: 'success', title: 'Request Approved',
    message: 'Your JavaScript teaching request from John Doe was approved.',
    isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    actionLink: '/dashboard/requests',
  },
  {
    id: '502', type: 'message', title: 'New Message',
    message: 'You received a message from Sarah Smith.',
    isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    actionLink: '/dashboard/chat',
  },
  {
    id: '503', type: 'warning', title: 'Pending Request',
    message: 'You have 2 pending skill exchange requests waiting for your response.',
    isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    actionLink: '/dashboard/requests',
  },
  {
    id: '504', type: 'info', title: 'Profile Completion',
    message: 'Complete your profile to increase visibility and attract more learners.',
    isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    actionLink: '/dashboard/profile',
  },
  {
    id: '505', type: 'success', title: 'New Review Received',
    message: 'Mike Johnson left you a 5-star review for your web design skills.',
    isRead: true, createdAt: daysAgo(1),
    actionLink: '/dashboard/reviews',
  },
  {
    id: '506', type: 'message', title: 'Chat Message',
    message: 'Emma Wilson sent you a message: "Great! Let\'s schedule a session"',
    isRead: true, createdAt: daysAgo(2),
    actionLink: '/dashboard/chat',
  },
  {
    id: '507', type: 'warning', title: 'Request Rejected',
    message: 'Your Python tutoring request was rejected by Alex Thompson.',
    isRead: true, createdAt: daysAgo(3),
    actionLink: '/dashboard/requests',
  },
  {
    id: '508', type: 'info', title: 'Skill Verification',
    message: 'Your JavaScript skill has been verified by the community.',
    isRead: true, createdAt: daysAgo(7),
    actionLink: '/dashboard/skills',
  },
];

