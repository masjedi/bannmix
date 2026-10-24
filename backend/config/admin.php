<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Admin password reset delivery
    |--------------------------------------------------------------------------
    |
    | Login uses the admin user's email in the database. Reset links are sent
    | to this mailbox so only the account owner can complete the reset.
    |
    */

    'password_reset_email' => env(
        'ADMIN_PASSWORD_RESET_EMAIL',
        'Abdulmalik_hamdard@yahoo.com'
    ),

    'forgot_password_max_attempts' => (int) env(
        'FORGOT_PASSWORD_MAX_ATTEMPTS',
        10
    ),

    'forgot_password_decay_minutes' => (int) env(
        'FORGOT_PASSWORD_DECAY_MINUTES',
        15
    ),

];
