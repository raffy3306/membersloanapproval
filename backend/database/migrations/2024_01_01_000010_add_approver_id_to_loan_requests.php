<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('loan_requests', 'approver_id')) {
            Schema::table('loan_requests', function (Blueprint $table) {
                $table->unsignedBigInteger('approver_id')->nullable()->after('manager_id');
                $table->foreign('approver_id')->references('id')->on('users')->onDelete('set null');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('loan_requests', 'approver_id')) {
            try {
                Schema::table('loan_requests', function (Blueprint $table) {
                    $table->dropForeign(['approver_id']);
                });
            } catch (\Throwable $exception) {
                // Older manual installs may have the column without the foreign key.
            }

            Schema::table('loan_requests', function (Blueprint $table) {
                $table->dropColumn('approver_id');
            });
        }
    }
};
