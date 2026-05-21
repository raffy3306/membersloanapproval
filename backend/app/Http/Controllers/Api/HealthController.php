<?php

namespace App\Http\Controllers\Api;

use App\Models\Branch;
use App\Models\User;
use App\Models\LoanType;
use App\Models\Setting;
use Illuminate\Http\Request;

class HealthController extends BaseController
{
    public function check()
    {
        return $this->success([
            'appName' => "Member's Loan Approval",
            'version' => '2.0.0',
            'serverTime' => now()->toIso8601String(),
            'database' => config('database.default'),
            'databaseConfigured' => true,
            'usersTableConfigured' => User::count() > 0,
            'membersTableConfigured' => true,
            'loanTypesTableConfigured' => LoanType::count() > 0,
            'requestsTableConfigured' => true,
            'otherLoansTableConfigured' => true,
            'comakersTableConfigured' => true,
            'securitiesTableConfigured' => true,
            'attachmentsTableConfigured' => true,
            'branchesTableConfigured' => Branch::count() > 0,
            'settingsTableConfigured' => true,
        ]);
    }
}
