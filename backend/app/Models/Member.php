<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Member extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'cif_key',
        'client_name',
        'fullname',
        'membership_date',
        'membership_type',
        'member_type',
        'sex',
        'age',
        'birthdate',
        'birth_date',
        'contactnumber',
        'contact',
        'address',
        'location',
        'branch_id',
        'status',
        'tin_number',
        'tin',
        'monthly_income',
        'occupation',
        'educational_attainment',
        'share_capital',
        'date_of_retirement',
    ];

    protected $casts = [
        'birthdate' => 'date',
        'birth_date' => 'date',
        'membership_date' => 'date',
        'date_of_retirement' => 'date',
        'share_capital' => 'decimal:2',
    ];

    public function loanRequests()
    {
        return $this->hasMany(LoanRequest::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function otherLoans()
    {
        return $this->hasMany(OtherLoan::class);
    }

    public function comakers()
    {
        return $this->hasMany(Comaker::class);
    }
}
