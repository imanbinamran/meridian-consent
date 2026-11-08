<?php

use App\Models\Consent;
use App\Models\User;

beforeEach(function () {
    $this->travelTo('2026-11-08 04:00:00');
    $this->actingAs(User::factory()->create());
});

/**
 * @return list<string>
 */
function csvLines(string $content): array
{
    return array_values(array_filter(explode("\n", $content)));
}

test('it downloads every consent as csv', function () {
    Consent::factory()->create([
        'guid' => '3f2a9c10-1111-4abc-8def-000000000001',
        'version' => 1,
        'accepted_at' => '2026-11-07 09:30:00',
    ]);
    Consent::factory()->create(['accepted_at' => '2026-11-06 09:30:00']);

    $response = $this->get(route('admin.consents.export'));

    $response->assertOk()
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8')
        ->assertDownload('consents-2026-11-08.csv');

    $lines = csvLines($response->streamedContent());

    expect($lines)->toHaveCount(3)
        ->and($lines[0])->toBe('guid,version,accepted_at_utc')
        ->and($lines[1])->toBe('3f2a9c10-1111-4abc-8def-000000000001,1,2026-11-07T09:30:00Z');
});

test('the export only includes rows that match the filters', function () {
    $keep = Consent::factory()->create(['version' => 2, 'accepted_at' => '2026-11-02 02:00:00']);
    Consent::factory()->create(['version' => 1, 'accepted_at' => '2026-11-02 02:00:00']);
    Consent::factory()->create(['version' => 2, 'accepted_at' => '2026-10-01 02:00:00']);

    $response = $this->get(route('admin.consents.export', [
        'version' => 2,
        'from' => '2026-11-01',
        'to' => '2026-11-08',
    ]));

    $lines = csvLines($response->streamedContent());

    expect($lines)->toBe([
        'guid,version,accepted_at_utc',
        "{$keep->guid},2,2026-11-02T02:00:00Z",
    ]);
});

test('the export follows the search and sort order', function () {
    $a = Consent::factory()->create(['guid' => 'aaaa0000-0000-4000-8000-000000000001', 'accepted_at' => '2026-11-01 00:00:00']);
    $b = Consent::factory()->create(['guid' => 'aaaa0000-0000-4000-8000-000000000002', 'accepted_at' => '2026-11-02 00:00:00']);
    Consent::factory()->create(['guid' => 'bbbb0000-0000-4000-8000-000000000003']);

    $lines = csvLines($this->get(route('admin.consents.export', ['search' => 'aaaa', 'direction' => 'asc']))->streamedContent());

    expect(array_slice($lines, 1))->toBe([
        "{$a->guid},1,2026-11-01T00:00:00Z",
        "{$b->guid},1,2026-11-02T00:00:00Z",
    ]);
});

test('an export with bad filters goes back to the list with errors', function () {
    $this->get(route('admin.consents.export', ['version' => 'abc']))
        ->assertRedirect(route('admin.consents.index'))
        ->assertSessionHasErrors('version');
});
