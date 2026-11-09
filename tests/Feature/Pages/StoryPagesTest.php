<?php

use App\Support\StoryLibrary;
use Inertia\Testing\AssertableInertia as Assert;

/*
| Pest cases from tests/cases/stories.yaml.
*/

function storyLibrary(): StoryLibrary
{
    return new StoryLibrary;
}

test('STR-001 every story opens with its own headline', function () {
    foreach (storyLibrary()->all() as $story) {
        $this->get(route('stories.show', $story['slug']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('site/story')
                ->where('story.title', $story['title']));
    }
});

test('STR-002 an unknown story address returns 404', function () {
    $this->get('/stories/not-a-real-story')->assertNotFound();
});

test('STR-003 read time is the word count at 220 a minute, rounded up', function () {
    $library = storyLibrary();

    foreach ($library->all() as $story) {
        $expected = (int) ceil($library->wordCount($story) / 220);

        expect($library->article($story['slug'])['minutes'])->toBe($expected);
    }
});

test('STR-003 the rounding boundary is exact', function (int $words, int $minutes) {
    $library = storyLibrary();
    $story = [
        ...$library->all()[0],
        'sections' => [[
            'name' => 'Only',
            'blocks' => [['type' => 'p', 'text' => trim(str_repeat('word ', $words))]],
        ]],
    ];

    expect((int) ceil($library->wordCount($story) / StoryLibrary::WORDS_PER_MINUTE))->toBe($minutes);
})->with([
    '220 words' => [220, 1],
    '221 words' => [221, 2],
]);

test('STR-003 a pull quote does not count towards read time', function () {
    $library = storyLibrary();
    $story = [
        ...$library->all()[0],
        'sections' => [[
            'name' => 'Only',
            'blocks' => [
                ['type' => 'p', 'text' => 'one two three'],
                ['type' => 'pullquote', 'text' => 'one two three'],
            ],
        ]],
    ];

    expect($library->wordCount($story))->toBe(3);
});

test('STR-004 the home page lists the edition and the long read', function () {
    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('site/home')
            ->has('edition', 4)
            ->where('edition.0.desk', 'Business')
            ->where('edition.1.desk', 'Nation')
            ->where('edition.2.desk', 'Food')
            ->where('edition.3.desk', 'Culture')
            ->where('longRead.title', 'Kampung to cloud: the quiet digitisation of rural Sabah'));
});

test('STR-004 each home page title is identical to its article title', function () {
    $library = storyLibrary();

    foreach ([...$library->edition(), $library->longRead()] as $summary) {
        expect($library->article($summary['slug'])['title'])->toBe($summary['title']);
    }
});

test('STR-012 a direct article link requires consent on the server', function () {
    $slug = storyLibrary()->edition()[2]['slug'];

    $this->get(route('stories.show', $slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('consent.required', true));
});

test('the next story is the following one and wraps around', function () {
    $library = storyLibrary();
    $stories = $library->all();

    expect($library->article($stories[0]['slug'])['next']['slug'])->toBe($stories[1]['slug'])
        ->and($library->article($stories[count($stories) - 1]['slug'])['next']['slug'])->toBe($stories[0]['slug']);
});

test('every story has the promised structure', function () {
    foreach (storyLibrary()->all() as $story) {
        $names = array_column($story['sections'], 'name');

        expect($story['deck'])->not->toBeEmpty()
            ->and($names)->toHaveCount(count(array_unique($names)))
            ->and(array_filter($names, fn (string $name): bool => $name === ''))->toBeEmpty();
    }
});
