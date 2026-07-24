<?php

namespace App\Http\Controllers\Api;

use App\Models\LoanType;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LoanTypeController extends BaseController
{
    public function index(Request $request)
    {
        if ($response = $this->requireAdmin($request)) {
            return $response;
        }

        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(max(1, (int) $request->query('per_page', 15)), 100);
        $paginated = LoanType::orderBy('loan_type_name')
            ->paginate($perPage, ['*'], 'page', $page);

        return $this->success([
            'loanTypes' => $paginated->items(),
            'pagination' => [
                'page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'last_page' => $paginated->lastPage(),
                'has_more' => $paginated->hasMorePages(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        if ($response = $this->requireAdmin($request)) {
            return $response;
        }

        $validated = $request->validate($this->rules());
        $loanType = LoanType::create($validated);

        return $this->success($loanType, 'Loan type created successfully', 201);
    }

    public function update(Request $request, LoanType $loanType)
    {
        if ($response = $this->requireAdmin($request)) {
            return $response;
        }

        $validated = $request->validate($this->rules($loanType));
        $loanType->update($validated);

        return $this->success($loanType->fresh(), 'Loan type updated successfully');
    }

    private function rules(?LoanType $loanType = null): array
    {
        return [
            'loan_type_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('loan_types', 'loan_type_name')->ignore($loanType?->id),
            ],
            'description' => ['nullable', 'string'],
            'minimum_amount' => ['nullable', 'numeric', 'min:0'],
            'maximum_amount' => ['nullable', 'numeric', 'min:0'],
            'maximum_term_months' => ['nullable', 'integer', 'min:1'],
            'interest_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    private function requireAdmin(Request $request)
    {
        $user = $request->user();

        if (!$user || strtolower(trim((string) $user->role)) !== 'admin') {
            return $this->error('Only administrators can manage loan types.', 403);
        }

        return null;
    }
}
