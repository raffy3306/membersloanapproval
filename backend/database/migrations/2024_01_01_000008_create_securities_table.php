<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('securities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('loan_request_id');
            $table->string('nature');
            $table->decimal('market_value', 15, 2)->nullable();
            $table->decimal('appraised_value', 15, 2)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('loan_request_id')->references('id')->on('loan_requests')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('securities');
    }
};
