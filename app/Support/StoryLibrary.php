<?php

namespace App\Support;

use App\Http\Middleware\HandleLocale;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Str;

/**
 * The sample stories, in English and Bahasa Melayu, one data file each. Read
 * time comes from the word count of the language shown, so what the site
 * promises always matches what was written.
 *
 * @phpstan-type Block array{type: string, text?: string, title?: string, rows?: list<array{term: string, meaning: string}>}
 * @phpstan-type Section array{id?: string, name: string, blocks: list<Block>}
 * @phpstan-type RawStory array{slug: string, desk: string, title: string, deck: string, byline: string, long_read: bool, sections: list<Section>}
 * @phpstan-type Translation array{slug: string, desk: string, title: string, deck: string, byline: string, sections: list<Section>}
 * @phpstan-type Summary array{slug: string, desk: string, title: string, byline: string, minutes: int}
 */
class StoryLibrary
{
    public const WORDS_PER_MINUTE = 220;

    /** @var list<RawStory>|null */
    private ?array $english = null;

    /** @var array<string, Translation>|null */
    private ?array $malay = null;

    /**
     * The stories listed in "This week's edition", in order.
     *
     * @return list<Summary>
     */
    public function edition(): array
    {
        $stories = array_filter($this->all(), fn (array $story): bool => ! $story['long_read']);

        return array_values(array_map($this->summary(...), $stories));
    }

    /**
     * @return Summary
     */
    public function longRead(): array
    {
        foreach ($this->all() as $story) {
            if ($story['long_read']) {
                return $this->summary($story);
            }
        }

        throw new \LogicException('The story data has no long read.');
    }

    /**
     * Everything the article page needs, or null for an unknown slug.
     *
     * @return array<string, mixed>|null
     */
    public function article(string $slug): ?array
    {
        $stories = $this->all();

        foreach ($stories as $index => $story) {
            if ($story['slug'] !== $slug) {
                continue;
            }

            return [
                ...$this->summary($story),
                'deck' => $story['deck'],
                'sections' => array_map(fn (array $section): array => [
                    'id' => $section['id'] ?? Str::slug($section['name']),
                    'name' => $section['name'],
                    'blocks' => $section['blocks'],
                ], $story['sections']),
                'next' => $this->summary($stories[($index + 1) % count($stories)]),
            ];
        }

        return null;
    }

    /**
     * Only running text counts. A pull quote repeats words already counted.
     *
     * @param  RawStory  $story
     */
    public function wordCount(array $story): int
    {
        $words = 0;

        foreach ($story['sections'] as $section) {
            foreach ($section['blocks'] as $block) {
                if ($block['type'] === 'p') {
                    $words += count(preg_split('/\s+/u', trim($block['text'] ?? '')) ?: []);
                }
            }
        }

        return $words;
    }

    /**
     * @return list<RawStory>
     */
    public function all(): array
    {
        /** @var list<RawStory> $english */
        $english = $this->english ??= require resource_path('data/stories.php');

        if (App::currentLocale() !== HandleLocale::MALAY) {
            return $english;
        }

        return array_map($this->inMalay(...), $english);
    }

    /**
     * The story with its words swapped. Section ids stay the English ones, so
     * a link to a section means the same place in either language.
     *
     * @param  RawStory  $story
     * @return RawStory
     */
    private function inMalay(array $story): array
    {
        /** @var list<Translation> $translations */
        $translations = $this->malay === null ? require resource_path('data/stories.ms.php') : [];
        $this->malay ??= array_column($translations, null, 'slug');
        $malay = $this->malay[$story['slug']];

        return [
            ...$malay,
            'long_read' => $story['long_read'],
            'sections' => array_map(fn (array $section, array $original): array => [
                ...$section,
                'id' => Str::slug($original['name']),
            ], $malay['sections'], $story['sections']),
        ];
    }

    /**
     * @param  RawStory  $story
     * @return Summary
     */
    private function summary(array $story): array
    {
        return [
            'slug' => $story['slug'],
            'desk' => $story['desk'],
            'title' => $story['title'],
            'byline' => $story['byline'],
            'minutes' => (int) ceil($this->wordCount($story) / self::WORDS_PER_MINUTE),
        ];
    }
}
