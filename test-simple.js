require('dotenv').config();
const https = require('https');

console.log('=== PAYLINK AUTH TEST ===\n');

const postData = JSON.stringify({
    apiId: process.env.PAYLINK_APP_ID,
    secretKey: process.env.PAYLINK_SECRET_KEY,
    persistToken: "false"
});

console.log('Request payload:', postData);
console.log('');

const options = {
    hostname: 'restapi.paylink.sa',
    port: 443,
    path: '/api/auth',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Response:', data);

        try {
            const json = JSON.parse(data);
            if (json.id_token) {
                console.log('\n✅ SUCCESS! Got token!');
            } else if (json.message) {
                console.log('\n❌ Error:', json.message);
            }
        } catch (e) {
            console.log('Could not parse JSON');
        }
    });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(postData);
req.end();
