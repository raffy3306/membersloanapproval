<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loan_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_id')->unique();
            $table->timestamp('request_date');
            $table->unsignedBigInteger('member_id');
            $table->unsignedBigInteger('loan_type_id');
            $table->unsignedBigInteger('branch_id');
            $table->decimal('amount_applied', 15, 2);
            $table->decimal('loan_balance', 15, 2)->default(0);
            $table->string('employer')->nullable();
            $table->string('position')->nullable();
            $table->string('employers_address')->nullable();
            $table->decimal('monthly_pension', 12, 2)->default(0);
            $table->decimal('current_nthp', 12, 2)->default(0);
            $table->decimal('analysis_nthp', 12, 2)->default(0);
            $table->enum('status', ['Pending', 'Forwarded', 'Returned', 'Returned to Manager', 'Approved', 'Disapproved', 'Rejected'])->default('Pending');
            $table->unsignedBigInteger('requested_by'); // User ID
            $table->text('manager_notes')->nullable();
            $table->text('approver_notes')->nullable();
            $table->unsignedBigInteger('manager_id')->nullable(); // User ID of manager
            $table->text('review_and_recommendations')->nullable();
            $table->timestamp('date_of_approval')->nullable();
            $table->decimal('loan_amount_approved', 15, 2)->nullable();
            $table->text('additional_requirements')->nullable();
            $table->text('appraisal_result')->nullable();
            $table->text('recommendation')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');
            $table->foreign('loan_type_id')->references('id')->on('loan_types')->onDelete('restrict');
            $table->foreign('branch_id')->references('id')->on('branches')->onDelete('restrict');
            $table->foreign('requested_by')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('manager_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_requests');
    }
};
