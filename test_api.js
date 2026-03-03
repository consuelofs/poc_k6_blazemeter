'use strict';

import http from 'k6/http';
import { sleep, check } from 'k6';

const url = 'https://api.example.com/data';

export default function () {
    const res = http.get(url);

    check(res, {
        'status is 200': (r) => r.status === 200,
        'response body is not empty': (r) => r.body.length > 0,
    });

    sleep(1); // Sleep for 1 second before the next request
}