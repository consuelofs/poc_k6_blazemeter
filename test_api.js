import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
    vus: 1, // Virtual users
    duration: '1m', // Test duration
};

export default function () {
    let headers = {
        'User-Agent': 'Chrome/58',
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate'
    };
    http.get('https://demoblaze.com', { headers: headers });
    sleep(1); // sleep for 1 second
}