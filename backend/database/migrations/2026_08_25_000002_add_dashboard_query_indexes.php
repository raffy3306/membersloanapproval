<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('loan_requests', function (Blueprint $table) {
            $table->index(['deleted_at', 'request_date', 'id'], 'lr_scope_date_idx');
            $table->index(['status', 'deleted_at', 'request_date', 'id'], 'lr_status_date_idx');
            $table->index(['branch_id', 'deleted_at', 'request_date', 'id'], 'lr_branch_date_idx');
            $table->index(['branch_id', 'status', 'deleted_at', 'request_date', 'id'], 'lr_branch_status_date_idx');
            $table->index(['requested_by', 'deleted_at', 'request_date', 'id'], 'lr_requester_date_idx');
            $table->index(['requested_by', 'status', 'deleted_at', 'request_date', 'id'], 'lr_requester_status_date_idx');
        });

        Schema::table('members', function (Blueprint $table) {
            $table->index(['deleted_at', 'fullname'], 'members_scope_name_idx');
            $table->index(['branch_id', 'deleted_at', 'fullname'], 'members_branch_name_idx');
        });
    }

    public function down(): void
    {
        Schema::table('loan_requests', function (Blueprint $table) {
            $table->dropIndex('lr_scope_date_idx');
            $table->dropIndex('lr_status_date_idx');
            $table->dropIndex('lr_branch_date_idx');
            $table->dropIndex('lr_branch_status_date_idx');
            $table->dropIndex('lr_requester_date_idx');
            $table->dropIndex('lr_requester_status_date_idx');
        });

        Schema::table('members', function (Blueprint $table) {
            $table->dropIndex('members_scope_name_idx');
            $table->dropIndex('members_branch_name_idx');
        });
    }
};
