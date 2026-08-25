<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user('api') ?? $request->user();
        $actualRole = $this->normalizeRole($user?->role);
        $allowedRoles = array_map($this->normalizeRole(...), $roles);

        if (!$user || !in_array($actualRole, $allowedRoles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to perform this action.',
                'errors' => [],
            ], 403);
        }

        return $next($request);
    }

    private function normalizeRole($role): string
    {
        $normalized = strtolower(trim((string) $role));

        return $normalized === 'branch_manager' ? 'manager' : $normalized;
    }
}
