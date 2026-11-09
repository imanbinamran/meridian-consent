<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * The language the cookie notice was in when the visitor accepted. Every row
 * from before this migration was accepted in English, the only language the
 * site had, so 'en' is the true value for them and not a guess.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('consents', function (Blueprint $table) {
            $table->string('locale', 8)->default('en');
        });
    }

    public function down(): void
    {
        Schema::table('consents', function (Blueprint $table) {
            $table->dropColumn('locale');
        });
    }
};
