<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LoanRequestController;
use App\Http\Controllers\Api\LoanTypeController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\AttachmentController;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');
Route::get('/health', [HealthController::class, 'check'])->middleware('throttle:30,1');

Route::middleware(['auth:api', 'throttle:120,1'])->group(function () {
    // Auth
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword'])->middleware('throttle:5,1');

    // Branches
    Route::get('/branches', [BranchController::class, 'index']);
    Route::get('/branches/{id}', [BranchController::class, 'show']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/branches', [BranchController::class, 'store']);
        Route::put('/branches/{id}', [BranchController::class, 'update']);
        Route::delete('/branches/{id}', [BranchController::class, 'destroy']);
    });

    // Loan Requests
    Route::get('/loan-requests', [LoanRequestController::class, 'index']);
    Route::get('/loan-requests/audit', [LoanRequestController::class, 'audit'])->middleware('role:admin');
    Route::post('/loan-requests', [LoanRequestController::class, 'store'])->middleware('role:teller,admin');
    Route::get('/loan-requests/{id}', [LoanRequestController::class, 'show']);
    Route::put('/loan-requests/{id}', [LoanRequestController::class, 'update']);
    Route::delete('/loan-requests/{id}', [LoanRequestController::class, 'destroy'])->middleware('role:admin');
    Route::post('/loan-requests/{id}/attachments', [AttachmentController::class, 'store'])->middleware('role:teller,admin');
    Route::get('/attachments/{attachment}/preview', [AttachmentController::class, 'preview']);
    Route::put('/attachments/{attachment}', [AttachmentController::class, 'update'])->middleware('role:teller,admin');
    Route::delete('/attachments/{attachment}', [AttachmentController::class, 'destroy'])->middleware('role:teller,admin');
    Route::get('/loan-types', [LoanRequestController::class, 'loanTypes']);
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/loan-types', [LoanTypeController::class, 'index']);
        Route::post('/admin/loan-types', [LoanTypeController::class, 'store']);
        Route::put('/admin/loan-types/{loanType}', [LoanTypeController::class, 'update']);
    });

    // Members
    Route::get('/members', [MemberController::class, 'index']);
    Route::get('/members/{id}', [MemberController::class, 'show']);
    Route::post('/members', [MemberController::class, 'store'])->middleware('role:teller,admin');
    Route::middleware('role:admin')->group(function () {
        Route::post('/members/import', [MemberController::class, 'import'])->middleware('throttle:5,1');
        Route::delete('/members', [MemberController::class, 'destroyAll']);
        Route::put('/members/{id}', [MemberController::class, 'update']);
        Route::delete('/members/{id}', [MemberController::class, 'destroy']);
    });

    // Users (Admin)
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::post('/users/import', [UserController::class, 'import'])->middleware('throttle:5,1');
        Route::delete('/users', [UserController::class, 'destroyAll']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });

    // Settings (Admin)
    Route::get('/settings', [SettingController::class, 'index']);
    Route::put('/settings', [SettingController::class, 'update'])->middleware('role:admin');
});
