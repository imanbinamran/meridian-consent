<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/*
 * consent_events is the audit trail: one line each time a consent is given or
 * withdrawn. It holds the GUID, what happened, the notice version and when
 * (UTC), and nothing else. Every consent that already exists gets its
 * accepted line here.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Each step checks first, so a run that failed part way can be re-run.
        if (! Schema::hasColumn('consents', 'withdrawn_at')) {
            Schema::table('consents', function (Blueprint $table) {
                $table->timestamp('withdrawn_at')->nullable();
            });
        }

        if (! Schema::hasTable('consent_events')) {
            Schema::create('consent_events', function (Blueprint $table) {
                $table->id();
                $table->uuid('guid')->index();
                $table->string('type', 16);
                $table->unsignedSmallInteger('version');
                $table->timestamp('occurred_at');
            });
        }

        DB::statement(
            "insert into consent_events (guid, type, version, occurred_at)
             select guid, 'accepted', version, accepted_at from consents
             where not exists (
                 select 1 from consent_events
                 where consent_events.guid = consents.guid and consent_events.type = 'accepted'
             )
             order by id",
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('consent_events');

        Schema::table('consents', function (Blueprint $table) {
            $table->dropColumn('withdrawn_at');
        });
    }
};
