<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('about:members-loan', function () {
    $this->comment('Members Loan Approval backend');
})->purpose('Display the application name');
