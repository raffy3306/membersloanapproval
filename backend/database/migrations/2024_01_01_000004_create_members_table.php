<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->string('cif_key')->unique();
            $table->string('client_name');
            $table->date('membership_date')->nullable();
            $table->string('membership_type')->nullable();
            $table->enum('sex', ['M', 'F', 'Other'])->nullable();
            $table->integer('age')->nullable();
            $table->date('birthdate')->nullable();
            $table->string('contactnumber')->nullable();
            $table->string('address')->nullable();
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->string('status')->default('ACTIVE');
            $table->string('tin_number')->nullable();
            $table->string('occupation')->nullable();
            $table->string('educational_attainment')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Foreign key for branch
            $table->foreign('branch_id')->references('id')->on('branches')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
