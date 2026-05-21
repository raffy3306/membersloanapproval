<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LoanType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'loan_type_name',
        'description',
        'minimum_amount',
        'maximum_amount',
        'maximum_term_months',
        'interest_rate',
        'is_active',
    ];

    protected $casts = [
        'minimum_amount' => 'decimal:2',
        'maximum_amount' => 'decimal:2',
        'interest_rate' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function loanRequests()
    {
        return $this->hasMany(LoanRequest::class);
    }
}
