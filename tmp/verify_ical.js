
const events = [
  {
    id: 'event1',
    title: 'Evento Pubblico',
    date: '2026-03-20T10:00:00Z',
    visibility: 'Tutti',
    participants: []
  },
  {
    id: 'event2',
    title: 'Evento Privato Partecipato',
    date: '2026-03-21T10:00:00Z',
    visibility: 'Solo Direttivo',
    participants: ['user123']
  },
  {
    id: 'event3',
    title: 'Evento Privato No Partecipato',
    date: '2026-03-22T10:00:00Z',
    visibility: 'Solo Direttivo',
    participants: ['otheruser']
  },
  {
    id: 'event4',
    title: 'Evento con Turni Partecipati',
    date: '2026-03-23T00:00:00Z',
    visibility: 'Tutti',
    shifts: [
      { id: 'shift1', startTime: '08:00', endTime: '12:00', participants: ['user123'] },
      { id: 'shift2', startTime: '12:00', endTime: '16:00', participants: [] }
    ]
  }
];

const userId = 'user123';

// Mock Filtering Logic
const filteredByAll = events.filter(e => {
  const isParticipant = (e.participants && e.participants.includes(null)) || 
                       (e.shifts && e.shifts.some(s => s.participants && s.participants.includes(null)));
  
  if (null && isParticipant) return true;
  
  const visibility = e.visibility || 'Tutti';
  return visibility === 'Tutti';
});

const filteredByUser = events.filter(e => {
  const isParticipant = (e.participants && e.participants.includes(userId)) || 
                       (e.shifts && e.shifts.some(s => s.participants && s.participants.includes(userId)));
  
  if (userId && isParticipant) return true;
  
  const visibility = e.visibility || 'Tutti';
  return visibility === 'Tutti';
});

console.log('--- Test Filtering ---');
console.log('Public (no userId):', filteredByAll.map(e => e.id)); // Should be [event1, event4]
console.log('Personal (userId=user123):', filteredByUser.map(e => e.id)); // Should be [event1, event2, event4]

// Mock Date Formatter
const formatICalLocal = (date) => {
  const pad = (n) => n.toString().padStart(2, '0');
  return date.getFullYear() +
         pad(date.getMonth() + 1) +
         pad(date.getDate()) + 'T' +
         pad(date.getHours()) +
         pad(date.getMinutes()) +
         pad(date.getSeconds());
};

console.log('\n--- Test Date Formatting ---');
const testDate = new Date('2026-03-20T15:30:00'); // Local time
console.log('Date object:', testDate.toString());
console.log('ICal Local:', formatICalLocal(testDate)); // Should be 20260320T153000
