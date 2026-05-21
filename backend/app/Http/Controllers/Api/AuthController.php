<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use Carbon\Carbon;

class AuthController extends BaseController
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return $this->error('Invalid credentials', 401);
        }

        if (strtoupper((string) $user->status) === 'INACTIVE') {
            return $this->error('Account is inactive. Please contact an administrator.', 403);
        }

        $token = JWTAuth::attempt($validated);

        $user->update(['last_login_at' => Carbon::now()]);

        return $this->success([
            'token' => $token,
            'user' => $this->formatUser($user),
        ]);
    }

    public function logout(Request $request)
    {
        JWTAuth::invalidate(JWTAuth::getToken());
        return $this->success(['message' => 'Successfully logged out']);
    }

    public function me(Request $request)
    {
        $user = auth('api')->user();
        if (!$user) {
            return $this->error('Unauthorized', 401);
        }

        return $this->success($this->formatUser($user));
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        $user = auth('api')->user();

        if (!$user) {
            return $this->error('Unauthorized', 401);
        }

        if (!Hash::check($validated['current_password'], $user->password)) {
            return $this->error('Current password is incorrect', 422);
        }

        $user->update([
            'password' => Hash::make($validated['new_password']),
            'first_login' => false,
        ]);

        return $this->success([
            'user' => $this->formatUser($user->fresh('branch')),
        ], 'Password changed successfully');
    }

    private function formatUser($user)
    {
        return [
            'id' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'fullname' => $user->fullname,
            'position' => $user->position,
            'branchid' => $user->branch_id,
            'branchName' => $user->branch->branch_name ?? null,
            'firstLogin' => $user->first_login,
            'status' => $user->status ?? 'ACTIVE',
        ];
    }
}
