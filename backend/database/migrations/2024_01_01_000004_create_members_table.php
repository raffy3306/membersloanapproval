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
            $table->string('fullname');
            $table->date('membership_date')->nullable();
            $table->string('member_type')->default('Regular Member');
            $table->enum('sex', ['M', 'F', 'Other'])->nullable();
            $table->integer('age')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('contact')->nullable();
            $table->string('address')->nullable();
            $table->unsignedBigInteger('branch_id')->nullable()->index();
            $table->string('location')->nullable();
            $table->string('status')->default('ACTIVE');
            $table->string('tin')->nullable();
            $table->decimal('monthly_income', 12, 2)->default(0);
            $table->integer('income_source_id')->nullable();
            $table->string('occupation')->nullable();
            $table->string('educational_attainment')->nullable();
            $table->decimal('share_capital', 15, 2)->nullable();
            $table->date('date_of_retirement')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
