<?php
return [
    'paths' => ['api/*'],  // السماح بالطلبات على جميع مسارات الـ API
    'allowed_methods' => ['*'],  // السماح بجميع الطرق (GET, POST, PUT, DELETE, OPTIONS)
    'allowed_origins' => ['*'],
    'allowed_origins_patterns' => ['*'],
    'allowed_headers' => ['*'],  // السماح بجميع الرؤوس
    'exposed_headers' => ['*'],  // السماح بكافة الرؤوس المكشوفة
    'max_age' => 0,
    'supports_credentials' => false, // تغيير إلى `true` إذا كنت تستخدم المصادقة (مثل `Sanctum`)
];

