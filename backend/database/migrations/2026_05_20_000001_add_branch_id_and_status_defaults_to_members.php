<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\QueryException;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('members', 'branch_id')) {
            Schema::table('members', function (Blueprint $table) {
                $table->unsignedBigInteger('branch_id')->nullable()->after('address')->index();
            });

            try {
                DB::statement(
                    'ALTER TABLE members ADD CONSTRAINT members_branch_id_foreign FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL'
                );
            } catch (QueryException) {
                // Some restored databases already carry an equivalent constraint.
            }
        }

        if (Schema::hasColumn('members', 'status')) {
            DB::table('members')
                ->whereIn('status', ['A', 'Active', 'active'])
                ->update(['status' => 'ACTIVE']);

            DB::table('members')
                ->whereIn('status', ['I', 'Inactive', 'inactive'])
                ->update(['status' => 'INACTIVE']);

            try {
                DB::statement("ALTER TABLE members MODIFY status VARCHAR(255) NULL DEFAULT 'ACTIVE'");
            } catch (QueryException) {
                // Keep the data normalization even if the database driver rejects MODIFY.
            }
        }
    }

    public function down(): void
    {
        // Intentionally left non-destructive: branch_id may be used by saved members.
    }
};
