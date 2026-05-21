<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\LoanType;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $mainBranch = Branch::updateOrCreate(
            ['branch_code' => 'MAIN'],
            [
                'branch_name' => 'Main Branch',
                'address' => 'Main Office',
                'phone' => null,
            ]
        );

        foreach ([
            ['branch_code' => 'BR001', 'branch_name' => 'Branch 001'],
            ['branch_code' => 'BR002', 'branch_name' => 'Branch 002'],
        ] as $branch) {
            Branch::updateOrCreate(
                ['branch_code' => $branch['branch_code']],
                ['branch_name' => $branch['branch_name']]
            );
        }

        foreach ([
            [
                'loan_type_name' => 'Regular Loan',
                'description' => 'Standard member loan',
                'minimum_amount' => 1000,
                'maximum_amount' => 100000,
                'maximum_term_months' => 24,
                'interest_rate' => 12,
            ],
            [
                'loan_type_name' => 'Emergency Loan',
                'description' => 'Short-term emergency assistance',
                'minimum_amount' => 1000,
                'maximum_amount' => 50000,
                'maximum_term_months' => 12,
                'interest_rate' => 10,
            ],
            [
                'loan_type_name' => 'Salary Loan',
                'description' => 'Loan secured against salary or pension',
                'minimum_amount' => 5000,
                'maximum_amount' => 200000,
                'maximum_term_months' => 36,
                'interest_rate' => 12,
            ],
        ] as $loanType) {
            LoanType::updateOrCreate(
                ['loan_type_name' => $loanType['loan_type_name']],
                $loanType + ['is_active' => true]
            );
        }

        foreach ([
            ['email' => 'admin@example.com', 'role' => 'admin', 'fullname' => 'System Administrator', 'position' => 'Administrator'],
            ['email' => 'teller@example.com', 'role' => 'teller', 'fullname' => 'Sample Teller', 'position' => 'Teller'],
            ['email' => 'manager@example.com', 'role' => 'manager', 'fullname' => 'Sample Manager', 'position' => 'Manager'],
            ['email' => 'approver@example.com', 'role' => 'approver', 'fullname' => 'Sample Approver', 'position' => 'Approver'],
        ] as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                $user + [
                    'password' => Hash::make('password123'),
                    'branch_id' => $mainBranch->id,
                    'first_login' => true,
                    'status' => 'ACTIVE',
                ]
            );
        }

        foreach ([
            'approval_threshold' => '100000',
            'default_currency' => 'PHP',
            'system_name' => 'Members Loan Approval',
        ] as $key => $value) {
            Setting::set($key, $value);
        }
    }
}
