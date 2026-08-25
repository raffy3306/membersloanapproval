<?php

namespace App\Http\Controllers\Api;

use App\Models\Attachment;
use App\Models\LoanRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;

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

        if (!$this->canManageAttachments($request->user(), $loanRequest)) {
            return $this->error('You do not have permission to modify attachments for this loan request.', 403);
        }

        $validated = $request->validate([
            'attachments' => ['required', 'array', 'min:1', 'max:10'],
            'attachments.*' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:20480'],
            'attachment_types' => ['required', 'array', 'min:1'],
            'attachment_types.*' => ['required', Rule::in(self::TYPES)],
        ]);

        if (count($validated['attachments']) !== count($validated['attachment_types'])) {
            return $this->error('Each attachment must have an attachment type.', 422);
        }

        $created = [];
        $user = auth('api')->user();
        $diskName = (string) config('filesystems.attachment_disk', 'local');
        $disk = Storage::disk($diskName);

        foreach ($validated['attachments'] as $index => $file) {
            $storedFilename = (string) Str::uuid() . '.' . $file->getClientOriginalExtension();
            $directory = 'loan-attachments/' . $loanRequest->id;
            $path = $disk->putFileAs($directory, $file, $storedFilename);

            if (!$path) {
                return $this->error('An attachment could not be stored. Please try again.', 500);
            }

            $created[] = Attachment::create([
                'loan_request_id' => $loanRequest->id,
                'attachment_type' => $validated['attachment_types'][$index],
                'original_filename' => $file->getClientOriginalName(),
                'stored_filename' => $storedFilename,
                'path' => $path,
                'disk' => $diskName,
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
        if (!$this->canManageAttachments($request->user(), $attachment->loanRequest)) {
            return $this->error('You do not have permission to modify this attachment.', 403);
        }

        $validated = $request->validate([
            'attachment_type' => ['required', Rule::in(self::TYPES)],
        ]);

        $attachment->update($validated);

        return $this->success($attachment->fresh(), 'Attachment updated successfully');
    }

    public function destroy(Request $request, Attachment $attachment)
    {
        if (!$this->canManageAttachments($request->user(), $attachment->loanRequest)) {
            return $this->error('You do not have permission to delete this attachment.', 403);
        }

        $disk = Storage::disk($attachment->disk ?: 'local');

        if ($attachment->path && $disk->exists($attachment->path)) {
            $disk->delete($attachment->path);
        }

        $attachment->delete();

        return $this->success([], 'Attachment deleted successfully');
    }

    public function preview(Request $request, Attachment $attachment)
    {
        if (!$this->canAccessLoanRequest($request->user(), $attachment->loanRequest)) {
            return $this->error('You do not have permission to view this attachment.', 403);
        }

        $disk = Storage::disk($attachment->disk ?: 'local');

        if (!$attachment->path || !$disk->exists($attachment->path)) {
            return $this->error('Attachment file not found', 404);
        }

        $stream = $disk->readStream($attachment->path);

        if ($stream === false) {
            return $this->error('Attachment file could not be opened', 500);
        }

        $filename = str_replace(["\r", "\n", '"'], '', $attachment->original_filename);
        $disposition = (new ResponseHeaderBag())->makeDisposition(
            ResponseHeaderBag::DISPOSITION_INLINE,
            $filename,
            'attachment'
        );

        return response()->stream(function () use ($stream): void {
            fpassthru($stream);
            fclose($stream);
        }, 200, [
            'Content-Type' => $attachment->mime_type ?: 'application/octet-stream',
            'Content-Disposition' => $disposition,
            'Content-Length' => (string) $attachment->size,
            'Cache-Control' => 'private, max-age=0, no-cache',
        ]);
    }

    private function findLoanRequest(string $id): ?LoanRequest
    {
        return LoanRequest::where('id', $id)
            ->orWhere('request_id', $id)
            ->first();
    }

    private function canAccessLoanRequest($user, ?LoanRequest $loanRequest): bool
    {
        if (!$user || !$loanRequest) {
            return false;
        }

        $role = strtolower(trim((string) $user->role));
        $role = $role === 'branch_manager' ? 'manager' : $role;

        return match ($role) {
            'admin', 'approver' => true,
            'manager' => !is_null($user->branch_id)
                && (int) $loanRequest->branch_id === (int) $user->branch_id,
            default => (int) $loanRequest->requested_by === (int) $user->id,
        };
    }

    private function canManageAttachments($user, ?LoanRequest $loanRequest): bool
    {
        if (!$user || !$loanRequest) {
            return false;
        }

        $role = strtolower(trim((string) $user->role));

        if ($role === 'admin') {
            return true;
        }

        return $role === 'teller'
            && (int) $loanRequest->requested_by === (int) $user->id
            && in_array($loanRequest->status, ['Pending', 'Returned'], true);
    }
}
