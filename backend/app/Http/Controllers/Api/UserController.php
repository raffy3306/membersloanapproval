<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends BaseController
{
    public function index(Request $request)
    {
        $users = User::with('branch')->get();

        return $this->success([
            'users' => $users,
            'sheetConfigured' => true,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|unique:users,email',
            'password' => 'nullable|min:6',
            'role' => 'required|in:teller,manager,branch_manager,approver,admin',
            'fullname' => 'required|string',
            'position' => 'nullable|string',
            'branch_id' => 'nullable|exists:branches,id',
            'first_login' => 'nullable|boolean',
            'status' => 'nullable|in:ACTIVE,INACTIVE,Active,Inactive,active,inactive,A,I',
        ]);

        $validated['role'] = $validated['role'] === 'branch_manager' ? 'manager' : $validated['role'];
        $validated['password'] = Hash::make($validated['password'] ?? 'password123');
        $validated['first_login'] = $validated['first_login'] ?? true;
        $validated['status'] = $this->normalizeStatus($validated['status'] ?? null);

        $user = User::create($validated);

        return $this->success($user, 'User created successfully', 201);
    }

    public function show($id)
    {
        $user = User::with('branch')->find($id);

        if (!$user) {
            return $this->error('User not found', 404);
        }

        return $this->success($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return $this->error('User not found', 404);
        }

        $validated = $request->validate([
            'email' => 'nullable|unique:users,email,' . $id,
            'password' => 'nullable|min:6',
            'role' => 'nullable|in:teller,manager,branch_manager,approver,admin',
            'fullname' => 'nullable|string',
            'position' => 'nullable|string',
            'branch_id' => 'nullable|exists:branches,id',
            'first_login' => 'nullable|boolean',
            'status' => 'nullable|in:ACTIVE,INACTIVE,Active,Inactive,active,inactive,A,I',
        ]);

        if (isset($validated['role'])) {
            $validated['role'] = $validated['role'] === 'branch_manager' ? 'manager' : $validated['role'];
        }

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        if (array_key_exists('status', $validated)) {
            $validated['status'] = $this->normalizeStatus($validated['status']);
        }

        $user->update($validated);

        return $this->success($user, 'User updated successfully');
    }

    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return $this->error('User not found', 404);
        }

        $user->delete();

        return $this->success([], 'User deleted successfully');
    }

    private function normalizeStatus($status): string
    {
        $normalized = strtoupper(trim((string) ($status ?? '')));

        return in_array($normalized, ['INACTIVE', 'I'], true) ? 'INACTIVE' : 'ACTIVE';
    }
}
