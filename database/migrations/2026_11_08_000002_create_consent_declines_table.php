<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Declines are counted, never identified: no GUID, IP or user agent.
 * The brief only asks for a cookie on decline; this anonymous count
 * exists so the admin can see the accept rate.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consent_declines', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('version');
            $table->timestamp('declined_at')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consent_declines');
    }
};
