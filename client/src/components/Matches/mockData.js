export const mockPendingInvites = [
  {
    id: 'inv1',
    sender_name: 'Alice Johnson',
    sender_skill: 'Python Programming',
    requested_skill: 'Spanish Language',
    time_availability: 'Weekends',
    status: 'pending',
    created_at: '2024-03-15T10:00:00Z'
  },
  {
    id: 'inv2',
    sender_name: 'Bob Smith',
    sender_skill: 'Guitar',
    requested_skill: 'Digital Marketing',
    time_availability: 'Weekday Evenings',
    status: 'pending',
    created_at: '2024-03-14T15:30:00Z'
  }
];

export const mockSentRequests = [
  {
    id: 'req1',
    recipient_name: 'Carol White',
    sender_skill: 'JavaScript',
    requested_skill: 'Photography',
    time_availability: 'Monday/Wednesday Evenings',
    status: 'pending',
    created_at: '2024-03-13T09:15:00Z'
  },
  {
    id: 'req2',
    recipient_name: 'David Brown',
    sender_skill: 'Yoga',
    requested_skill: 'Data Analysis',
    time_availability: 'Tuesday/Thursday Mornings',
    status: 'pending',
    created_at: '2024-03-12T14:45:00Z'
  }
];

export const mockAcceptedMatches = [
  {
    id: 'accepted1',
    partner_name: 'Rachel Green',
    partner_skill: 'French Cuisine',
    your_skill: 'Web Development',
    partnerEmail: 'rachel.green@example.com',
    sessions_completed: 2,
    status: 'active'
  },
  {
    id: 'accepted2',
    partner_name: 'John Smith',
    partner_skill: 'Piano',
    your_skill: 'Data Analysis',
    partnerEmail: 'john.smith@example.com',
    sessions_completed: 4,
    status: 'active'
  },
  {
    id: 'accepted3',
    partner_name: 'Emily Chen',
    partner_skill: 'Digital Marketing',
    your_skill: 'Spanish Language',
    partnerEmail: 'emily.chen@example.com',
    sessions_completed: 1,
    status: 'active'
  }
];

export const mockSuccessfulMatches = [
  {
    id: 'match1',
    name: 'Eva Martinez',
    skill: 'French Language',
    location: 'Online',
    time_availability: 'Weekends',
    years_of_experience: 5,
    email: 'eva.martinez@example.com',
    sessions_completed: 3,
    status: 'active',
    created_at: '2024-03-10T08:00:00Z'
  },
  {
    id: 'match2',
    name: 'Frank Wilson',
    skill: 'Web Design',
    location: 'Online',
    time_availability: 'Weekday Evenings',
    years_of_experience: 3,
    email: 'frank.wilson@example.com',
    sessions_completed: 2,
    status: 'active',
    created_at: '2024-03-09T16:20:00Z'
  },
  {
    id: 'match3',
    name: 'Tom Brown',
    skill: 'Chinese Language',
    location: 'New York',
    time_availability: 'Monday/Wednesday/Friday mornings',
    years_of_experience: 8,
    email: 'tom.brown@example.com',
    sessions_completed: 12,
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'match4',
    name: 'Maria Garcia',
    skill: 'Marketing',
    location: 'Miami',
    time_availability: 'Weekday afternoons',
    years_of_experience: 6,
    email: 'maria.garcia@example.com',
    sessions_completed: 8
  },
  {
    id: 'match5',
    name: 'James Wilson',
    skill: 'Business Strategy',
    location: 'Chicago',
    time_availability: 'Flexible hours',
    years_of_experience: 10,
    email: 'james.wilson@example.com',
    sessions_completed: 16
  }
]; 