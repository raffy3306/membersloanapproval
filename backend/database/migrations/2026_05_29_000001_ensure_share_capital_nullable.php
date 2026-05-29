<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ensure share_capital and date_of_retirement allow NULL values
        if (Schema::hasColumn('members', 'share_capital')) {
            DB::statement('ALTER TABLE members MODIFY share_capital DECIMAL(15, 2) NULL');
        }

        if (Schema::hasColumn('members', 'date_of_retirement')) {
            DB::statement('ALTER TABLE members MODIFY date_of_retirement DATE NULL');
        }
    }

    public function down(): void
    {
        // Intentionally left empty for safety
    }
};
