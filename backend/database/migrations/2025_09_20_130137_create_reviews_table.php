<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('card_id')->constrained()->cascadeOnDelete();
            
            /* need for sm-2 algorithm computation */
            $table->integer('repetitions')->default(0);
            $table->float('ease_factor', 8, 2)->default(2.5);
            $table->integer('interval')->default(1);
            /* need for sm-2 algorithm computation */
            
            $table->dateTime('next_review_date')->nullable();
            $table->dateTime('last_reviewed_at')->nullable();
            $table->integer('last_review_quality')->nullable(); // 1-5 (1 is easiest, 5 is hardest)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
