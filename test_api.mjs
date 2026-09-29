import http from 'http';

http.get('http://localhost:3000/api/v1/questions?page=1&limit=5', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    try {
      console.log('Body:', JSON.stringify(JSON.parse(data), null, 2));
    } catch(e) {
      console.log('Body:', data);
    }
  });
}).on('error', err => {
  console.log('Error: ', err.message);
});
