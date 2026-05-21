<?php

namespace App\Http\Controllers\Api;

use App\Models\Attachment;
use App\Models\LoanRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AttachmentController extends BaseController
{
    private const TYPES = [
        'Payslip',
        'Certifications',
        'Title with Annotation',
        'Original Receipts/Certificate of Registration (OR/CR)',
        'H.O. signed Collateral Appraisals',
        'Real Estate Mortgage (REM)',
        'Chattel Mortgage (CM)',
        'Registry of Deeds (ROD) O.R.',
    ];

    public function store(Request $request, string $id)
    {
        $loanRequest = $this->findLoanRequest($id);

        if (!$loanRequest) {
            return $this->error('Loan request not found', 404);
        }

        $validated = $request->validate([
            'attachments' => ['required', 'array', 'min:1'],
            'attachments.*' => ['required', 'file', 'max:20480'],
            'attachment_types' => ['required', 'array', 'min:1'],
            'attachment_types.*' => ['required', Rule::in(self::TYPES)],
        ]);

        if (count($validated['attachments']) !== count($validated['attachment_types'])) {
            return $this->error('Each attachment must have an attachment type.', 422);
        }

        $created = [];
        $user = auth('api')->user();

        foreach ($validated['attachments'] as $index => $file) {
            $storedFilename = (string) Str::uuid() . '.' . $file->getClientOriginalExtension();
            $directory = 'loan-attachments/' . $loanRequest->id;
            $path = $file->storeAs($directory, $storedFilename, 'local');

            $created[] = Attachment::create([
                'loan_request_id' => $loanRequest->id,
                'attachment_type' => $validated['attachment_types'][$index],
                'original_filename' => $file->getClientOriginalName(),
                'stored_filename' => $storedFilename,
                'path' => $path,
                'mime_type' => $file->getClientMimeType(),
                'size' => $file->getSize() ?: 0,
                'uploaded_by' => $user?->id,
            ]);
        }

        return $this->success([
            'attachments' => $created,
        ], 'Attachments uploaded successfully', 201);
    }

    public function update(Request $request, Attachment $attachment)
    {
        $validated = $request->validate([
            'attachment_type' => ['required', Rule::in(self::TYPES)],
        ]);

        $attachment->update($validated);

        return $this->success($attachment->fresh(), 'Attachment updated successfully');
    }

    public function destroy(Attachment $attachment)
    {
        if ($attachment->path && Storage::disk('local')->exists($attachment->path)) {
            Storage::disk('local')->delete($attachment->path);
        }

        $attachment->delete();

        return $this->success([], 'Attachment deleted successfully');
    }

    public function preview(Attachment $attachment)
    {
        if (!$attachment->path || !Storage::disk('local')->exists($attachment->path)) {
            return $this->error('Attachment file not found', 404);
        }

        $filename = str_replace('"', '', $attachment->original_filename);

        return response()->file(Storage::disk('local')->path($attachment->path), [
            'Content-Type' => $attachment->mime_type ?: 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
            'Cache-Control' => 'private, max-age=0, no-cache',
        ]);
    }

    private function findLoanRequest(string $id): ?LoanRequest
    {
        return LoanRequest::where('id', $id)
            ->orWhere('request_id', $id)
            ->first();
    }
}
