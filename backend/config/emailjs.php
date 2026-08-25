<?php

return [
    'endpoint' => env('EMAILJS_ENDPOINT', 'https://api.emailjs.com/api/v1.0/email/send'),
    'service_id' => env('EMAILJS_SERVICE_ID'),
    'template_id' => env('EMAILJS_PASSWORD_RESET_TEMPLATE_ID'),
    'public_key' => env('EMAILJS_PUBLIC_KEY'),
    'private_key' => env('EMAILJS_PRIVATE_KEY'),
    'timeout' => (int) env('EMAILJS_TIMEOUT', 15),
];
