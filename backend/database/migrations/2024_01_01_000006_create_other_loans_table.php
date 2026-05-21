<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('other_loans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('loan_request_id');
            $table->unsignedBigInteger('member_id');
            $table->string('loan_type');
            $table->decimal('loan_amount', 15, 2);
            $table->decimal('balance', 15, 2);
            $table->string('status');
            $table->text('analysis')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('loan_request_id')->references('id')->on('loan_requests')->onDelete('cascade');
            $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('other_loans');
    }
};
