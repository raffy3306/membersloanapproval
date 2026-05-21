<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Security extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'loan_request_id',
        'nature',
        'market_value',
        'appraised_value',
    ];

    protected $casts = [
        'market_value' => 'decimal:2',
        'appraised_value' => 'decimal:2',
    ];

    public function loanRequest()
    {
        return $this->belongsTo(LoanRequest::class);
    }
}
