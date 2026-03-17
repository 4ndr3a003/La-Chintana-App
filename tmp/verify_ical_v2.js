
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
const filterEvents = (uId) => events.filter(e => {
  const isParticipant = (e.participants && e.participants.includes(uId)) || 
                       (e.shifts && e.shifts.some(s => s.participants && s.participants.includes(uId)));
  
  if (uId && isParticipant) return true;
  
  const visibility = e.visibility || 'Tutti';
  return visibility === 'Tutti';
});

console.log('RESULTS_START');
console.log('PUBLIC_IDS:' + JSON.stringify(filterEvents(null).map(e => e.id)));
console.log('PRIVATE_IDS:' + JSON.stringify(filterEvents(userId).map(e => e.id)));
console.log('RESULTS_END');
