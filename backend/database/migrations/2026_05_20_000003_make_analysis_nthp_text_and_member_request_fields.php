<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('loan_requests', 'analysis_nthp')) {
            DB::statement('ALTER TABLE loan_requests MODIFY analysis_nthp TEXT NULL');
        }

        if (!Schema::hasColumn('members', 'share_capital')) {
            DB::statement('ALTER TABLE members ADD share_capital DECIMAL(15, 2) NULL AFTER membership_date');
        }

        if (!Schema::hasColumn('members', 'date_of_retirement')) {
            DB::statement('ALTER TABLE members ADD date_of_retirement DATE NULL AFTER share_capital');
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('loan_requests', 'analysis_nthp')) {
            DB::statement('ALTER TABLE loan_requests MODIFY analysis_nthp DECIMAL(12, 2) NOT NULL DEFAULT 0');
        }
    }
};
