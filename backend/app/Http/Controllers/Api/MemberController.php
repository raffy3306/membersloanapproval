<?php

namespace App\Http\Controllers\Api;

use App\Models\Branch;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class MemberController extends BaseController
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $limit = min(max((int) $request->query('limit', 50), 1), 1000);
        $query = Member::query()->with('branch');

        if ($search) {
            $searchableColumns = $this->existingMemberColumns([
                'client_name',
                'fullname',
                'cif_key',
                'contactnumber',
                'contact',
                'address',
                'occupation',
                'tin_number',
                'tin',
            ]);

            $query->where(function ($memberQuery) use ($search, $searchableColumns) {
                foreach ($searchableColumns as $index => $column) {
                    $method = $index === 0 ? 'where' : 'orWhere';
                    $memberQuery->{$method}($column, 'like', "%{$search}%");
                }
            });
        }

        $members = $query
            ->orderBy($this->memberNameColumn())
            ->limit($limit)
            ->get();

        return $this->success([
            'members' => $members,
            'sheetConfigured' => true,
        ]);
    }

    public function show($id)
    {
        $member = $this->findMember($id);

        if (!$member) {
            return $this->error('Member not found', 404);
        }

        return $this->success($member->load(['branch', 'loanRequests', 'otherLoans', 'comakers']));
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->validationRules([
            'cif_key' => ['required', 'string', 'max:255', 'unique:members,cif_key'],
            'client_name' => ['required_without:fullname', 'nullable', 'string', 'max:255'],
            'fullname' => ['required_without:client_name', 'nullable', 'string', 'max:255'],
        ]));

        $member = Member::create($this->toMemberData($validated, true));

        return $this->success($member->load('branch'), 'Member created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $member = $this->findMember($id);

        if (!$member) {
            return $this->error('Member not found', 404);
        }

        $validated = $request->validate($this->validationRules([
            'cif_key' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('members', 'cif_key')->ignore($member->id),
            ],
            'client_name' => ['nullable', 'string', 'max:255'],
            'fullname' => ['nullable', 'string', 'max:255'],
        ]));

        $member->update($this->toMemberData($validated));

        return $this->success($member->load('branch'), 'Member updated successfully');
    }

    public function destroy($id)
    {
        $member = $this->findMember($id);

        if (!$member) {
            return $this->error('Member not found', 404);
        }

        $member->delete();

        return $this->success([], 'Member deleted successfully');
    }

    private function findMember(string $id): ?Member
    {
        return Member::where('id', $id)
            ->orWhere('cif_key', $id)
            ->first();
    }

    private function validationRules(array $overrides = []): array
    {
        return array_merge([
            'cif_key' => ['nullable', 'string', 'max:255'],
            'client_name' => ['nullable', 'string', 'max:255'],
            'fullname' => ['nullable', 'string', 'max:255'],
            'membership_date' => ['nullable', 'date'],
            'membership_type' => ['nullable', 'string', 'max:255'],
            'member_type' => ['nullable', 'string', 'max:255'],
            'sex' => ['nullable', 'in:M,F,Other'],
            'age' => ['nullable', 'integer', 'min:0'],
            'birthdate' => ['nullable', 'date'],
            'birth_date' => ['nullable', 'date'],
            'contactnumber' => ['nullable', 'string', 'max:255'],
            'contact' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'share_capital' => ['nullable', 'numeric', 'min:0'],
            'date_of_retirement' => ['nullable', 'date'],
            'branch_id' => ['nullable', 'string', 'max:255'],
            'branchid' => ['nullable', 'string', 'max:255'],
            'branch' => ['nullable', 'string', 'max:255'],
            'branch_code' => ['nullable', 'string', 'max:255'],
            'branch_name' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:255'],
            'tin_number' => ['nullable', 'string', 'max:255'],
            'tin' => ['nullable', 'string', 'max:255'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'educational_attainment' => ['nullable', 'string', 'max:255'],
        ], $overrides);
    }

    private function toMemberData(array $validated, bool $defaultStatus = false): array
    {
        $data = [];

        $this->copyIfPresent($data, $validated, 'cif_key');
        if (array_key_exists('client_name', $validated) || array_key_exists('fullname', $validated)) {
            $this->copyToFirstExistingColumn(
                $data,
                ['client_name', 'fullname'],
                $validated['client_name'] ?? $validated['fullname'] ?? null
            );
        }
        $this->copyIfPresent($data, $validated, 'membership_date');
        if (array_key_exists('membership_type', $validated) || array_key_exists('member_type', $validated)) {
            $membershipType = $validated['membership_type'] ?? $validated['member_type'] ?? null;

            if (!$membershipType) {
                $membershipType = 'Regular Member';
            }

            $this->copyToFirstExistingColumn(
                $data,
                ['membership_type', 'member_type'],
                $membershipType
            );
        }
        $this->copyIfPresent($data, $validated, 'sex');
        $birthdate = null;

        if (array_key_exists('birthdate', $validated) || array_key_exists('birth_date', $validated)) {
            $birthdate = $validated['birthdate'] ?? $validated['birth_date'] ?? null;
            $this->copyToFirstExistingColumn(
                $data,
                ['birthdate', 'birth_date'],
                $birthdate
            );
        }
        if ($this->hasMemberColumn('age')) {
            $computedAge = $this->calculateAge($birthdate);

            if (!is_null($computedAge)) {
                $data['age'] = $computedAge;
            } elseif (array_key_exists('age', $validated)) {
                $data['age'] = $validated['age'];
            }
        }
        if (array_key_exists('contactnumber', $validated) || array_key_exists('contact', $validated)) {
            $this->copyToFirstExistingColumn(
                $data,
                ['contactnumber', 'contact'],
                $validated['contactnumber'] ?? $validated['contact'] ?? null
            );
        }
        $this->copyIfPresent($data, $validated, 'address');
        $this->copyIfPresent($data, $validated, 'share_capital');
        $this->copyIfPresent($data, $validated, 'date_of_retirement');
        if (
            $this->hasMemberColumn('branch_id') &&
            (
                array_key_exists('branch_id', $validated) ||
                array_key_exists('branchid', $validated) ||
                array_key_exists('branch', $validated) ||
                array_key_exists('branch_code', $validated) ||
                array_key_exists('branch_name', $validated)
            )
        ) {
            $data['branch_id'] = $this->resolveBranchId(
                $validated['branch_id'] ??
                $validated['branchid'] ??
                $validated['branch'] ??
                $validated['branch_code'] ??
                $validated['branch_name'] ??
                null
            );
        }
        if ($this->hasMemberColumn('status') && (array_key_exists('status', $validated) || $defaultStatus)) {
            $data['status'] = $this->normalizeMemberStatus($validated['status'] ?? null);
        }
        if (array_key_exists('tin_number', $validated) || array_key_exists('tin', $validated)) {
            $this->copyToFirstExistingColumn(
                $data,
                ['tin_number', 'tin'],
                $validated['tin_number'] ?? $validated['tin'] ?? null
            );
        }
        $this->copyIfPresent($data, $validated, 'occupation');
        $this->copyIfPresent($data, $validated, 'educational_attainment');

        return $data;
    }

    private function resolveBranchId(mixed $value): ?int
    {
        $branchValue = trim((string) ($value ?? ''));

        if ($branchValue === '') {
            return null;
        }

        $branch = Branch::where('branch_code', $branchValue)->first()
            ?? Branch::where('branch_name', $branchValue)->first();

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

    private function normalizeMemberStatus(mixed $value): string
    {
        $status = strtoupper(trim((string) ($value ?? '')));

        if ($status === '') {
            return 'ACTIVE';
        }

        if ($status === 'A') {
            return 'ACTIVE';
        }

        if ($status === 'I') {
            return 'INACTIVE';
        }

        if (!in_array($status, ['ACTIVE', 'INACTIVE'], true)) {
            throw ValidationException::withMessages([
                'status' => 'Status must be ACTIVE or INACTIVE.',
            ]);
        }

        return $status;
    }

    private function calculateAge(?string $birthdate): ?int
    {
        if (!$birthdate) {
            return null;
        }

        try {
            $birth = new \DateTimeImmutable($birthdate);
            $today = new \DateTimeImmutable('today');

            if ($birth > $today) {
                return null;
            }

            return $birth->diff($today)->y;
        } catch (\Exception) {
            return null;
        }
    }

    private function copyIfPresent(array &$data, array $source, string $key): void
    {
        if (array_key_exists($key, $source) && $this->hasMemberColumn($key)) {
            $data[$key] = $source[$key];
        }
    }

    private function copyToFirstExistingColumn(array &$data, array $columns, mixed $value): void
    {
        $column = $this->firstExistingMemberColumn($columns);

        if ($column) {
            $data[$column] = $value;
        }
    }

    private function memberNameColumn(): string
    {
        return $this->firstExistingMemberColumn(['client_name', 'fullname', 'cif_key', 'id']) ?? 'id';
    }

    private function existingMemberColumns(array $columns): array
    {
        return array_values(array_filter(
            $columns,
            fn (string $column) => $this->hasMemberColumn($column)
        ));
    }

    private function firstExistingMemberColumn(array $columns): ?string
    {
        foreach ($columns as $column) {
            if ($this->hasMemberColumn($column)) {
                return $column;
            }
        }

        return null;
    }

    private function hasMemberColumn(string $column): bool
    {
        static $columns = null;

        if ($columns === null) {
            $columns = Schema::getColumnListing('members');
        }

        return in_array($column, $columns, true);
    }
}
