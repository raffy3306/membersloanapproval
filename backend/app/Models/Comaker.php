<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comaker extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'loan_request_id',
        'member_id',
        'comaker_fullname',
        'loan_type',
        'loan_amount',
        'loan_balance',
        'status',
    ];

    protected $casts = [
        'loan_amount' => 'decimal:2',
        'loan_balance' => 'decimal:2',
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
