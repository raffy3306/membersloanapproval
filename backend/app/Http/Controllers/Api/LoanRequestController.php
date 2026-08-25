<?php

namespace App\Http\Controllers\Api;

use App\Models\LoanRequest;
use App\Models\Member;
use App\Models\Comaker;
use App\Models\LoanType;
use App\Models\OtherLoan;
use App\Models\Security;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class LoanRequestController extends BaseController
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'dashboard' => 'nullable|in:teller,manager,approver,admin',
            'view' => 'required|in:pending,history',
            'email' => 'nullable|email',
            'branchid' => 'nullable',
            'date_from' => 'nullable|date_format:Y-m-d',
            'date_to' => 'nullable|date_format:Y-m-d|after_or_equal:date_from',
            'client_name' => 'nullable|string|max:100',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $user = $request->user();
        $dashboard = $this->dashboardForUser($user);
        [$dateFrom, $dateTo] = $this->resolveDateRange($validated);
        $query = $this->summaryQuery()
            ->whereBetween('request_date', [$dateFrom, $dateTo]);
        $this->applyClientNameFilter($query, $validated['client_name'] ?? null);

        if ($dashboard === 'teller') {
            $query->where('requested_by', $user->id);
            if ($validated['view'] === 'pending') {
                $query->whereIn('status', ['Pending', 'Returned']);
            }
        } elseif ($dashboard === 'manager') {
            if (is_null($user->branch_id)) {
                $query->whereRaw('1 = 0');
            } else {
                $query->where('branch_id', $user->branch_id);
            }
            if ($validated['view'] === 'pending') {
                $query->whereIn('status', ['Pending', 'Returned to Manager']);
            }
        } elseif ($dashboard === 'approver') {
            if ($validated['view'] === 'pending') {
                $query->where('status', 'Forwarded');
            }
        } elseif ($dashboard === 'admin') {
            // Admin sees all records.
        }

        $perPage = (int) ($validated['per_page'] ?? 10);
        $paginated = $query
            ->orderByDesc('request_date')
            ->orderByDesc('id')
            ->paginate($perPage, ['*'], 'page', (int) ($validated['page'] ?? 1));

        return $this->success([
            'requests' => $paginated->items(),
            'pagination' => $this->paginationData($paginated),
            'filters' => $this->filterData($dateFrom, $dateTo, $validated['client_name'] ?? null),
            'sheetConfigured' => true,
        ]);
    }

    public function audit(Request $request)
    {
        $validated = $request->validate([
            'date_from' => 'nullable|date_format:Y-m-d',
            'date_to' => 'nullable|date_format:Y-m-d|after_or_equal:date_from',
            'client_name' => 'nullable|string|max:100',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);
        $page = (int) ($validated['page'] ?? 1);
        $perPage = (int) ($validated['per_page'] ?? 10);
        [$dateFrom, $dateTo] = $this->resolveDateRange($validated);

        $query = $this->summaryQuery()
            ->whereBetween('request_date', [$dateFrom, $dateTo]);
        $this->applyClientNameFilter($query, $validated['client_name'] ?? null);

        $paginated = $query
            ->orderByDesc('request_date')
            ->orderByDesc('id')
            ->paginate($perPage, ['*'], 'page', $page);

        return $this->success([
            'requests' => $paginated->items(),
            'pagination' => $this->paginationData($paginated),
            'filters' => $this->filterData($dateFrom, $dateTo, $validated['client_name'] ?? null),
            'sheetConfigured' => true,
        ]);
    }

    public function loanTypes()
    {
        return $this->success([
            'loanTypes' => LoanType::where('is_active', true)
                ->orderBy('loan_type_name')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'cif_key' => 'required|exists:members,cif_key',
            'loan_type_id' => 'required|exists:loan_types,id',
            'branch_id' => 'required|exists:branches,id',
            'amount_applied' => 'required|numeric|min:0',
            'request_date' => 'nullable|date',
            'loan_balance' => 'nullable|numeric|min:0',
            'employer' => 'nullable|string',
            'position' => 'nullable|string',
            'employers_address' => 'nullable|string',
            'monthly_pension' => 'nullable|numeric|min:0',
            'current_nthp' => 'nullable|numeric|min:0',
            'analysis_nthp' => 'nullable|string',
            'share_capital' => 'nullable|numeric|min:0',
            'date_of_retirement' => 'nullable|date',
            'appraisal_result' => 'nullable|string',
            'recommendation' => 'nullable|string',
            'comakers' => 'nullable|array',
            'other_loans' => 'nullable|array',
            'securities' => 'nullable|array',
        ]);

        $member = Member::where('cif_key', $validated['cif_key'])->first();

        if (!$member) {
            return $this->error('Selected member was not found.', 422);
        }

        if ($user && strtolower(trim((string) $user->role)) === 'teller') {
            if (is_null($user->branch_id)) {
                return $this->error(
                    'Your teller account does not have an assigned branch.',
                    422
                );
            }

            if ((int) $member->branch_id !== (int) $user->branch_id) {
                return $this->error(
                    'The selected member does not belong to your branch.',
                    422
                );
            }

            $validated['branch_id'] = (int) $user->branch_id;
        }

        return DB::transaction(function () use ($validated, $member, $user) {
            $this->updateMemberRequestFields($member, $validated);

            $loanRequest = LoanRequest::create([
                'member_id' => $member->id,
                'loan_type_id' => $validated['loan_type_id'],
                'branch_id' => $validated['branch_id'],
                'amount_applied' => $validated['amount_applied'],
                'loan_balance' => $validated['loan_balance'] ?? 0,
                'employer' => $validated['employer'] ?? null,
                'position' => $validated['position'] ?? null,
                'employers_address' => $validated['employers_address'] ?? null,
                'monthly_pension' => $validated['monthly_pension'] ?? 0,
                'current_nthp' => $validated['current_nthp'] ?? 0,
                'analysis_nthp' => $validated['analysis_nthp'] ?? null,
                'appraisal_result' => $validated['appraisal_result'] ?? null,
                'recommendation' => $validated['recommendation'] ?? null,
                'requested_by' => $user->id,
                'status' => 'Pending',
                'request_date' => $validated['request_date'] ?? now(),
            ]);

            $this->replaceRelatedRows($loanRequest, $member->id, $validated);

            return $this->success(
                $loanRequest->fresh()->load(['member', 'loanType', 'branch', 'requestedBy', 'manager', 'approver', 'comakers', 'otherLoans', 'securities', 'attachments']),
                'Loan request created successfully',
                201
            );
        });
    }

    public function show($id)
    {
        $loanRequest = $this->findLoanRequest($id);

        if (!$loanRequest) {
            return $this->error('Loan request not found', 404);
        }

        if (!$this->canAccessLoanRequest(request()->user(), $loanRequest)) {
            return $this->error('You do not have permission to view this loan request.', 403);
        }

        return $this->success($loanRequest->load([
            'member',
            'loanType',
            'branch',
            'requestedBy',
            'manager',
            'approver',
            'comakers',
            'otherLoans',
            'securities',
            'attachments',
        ]));
    }

    public function update(Request $request, $id)
    {
        $loanRequest = $this->findLoanRequest($id);

        if (!$loanRequest) {
            return $this->error('Loan request not found', 404);
        }

        $user = auth('api')->user();

        if (!$this->canAccessLoanRequest($user, $loanRequest)) {
            return $this->error('You do not have permission to update this loan request.', 403);
        }

        $validated = $request->validate([
            'status' => 'nullable|in:Pending,Forwarded,Returned,Returned to Manager,Approved,Disapproved,Rejected',
            'manager_notes' => 'nullable|string',
            'approver_notes' => 'nullable|string',
            'review_and_recommendations' => 'nullable|string',
            'date_of_approval' => 'nullable|date',
            'loan_amount_approved' => 'nullable|numeric|min:0',
            'additional_requirements' => 'nullable|string',
            'cif_key' => 'nullable|exists:members,cif_key',
            'loan_type_id' => 'nullable|exists:loan_types,id',
            'branch_id' => 'nullable|exists:branches,id',
            'amount_applied' => 'nullable|numeric|min:0',
            'request_date' => 'nullable|date',
            'loan_balance' => 'nullable|numeric|min:0',
            'employer' => 'nullable|string',
            'position' => 'nullable|string',
            'employers_address' => 'nullable|string',
            'monthly_pension' => 'nullable|numeric|min:0',
            'current_nthp' => 'nullable|numeric|min:0',
            'analysis_nthp' => 'nullable|string',
            'share_capital' => 'nullable|numeric|min:0',
            'date_of_retirement' => 'nullable|date',
            'appraisal_result' => 'nullable|string',
            'recommendation' => 'nullable|string',
            'comakers' => 'nullable|array',
            'other_loans' => 'nullable|array',
            'securities' => 'nullable|array',
        ]);

        $disallowedFields = array_diff(
            array_keys($validated),
            $this->allowedUpdateFields($user)
        );

        if ($disallowedFields !== []) {
            return $this->error('Your role cannot update one or more submitted loan fields.', 403);
        }

        if (!$this->canTransitionStatus($user, $loanRequest->status, $validated['status'] ?? null)) {
            return $this->error('The requested loan status transition is not allowed for your role.', 422);
        }

        if ($this->dashboardForUser($user) === 'teller') {
            if (is_null($user->branch_id)) {
                return $this->error('Your teller account does not have an assigned branch.', 422);
            }

            $selectedMember = !empty($validated['cif_key'])
                ? Member::where('cif_key', $validated['cif_key'])->first()
                : $loanRequest->member;

            if (!$selectedMember || (int) $selectedMember->branch_id !== (int) $user->branch_id) {
                return $this->error('The selected member does not belong to your branch.', 422);
            }

            $validated['branch_id'] = (int) $user->branch_id;
        }

        if (($validated['status'] ?? null) === 'Approved') {
            if (trim((string) ($validated['review_and_recommendations'] ?? '')) === '') {
                return $this->error('Review and recommendations are required before approving a request.', 422);
            }

            if (
                !array_key_exists('loan_amount_approved', $validated) ||
                trim((string) $validated['loan_amount_approved']) === ''
            ) {
                return $this->error('Loan amount approved is required before approving a request.', 422);
            }
        }

        $updateData = collect($validated)->except([
            'cif_key',
            'share_capital',
            'date_of_retirement',
            'comakers',
            'other_loans',
            'securities',
        ])->toArray();

        // Saving an edited request resubmits it to the manager. Keep this rule on
        // the server as well as in the client so returned requests cannot remain
        // hidden in the teller's Returned state after their corrections are saved.
        if (
            $user &&
            strtolower(trim((string) $user->role)) === 'teller' &&
            $loanRequest->status === 'Returned'
        ) {
            $updateData['status'] = 'Pending';
        }

        if (!empty($validated['cif_key'])) {
            $member = Member::where('cif_key', $validated['cif_key'])->first();
            $updateData['member_id'] = $member->id;
        } else {
            $member = $loanRequest->member;
        }

        $this->updateMemberRequestFields($member, $validated);

        if (!empty($validated['status'])) {
            if ($validated['status'] === 'Approved') {
                $updateData['date_of_approval'] = now();
            }

            // Set manager_id when manager forwards or returns a request
            if ($user->role === 'manager' && in_array($validated['status'], ['Forwarded', 'Returned'])) {
                $updateData['manager_id'] = $user->id;
            }

            // Set approver_id when the approver acts on a request.
            if ($user->role === 'approver' && in_array($validated['status'], ['Approved', 'Disapproved', 'Rejected', 'Returned to Manager'])) {
                $updateData['approver_id'] = $user->id;
            }
        }

        $loanRequest->update($updateData);

        if (
            array_key_exists('comakers', $validated) ||
            array_key_exists('other_loans', $validated) ||
            array_key_exists('securities', $validated)
        ) {
            $this->replaceRelatedRows($loanRequest, $member->id, $validated);
        }

        return $this->success(
            $loanRequest->fresh()->load(['member', 'loanType', 'branch', 'requestedBy', 'manager', 'approver', 'comakers', 'otherLoans', 'securities', 'attachments']),
            'Loan request updated successfully'
        );
    }

    private function updateMemberRequestFields(Member $member, array $validated): void
    {
        $memberData = [];

        if (Schema::hasColumn('members', 'share_capital') && array_key_exists('share_capital', $validated)) {
            $memberData['share_capital'] = $validated['share_capital'];
        }

        if (Schema::hasColumn('members', 'date_of_retirement') && array_key_exists('date_of_retirement', $validated)) {
            $memberData['date_of_retirement'] = $validated['date_of_retirement'];
        }

        if ($memberData) {
            $member->update($memberData);
        }
    }

    public function destroy($id)
    {
        $loanRequest = $this->findLoanRequest($id);

        if (!$loanRequest) {
            return $this->error('Loan request not found', 404);
        }

        $loanRequest->delete();

        return $this->success([], 'Loan request deleted successfully');
    }

    private function findLoanRequest(string $id): ?LoanRequest
    {
        return LoanRequest::where('id', $id)
            ->orWhere('request_id', $id)
            ->first();
    }

    private function summaryQuery()
    {
        $memberColumns = array_merge(['id'], $this->memberNameColumns());

        return LoanRequest::query()
            ->select([
                'id',
                'request_id',
                'request_date',
                'member_id',
                'loan_type_id',
                'branch_id',
                'amount_applied',
                'status',
                'requested_by',
                'manager_id',
                'approver_id',
                'manager_notes',
                'approver_notes',
                'review_and_recommendations',
                'date_of_approval',
                'loan_amount_approved',
                'additional_requirements',
                'recommendation',
            ])
            ->with([
                'member' => fn ($query) => $query->select($memberColumns),
                'loanType:id,loan_type_name',
                'branch:id,branch_name',
                'requestedBy:id,email,fullname',
                'manager:id,email,fullname',
                'approver:id,email,fullname',
            ]);
    }

    private function resolveDateRange(array $validated): array
    {
        $now = CarbonImmutable::now(config('app.timezone'));
        $dateFrom = isset($validated['date_from'])
            ? CarbonImmutable::createFromFormat('Y-m-d', $validated['date_from'], config('app.timezone'))->startOfDay()
            : $now->startOfMonth()->startOfDay();
        $dateTo = isset($validated['date_to'])
            ? CarbonImmutable::createFromFormat('Y-m-d', $validated['date_to'], config('app.timezone'))->endOfDay()
            : $now->endOfMonth()->endOfDay();

        return [$dateFrom, $dateTo];
    }

    private function paginationData($paginated): array
    {
        return [
            'page' => $paginated->currentPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
            'last_page' => $paginated->lastPage(),
            'has_more' => $paginated->hasMorePages(),
        ];
    }

    private function applyClientNameFilter($query, ?string $clientName): void
    {
        $clientName = trim((string) $clientName);

        if ($clientName === '') {
            return;
        }

        $nameColumns = $this->memberNameColumns();
        if ($nameColumns === []) {
            $query->whereRaw('1 = 0');
            return;
        }

        $prefixSearch = addcslashes($clientName, '\\%_') . '%';
        $query->whereHas('member', function ($memberQuery) use ($nameColumns, $prefixSearch): void {
            $memberQuery->where(function ($nameQuery) use ($nameColumns, $prefixSearch): void {
                foreach ($nameColumns as $column) {
                    $nameQuery->orWhere($column, 'like', $prefixSearch);
                }
            });
        });
    }

    private function memberNameColumns(): array
    {
        return array_values(array_filter(
            ['fullname', 'client_name'],
            fn (string $column): bool => Schema::hasColumn('members', $column)
        ));
    }

    private function filterData(
        CarbonImmutable $dateFrom,
        CarbonImmutable $dateTo,
        ?string $clientName
    ): array
    {
        return [
            'date_from' => $dateFrom->toDateString(),
            'date_to' => $dateTo->toDateString(),
            'client_name' => trim((string) $clientName),
        ];
    }

    private function dashboardForUser($user): string
    {
        $role = strtolower(trim((string) $user?->role));

        if ($role === 'branch_manager') {
            return 'manager';
        }

        return in_array($role, ['manager', 'approver', 'admin'], true) ? $role : 'teller';
    }

    private function canAccessLoanRequest($user, LoanRequest $loanRequest): bool
    {
        $role = $this->dashboardForUser($user);

        return match ($role) {
            'admin', 'approver' => true,
            'manager' => !is_null($user?->branch_id)
                && (int) $loanRequest->branch_id === (int) $user->branch_id,
            default => (int) $loanRequest->requested_by === (int) $user?->id,
        };
    }

    private function allowedUpdateFields($user): array
    {
        $tellerFields = [
            'status',
            'cif_key',
            'loan_type_id',
            'branch_id',
            'amount_applied',
            'request_date',
            'loan_balance',
            'employer',
            'position',
            'employers_address',
            'monthly_pension',
            'current_nthp',
            'analysis_nthp',
            'share_capital',
            'date_of_retirement',
            'appraisal_result',
            'recommendation',
            'comakers',
            'other_loans',
            'securities',
        ];

        return match ($this->dashboardForUser($user)) {
            'admin' => array_merge($tellerFields, [
                'manager_notes',
                'approver_notes',
                'review_and_recommendations',
                'date_of_approval',
                'loan_amount_approved',
                'additional_requirements',
            ]),
            'manager' => ['status', 'manager_notes'],
            'approver' => [
                'status',
                'approver_notes',
                'review_and_recommendations',
                'loan_amount_approved',
                'additional_requirements',
            ],
            default => $tellerFields,
        };
    }

    private function canTransitionStatus($user, string $currentStatus, ?string $nextStatus): bool
    {
        $role = $this->dashboardForUser($user);

        if ($role === 'admin') {
            return true;
        }

        if ($nextStatus === null) {
            return $role !== 'teller' || in_array($currentStatus, ['Pending', 'Returned'], true);
        }

        return match ($role) {
            'teller' => in_array($currentStatus, ['Pending', 'Returned'], true)
                && $nextStatus === 'Pending',
            'manager' => in_array($currentStatus, ['Pending', 'Returned to Manager'], true)
                && in_array($nextStatus, ['Forwarded', 'Returned'], true),
            'approver' => $currentStatus === 'Forwarded'
                && in_array($nextStatus, ['Approved', 'Disapproved', 'Rejected', 'Returned to Manager'], true),
            default => false,
        };
    }

    private function replaceRelatedRows(LoanRequest $loanRequest, int $memberId, array $data): void
    {
        if (array_key_exists('comakers', $data)) {
            $loanRequest->comakers()->delete();

            foreach ($data['comakers'] ?? [] as $comaker) {
                if (empty($comaker['comaker_fullname']) && empty($comaker['fullname'])) {
                    continue;
                }

                Comaker::create([
                    'loan_request_id' => $loanRequest->id,
                    'member_id' => $memberId,
                    'comaker_fullname' => $comaker['comaker_fullname'] ?? $comaker['fullname'],
                    'loan_type' => $comaker['loan_type'] ?? null,
                    'loan_amount' => $comaker['loan_amount'] ?? null,
                    'loan_balance' => $comaker['loan_balance'] ?? null,
                    'status' => $comaker['status'] ?? null,
                ]);
            }
        }

        if (array_key_exists('other_loans', $data)) {
            $loanRequest->otherLoans()->delete();

            foreach ($data['other_loans'] ?? [] as $loan) {
                if (empty($loan['loan_type'])) {
                    continue;
                }

                OtherLoan::create([
                    'loan_request_id' => $loanRequest->id,
                    'member_id' => $memberId,
                    'loan_type' => $loan['loan_type'],
                    'loan_amount' => $loan['loan_amount'] ?? 0,
                    'balance' => $loan['balance'] ?? 0,
                    'status' => $loan['status'] ?? '',
                    'analysis' => $loan['analysis'] ?? null,
                ]);
            }
        }

        if (array_key_exists('securities', $data)) {
            $loanRequest->securities()->delete();

            foreach ($data['securities'] ?? [] as $security) {
                if (empty($security['nature'])) {
                    continue;
                }

                Security::create([
                    'loan_request_id' => $loanRequest->id,
                    'nature' => $security['nature'],
                    'market_value' => $security['market_value'] ?? null,
                    'appraised_value' => $security['appraised_value'] ?? null,
                ]);
            }
        }
    }
}
