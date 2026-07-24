<?php

namespace App\Http\Controllers\Api;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserController extends BaseController
{
    public function index(Request $request)
    {
        $page = max(1, (int)$request->query('page', 1));
        $perPage = min(max(1, (int)$request->query('per_page', 15)), 100);

        $paginated = User::with('branch')
            ->orderBy('email')
            ->paginate($perPage, ['*'], 'page', $page);

        return $this->success([
            'users' => $paginated->items(),
            'pagination' => [
                'page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'last_page' => $paginated->lastPage(),
                'has_more' => $paginated->hasMorePages(),
            ],
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

    public function import(Request $request)
    {
        $payload = $request->validate([
            'users' => ['required', 'array', 'min:1', 'max:1000'],
            'users.*' => ['required', 'array'],
        ]);

        $created = 0;
        $updated = 0;
        $failed = 0;
        $errors = [];

        foreach ($payload['users'] as $index => $userInput) {
            try {
                $input = $this->normalizeImportInput($userInput);
                $validated = Validator::make($input, [
                    'email' => ['required', 'email', 'max:255'],
                    'password' => ['nullable', 'string'],
                    'role' => ['required', 'string', 'max:255'],
                    'fullname' => ['required', 'string', 'max:255'],
                    'position' => ['nullable', 'string', 'max:255'],
                    'branch_id' => ['nullable', 'string', 'max:255'],
                    'first_login' => ['nullable', 'boolean'],
                    'status' => ['nullable', 'string', 'max:255'],
                ])->validate();

                $user = User::where('email', $validated['email'])->first();
                $userData = [
                    'email' => $validated['email'],
                    'role' => $this->normalizeRole($validated['role']),
                    'fullname' => $validated['fullname'],
                    'position' => $validated['position'] ?? null,
                    'branch_id' => $this->resolveBranchId($validated['branch_id'] ?? null),
                    'first_login' => $validated['first_login'] ?? true,
                    'status' => $this->normalizeStatus($validated['status'] ?? null),
                ];

                if (!empty($validated['password'])) {
                    $userData['password'] = $this->preparePassword($validated['password']);
                } elseif (!$user) {
                    $userData['password'] = Hash::make('password123');
                }

                if ($user) {
                    $user->update($userData);
                    $updated++;
                } else {
                    User::create($userData);
                    $created++;
                }
            } catch (ValidationException $exception) {
                $failed++;
                $this->appendImportError($errors, $index, $userInput, $exception->validator->errors()->first());
            } catch (\Throwable $exception) {
                $failed++;
                $this->appendImportError($errors, $index, $userInput, $exception->getMessage());
            }
        }

        return $this->success([
            'created' => $created,
            'updated' => $updated,
            'failed' => $failed,
            'errors' => $errors,
        ], "Import finished: {$created} added, {$updated} updated" . ($failed ? ", {$failed} failed." : '.'));
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

    public function destroyAll(Request $request)
    {
        $currentUser = $request->user();

        if (strtolower(trim((string) $currentUser?->role)) !== 'admin') {
            return $this->error('Only administrators can delete all users.', 403);
        }

        $request->validate([
            'confirmation' => ['required', Rule::in(['DELETE ALL USERS'])],
        ]);

        $deletedCount = User::query()
            ->whereKeyNot($currentUser->getKey())
            ->delete();

        return $this->success([
            'deleted_count' => $deletedCount,
        ], "{$deletedCount} users deleted successfully. Your signed-in admin account was kept.");
    }

    private function normalizeStatus($status): string
    {
        $normalized = strtoupper(trim((string) ($status ?? '')));

        return in_array($normalized, ['INACTIVE', 'I'], true) ? 'INACTIVE' : 'ACTIVE';
    }

    private function normalizeImportInput(array $input): array
    {
        if (array_key_exists('branchid', $input) && !array_key_exists('branch_id', $input)) {
            $input['branch_id'] = $input['branchid'];
        }

        if (array_key_exists('firstLogin', $input) && !array_key_exists('first_login', $input)) {
            $input['first_login'] = $input['firstLogin'];
        }

        if (array_key_exists('is_active', $input) && !array_key_exists('status', $input)) {
            $input['status'] = $this->normalizeActiveStatus($input['is_active']);
        }

        if (array_key_exists('isActive', $input) && !array_key_exists('status', $input)) {
            $input['status'] = $this->normalizeActiveStatus($input['isActive']);
        }

        $input['email'] = strtolower(trim((string) ($input['email'] ?? '')));
        $input['role'] = $this->normalizeRole($input['role'] ?? null);
        $input['fullname'] = trim((string) ($input['fullname'] ?? $input['name'] ?? ''));
        $input['position'] = trim((string) ($input['position'] ?? ''));
        $input['status'] = $this->normalizeStatus($input['status'] ?? null);
        $input['first_login'] = $this->normalizeBoolean($input['first_login'] ?? true);

        return $input;
    }

    private function normalizeRole($role): string
    {
        $normalized = strtolower(preg_replace('/[^a-z0-9]+/', '', (string) ($role ?? '')));

        if (str_contains($normalized, 'admin')) {
            return 'admin';
        }

        if (str_contains($normalized, 'branchmanager') || str_contains($normalized, 'manager')) {
            return 'manager';
        }

        if (
            str_contains($normalized, 'approver') ||
            str_contains($normalized, 'checker') ||
            str_contains($normalized, 'financehead') ||
            str_contains($normalized, 'credithead') ||
            str_contains($normalized, 'savingscredithead')
        ) {
            return 'approver';
        }

        return 'teller';
    }

    private function normalizeBoolean($value): bool
    {
        $normalized = strtoupper(trim((string) ($value ?? '')));

        if (in_array($normalized, ['0', 'FALSE', 'NO', 'N', 'OFF'], true)) {
            return false;
        }

        return true;
    }

    private function normalizeActiveStatus($value): string
    {
        return $this->normalizeBoolean($value) ? 'ACTIVE' : 'INACTIVE';
    }

    private function preparePassword(string $password): string
    {
        $trimmed = trim($password);

        if (preg_match('/^\$(2y|2a|2b)\$/', $trimmed) || str_starts_with($trimmed, '$argon2')) {
            return $trimmed;
        }

        return Hash::make($trimmed);
    }

    private function resolveBranchId($value): ?int
    {
        $branchValue = trim((string) ($value ?? ''));

        if ($branchValue === '' || $branchValue === '0') {
            return null;
        }

        $branch = Branch::where('branch_code', $branchValue)->first()
            ?? Branch::where('branch_name', $branchValue)->first();

        if (!$branch && ctype_digit($branchValue)) {
            $unpaddedBranchValue = (string) (int) $branchValue;
            $branchCodeCandidates = array_values(array_unique([
                $unpaddedBranchValue,
                'BR' . $branchValue,
                'BR' . $unpaddedBranchValue,
            ]));

            $branch = Branch::whereIn('branch_code', $branchCodeCandidates)->first();
        }

        if (!$branch && ctype_digit($branchValue) && (string) (int) $branchValue === $branchValue) {
            $branch = Branch::find((int) $branchValue);
        }

        if (!$branch) {
            throw ValidationException::withMessages([
                'branch_id' => 'Selected branch was not found.',
            ]);
        }

        return $branch->id;
    }

    private function appendImportError(array &$errors, int $index, array $userInput, string $message): void
    {
        if (count($errors) >= 10) {
            return;
        }

        $errors[] = [
            'row' => $index + 1,
            'email' => $userInput['email'] ?? null,
            'message' => $message,
        ];
    }
}
