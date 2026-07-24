<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            if (!Schema::hasColumn('members', 'fullname')) {
                $table->string('fullname')->nullable();
            }

            if (!Schema::hasColumn('members', 'member_type')) {
                $table->string('member_type')->default('Regular Member');
            }

            if (!Schema::hasColumn('members', 'birth_date')) {
                $table->date('birth_date')->nullable();
            }

            if (!Schema::hasColumn('members', 'contact')) {
                $table->string('contact')->nullable();
            }

            if (!Schema::hasColumn('members', 'location')) {
                $table->string('location')->nullable();
            }

            if (!Schema::hasColumn('members', 'tin')) {
                $table->string('tin')->nullable();
            }

            if (!Schema::hasColumn('members', 'monthly_income')) {
                $table->decimal('monthly_income', 12, 2)->default(0);
            }

            if (!Schema::hasColumn('members', 'income_source_id')) {
                $table->integer('income_source_id')->nullable();
            }

            if (!Schema::hasColumn('members', 'share_capital')) {
                $table->decimal('share_capital', 15, 2)->nullable();
            }

            if (!Schema::hasColumn('members', 'date_of_retirement')) {
                $table->date('date_of_retirement')->nullable();
            }
        });

        if (!Schema::hasColumn('users', 'status')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('status')->default('ACTIVE')->after('first_login');
            });
        }

        DB::table('users')
            ->whereNull('status')
            ->orWhere('status', '')
            ->update(['status' => 'ACTIVE']);

        if (Schema::hasColumn('members', 'status')) {
            DB::table('members')
                ->whereIn('status', ['A', 'Active', 'active'])
                ->update(['status' => 'ACTIVE']);

            DB::table('members')
                ->whereIn('status', ['I', 'Inactive', 'inactive'])
                ->update(['status' => 'INACTIVE']);
        }
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $columns = [
                'fullname',
                'member_type',
                'birth_date',
                'contact',
                'location',
                'tin',
                'monthly_income',
                'income_source_id',
                'share_capital',
                'date_of_retirement',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('members', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        if (Schema::hasColumn('users', 'status')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('status');
            });
        }
    }
};
