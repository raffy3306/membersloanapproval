<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LoanRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'request_id',
        'request_date',
        'member_id',
        'loan_type_id',
        'branch_id',
        'amount_applied',
        'loan_balance',
        'employer',
        'position',
        'employers_address',
        'monthly_pension',
        'current_nthp',
        'analysis_nthp',
        'status',
        'requested_by',
        'manager_notes',
        'approver_notes',
        'manager_id',
        'approver_id',
        'review_and_recommendations',
        'date_of_approval',
        'loan_amount_approved',
        'additional_requirements',
        'appraisal_result',
        'recommendation',
    ];

    protected $casts = [
        'request_date' => 'datetime',
        'date_of_approval' => 'datetime',
        'amount_applied' => 'decimal:2',
        'loan_balance' => 'decimal:2',
        'monthly_pension' => 'decimal:2',
        'current_nthp' => 'decimal:2',
        'loan_amount_approved' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (!$model->request_id) {
                $model->request_id = 'LR' . date('YmdHis') . random_int(1000, 9999);
            }
        });
    }

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function loanType()
    {
        return $this->belongsTo(LoanType::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function otherLoans()
    {
        return $this->hasMany(OtherLoan::class);
    }

    public function comakers()
    {
        return $this->hasMany(Comaker::class);
    }

    public function securities()
    {
        return $this->hasMany(Security::class);
    }

    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }
}
