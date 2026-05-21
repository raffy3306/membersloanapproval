<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LoanRequestController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\AttachmentController;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/health', [HealthController::class, 'check']);
Route::get('/branches', [BranchController::class, 'index']);
Route::get('/branches/{id}', [BranchController::class, 'show']);

Route::middleware('auth:api')->group(function () {
    // Auth
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

    // Branches (Admin)
    Route::post('/branches', [BranchController::class, 'store']);
    Route::put('/branches/{id}', [BranchController::class, 'update']);
    Route::delete('/branches/{id}', [BranchController::class, 'destroy']);

    // Loan Requests
    Route::get('/loan-requests', [LoanRequestController::class, 'index']);
    Route::get('/loan-requests/audit', [LoanRequestController::class, 'audit']);
    Route::post('/loan-requests', [LoanRequestController::class, 'store']);
    Route::get('/loan-requests/{id}', [LoanRequestController::class, 'show']);
    Route::put('/loan-requests/{id}', [LoanRequestController::class, 'update']);
    Route::delete('/loan-requests/{id}', [LoanRequestController::class, 'destroy']);
    Route::post('/loan-requests/{id}/attachments', [AttachmentController::class, 'store']);
    Route::get('/attachments/{attachment}/preview', [AttachmentController::class, 'preview']);
    Route::put('/attachments/{attachment}', [AttachmentController::class, 'update']);
    Route::delete('/attachments/{attachment}', [AttachmentController::class, 'destroy']);
    Route::get('/loan-types', [LoanRequestController::class, 'loanTypes']);

    // Members
    Route::get('/members', [MemberController::class, 'index']);
    Route::post('/members', [MemberController::class, 'store']);
    Route::get('/members/{id}', [MemberController::class, 'show']);
    Route::put('/members/{id}', [MemberController::class, 'update']);
    Route::delete('/members/{id}', [MemberController::class, 'destroy']);

    // Users (Admin)
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // Settings (Admin)
    Route::get('/settings', [SettingController::class, 'index']);
    Route::put('/settings', [SettingController::class, 'update']);
});
