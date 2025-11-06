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
        Schema::create('requirements', function (Blueprint $table) {
            $table->id();

            $table->string('name');

            $table->unsignedBigInteger('course_id');
            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');

            // melyik héttől kezdve
            $table->date('begin');
            // pl. hany zh
            $table->unsignedInteger('repeat_count')->nullable();
            // pl. ha 2 akkor 2 hetente van zh
            // controller szinten check hogy csak akkor lehet nem null ha repeat_count se null
            $table->unsignedInteger('repeat_skip')->nullable();

            $table->decimal('total_score_weight');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requirements');
    }
};
