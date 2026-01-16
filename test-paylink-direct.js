const https = require('https');

const APP_ID = process.env.PAYLINK_APP_ID;
const SECRET_KEY = process.env.PAYLINK_SECRET_KEY;

console.log('Testing Paylink Production API with actual credentials\n');
console.log('APP_ID:', APP_ID ? `${APP_ID.substring(0, 12)}...` : 'MISSING');
console.log('SECRET_KEY:', SECRET_KEY ? `${SECRET_KEY.substring(0, 8)}...` : 'MISSING');
console.log('');

const postData = JSON.stringify({
    apiId: APP_ID,
    secretKey: SECRET_KEY,
    persistToken: "false"  // Must be string, not boolean!
});

const options = {
    hostname: 'restapi.paylink.sa',
    port: 443,
    path: '/api/auth',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Accept': '*/*',
        'User-Agent': 'Node.js'
    },
    timeout: 15000
};

console.log('Making request to:', `https://${options.hostname}${options.path}`);
console.log('Request timeout: 15 seconds\n');

const req = https.request(options, (res) => {
    console.log(`✅ Got response: ${res.statusCode} ${res.statusMessage}`);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));

    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('\n📥 Response body:');
        try {
            const parsed = JSON.parse(data);
            console.log(JSON.stringify(parsed, null, 2));

            if (parsed.id_token) {
                console.log('\n✅ SUCCESS! Authentication token received');
                console.log('Token length:', parsed.id_token.length);
            }
        } catch (e) {
            console.log('Raw response:', data.substring(0, 500));
        }
    });
});

req.on('error', (error) => {
    console.error('\n❌ Request error:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
});

req.on('timeout', () => {
    console.error('\n⏰ Request timed out after 15 seconds');
    console.error('This suggests:');
    console.error('  1. Paylink servers are not responding');
    console.error('  2. Network/firewall is blocking the request');
    console.error('  3. Wrong credentials causing server to hang');
    req.destroy();
});

req.write(postData);
req.end();

console.log('⏳ Waiting for response...\n');
