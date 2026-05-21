<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OtherLoan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'loan_request_id',
        'member_id',
        'loan_type',
        'loan_amount',
        'balance',
        'status',
        'analysis',
    ];

    protected $casts = [
        'loan_amount' => 'decimal:2',
        'balance' => 'decimal:2',
    ];

    public function loanRequest()
    {
        return $this->belongsTo(LoanRequest::class);
    }

    public function member()
    {
        return $this->belongsTo(Member::class);
    }
}
