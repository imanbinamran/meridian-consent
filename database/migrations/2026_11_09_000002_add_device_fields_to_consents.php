<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Coarse device details, set once when a visitor first accepts. Rows from
 * before this migration stay null. The raw user agent is never stored.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('consents', function (Blueprint $table) {
            $table->string('device_type', 16)->nullable();
            $table->string('browser_family', 16)->nullable();
            $table->string('os_family', 16)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('consents', function (Blueprint $table) {
            $table->dropColumn(['device_type', 'browser_family', 'os_family']);
        });
    }
};
