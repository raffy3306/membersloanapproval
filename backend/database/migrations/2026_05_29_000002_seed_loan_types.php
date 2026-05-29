<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Seed loan types from CSV data
        $loanTypes = [
            [
                'id' => 1,
                'loan_type_name' => 'Personal Loan',
                'description' => 'Standard member loan',
                'minimum_amount' => 1000,
                'maximum_amount' => 100000,
                'maximum_term_months' => 60,
                'interest_rate' => 12,
                'is_active' => 1,
            ],
            [
                'id' => 2,
                'loan_type_name' => 'Emergency Loan',
                'description' => 'Short-term emergency assistance',
                'minimum_amount' => 1000,
                'maximum_amount' => 50000,
                'maximum_term_months' => 12,
                'interest_rate' => 10,
                'is_active' => 1,
            ],
            [
                'id' => 3,
                'loan_type_name' => 'Salary Loan',
                'description' => 'Loan secured against salary',
                'minimum_amount' => 5000,
                'maximum_amount' => 200000,
                'maximum_term_months' => 60,
                'interest_rate' => 12,
                'is_active' => 1,
            ],
            [
                'id' => 4,
                'loan_type_name' => 'Multi-Purpose Loan',
                'description' => 'Loan to finance varied purposes whether providential or productive.',
                'minimum_amount' => null,
                'maximum_amount' => null,
                'maximum_term_months' => 96,
                'interest_rate' => null,
                'is_active' => 1,
            ],
            [
                'id' => 5,
                'loan_type_name' => 'Bonus Loan',
                'description' => 'Loan provided to salaried and pensioner members during midyear and year-end.',
                'minimum_amount' => null,
                'maximum_amount' => null,
                'maximum_term_months' => 6,
                'interest_rate' => null,
                'is_active' => 1,
            ],
            [
                'id' => 6,
                'loan_type_name' => 'FAXCOM Loan',
                'description' => 'Fast Service and Excellent Coop Management - Loans for members who are classified as Diamond, Gold and Silver with co-makers of the same class or higher which can be released outright.',
                'minimum_amount' => null,
                'maximum_amount' => null,
                'maximum_term_months' => 48,
                'interest_rate' => null,
                'is_active' => 1,
            ],
            [
                'id' => 7,
                'loan_type_name' => 'Negosyo Loan',
                'description' => 'Loan for Business',
                'minimum_amount' => null,
                'maximum_amount' => null,
                'maximum_term_months' => 48,
                'interest_rate' => null,
                'is_active' => 1,
            ],
            [
                'id' => 8,
                'loan_type_name' => 'Pension Loan',
                'description' => 'Loan for Pensioners secured with Pension',
                'minimum_amount' => null,
                'maximum_amount' => null,
                'maximum_term_months' => 24,
                'interest_rate' => null,
                'is_active' => 1,
            ],
            [
                'id' => 9,
                'loan_type_name' => 'MEDAP Loan',
                'description' => 'Micro Enterprise Development Assistance Program',
                'minimum_amount' => null,
                'maximum_amount' => null,
                'maximum_term_months' => 24,
                'interest_rate' => null,
                'is_active' => 1,
            ],
            [
                'id' => 10,
                'loan_type_name' => 'Petty Cash Loan',
                'description' => 'For liquidity problem or urgent need',
                'minimum_amount' => null,
                'maximum_amount' => null,
                'maximum_term_months' => 6,
                'interest_rate' => null,
                'is_active' => 1,
            ],
            [
                'id' => 11,
                'loan_type_name' => 'Car Loan',
                'description' => null,
                'minimum_amount' => null,
                'maximum_amount' => null,
                'maximum_term_months' => 60,
                'interest_rate' => null,
                'is_active' => 1,
            ],
            [
                'id' => 12,
                'loan_type_name' => 'BACAP Loan',
                'description' => 'Barbaza Agricultural Credit Assistance Program - A loan to finance agricultural related livelihood projects with technical assistance.',
                'minimum_amount' => null,
                'maximum_amount' => null,
                'maximum_term_months' => 12,
                'interest_rate' => null,
                'is_active' => 1,
            ],
            [
                'id' => 13,
                'loan_type_name' => 'EEd Loan',
                'description' => 'Enhance Educational Loan - Loan provided to members in good standing to finance the educational needs',
                'minimum_amount' => null,
                'maximum_amount' => null,
                'maximum_term_months' => 12,
                'interest_rate' => null,
                'is_active' => 1,
            ],
        ];

        // Insert or update each loan type
        foreach ($loanTypes as $loanType) {
            DB::table('loan_types')->updateOrInsert(
                ['id' => $loanType['id']],
                array_merge($loanType, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Delete seeded loan types
        DB::table('loan_types')->whereIn('id', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])->delete();
    }
};
