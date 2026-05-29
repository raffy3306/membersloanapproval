<?php

namespace App\Http\Controllers\Api;

use App\Models\Branch;
use Illuminate\Http\Request;

class BranchController extends BaseController
{
    /**
     * Get all branches
     */
    public function index(Request $request)
    {
        try {
            $query = Branch::select('id', 'branch_code', 'branch_name', 'address', 'phone')
                ->orderBy('branch_code');

            if (!$request->has('page') && !$request->has('per_page')) {
                return $this->success([
                    'branches' => $query->get(),
                ]);
            }

            $page = max(1, (int)$request->query('page', 1));
            $perPage = min(max(1, (int)$request->query('per_page', 15)), 100);
            $paginated = $query->paginate($perPage, ['*'], 'page', $page);

            return $this->success([
                'branches' => $paginated->items(),
                'pagination' => [
                    'page' => $paginated->currentPage(),
                    'per_page' => $paginated->perPage(),
                    'total' => $paginated->total(),
                    'last_page' => $paginated->lastPage(),
                    'has_more' => $paginated->hasMorePages(),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to fetch branches: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get a specific branch
     */
    public function show($id)
    {
        try {
            $branch = Branch::findOrFail($id);

            return $this->success($branch);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Branch not found', 404);
        } catch (\Exception $e) {
            return $this->error('Failed to fetch branch: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create a new branch
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'branch_code' => 'required|string|max:50|unique:branches,branch_code',
                'branch_name' => 'required|string|max:255',
                'address' => 'nullable|string|max:500',
                'phone' => 'nullable|string|max:20',
            ]);

            $branch = Branch::create($validated);

            return $this->success($branch, 'Branch created successfully', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error('Validation error: ' . json_encode($e->errors()), 422);
        } catch (\Exception $e) {
            return $this->error('Failed to create branch: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update a branch
     */
    public function update(Request $request, $id)
    {
        try {
            $branch = Branch::findOrFail($id);

            $validated = $request->validate([
                'branch_code' => 'required|string|max:50|unique:branches,branch_code,' . $id,
                'branch_name' => 'required|string|max:255',
                'address' => 'nullable|string|max:500',
                'phone' => 'nullable|string|max:20',
            ]);

            $branch->update($validated);

            return $this->success($branch, 'Branch updated successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Branch not found', 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error('Validation error: ' . json_encode($e->errors()), 422);
        } catch (\Exception $e) {
            return $this->error('Failed to update branch: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete a branch
     */
    public function destroy($id)
    {
        try {
            $branch = Branch::findOrFail($id);

            $branch->delete();

            return $this->success(null, 'Branch deleted successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Branch not found', 404);
        } catch (\Exception $e) {
            return $this->error('Failed to delete branch: ' . $e->getMessage(), 500);
        }
    }
}
