const body = {
  categoryId: 1,
  title: "BFF curl test",
  description: "test",
  type: "SEMINAR",
  location: "test",
  isOnline: false,
  price: 100,
  maxAttendees: 50,
  thumbnailUrl: null,
  startDate: "2024-04-06T10:00:00",
  endDate: "2024-04-06T18:00:00"
};

fetch('http://localhost:8080/host/events/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': '5'
  },
  body: JSON.stringify(body)
}).then(res => {
  console.log(res.status, res.headers);
  return res.text();
}).then(text => console.log('res text:', text)).catch(err => console.error(err));
