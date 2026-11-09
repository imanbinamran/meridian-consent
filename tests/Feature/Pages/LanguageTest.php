<?php

/*
| The EN/BM switch on the public site, server side.
| Cases: tests/cases/language.yaml.
*/

use App\Models\Consent;
use App\Models\User;
use App\Support\StoryLibrary;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

use function Tests\Feature\Consent\recordedCookieValue;

require_once __DIR__.'/../Consent/ConsentHelpers.php';

const KOPITIAM = 'the-quiet-return-of-the-neighbourhood-kopitiam';

/**
 * The parts of a translated string a translator must not change.
 *
 * @return list<string>
 */
function fixedTokens(string $text): array
{
    preg_match_all('/:[a-z_]+|<\/?[a-z_]+>/', $text, $matches);
    sort($matches[0]);

    return $matches[0];
}

test('LNG-001 the saved language decides the page and html lang', function (string $cookie, string $lang) {
    $this->withUnencryptedCookie('locale', $cookie)
        ->withHeader('Accept-Language', $cookie === 'ms' ? 'en-US' : 'ms-MY')
        ->get(route('home'))
        ->assertOk()
        ->assertSee("<html lang=\"{$lang}\"", escape: false)
        ->assertInertia(fn (Assert $page) => $page->where('locale', $lang));
})->with([
    'Malay' => ['ms', 'ms'],
    'English' => ['en', 'en'],
]);

test('LNG-002 with no saved language the site is in English, whatever the browser asks for', function (?string $header) {
    $request = $header === null ? $this : $this->withHeader('Accept-Language', $header);

    $request->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));
})->with([
    'Malay in Malaysia' => ['ms-MY,ms;q=0.9,en;q=0.8'],
    'plain Malay' => ['ms'],
    'English' => ['en-US,en;q=0.9'],
    'Indonesian' => ['id-ID,id;q=0.9'],
    'no header' => [null],
]);

test('LNG-003 a made-up cookie value counts as no choice', function (string $value) {
    $this->withUnencryptedCookie('locale', $value)
        ->withHeader('Accept-Language', 'ms')
        ->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));
})->with(['../../etc/passwd', 'fr']);

test('LNG-004 sign-in and admin stay in English with no public words', function () {
    $this->withUnencryptedCookie('locale', 'ms')
        ->withHeader('Accept-Language', 'ms')
        ->get(route('login'))
        ->assertSee('<html lang="en"', escape: false)
        ->assertInertia(fn (Assert $page) => $page
            ->where('locale', 'en')
            ->where('translations', []));

    $this->actingAs(User::factory()->create())
        ->withUnencryptedCookie('locale', 'ms')
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('locale', 'en')
            ->where('translations', []));
});

test('LNG-005 a public page gets the shared words and its own, no others', function (string $route, array $groups) {
    $this->get(route($route))
        ->assertInertia(fn (Assert $page) => expect(array_keys($page->toArray()['props']['translations']))->toBe($groups));
})->with([
    'home' => ['home', ['common', 'home']],
    'about' => ['about', ['common', 'about']],
    'privacy' => ['privacy', ['common', 'privacy']],
    'terms' => ['terms', ['common', 'terms']],
]);

test('LNG-006 an article reads in Malay at the same address', function () {
    $english = $this->get(route('stories.show', KOPITIAM))->viewData('page')['props']['story'];
    $malay = $this->withUnencryptedCookie('locale', 'ms')
        ->get(route('stories.show', KOPITIAM))
        ->assertOk()
        ->viewData('page')['props']['story'];

    expect($malay['slug'])->toBe($english['slug'])
        ->and($malay['title'])->not->toBe($english['title'])
        ->and($malay['desk'])->toBe('Makanan')
        ->and($malay['sections'][1]['name'])->not->toBe($english['sections'][1]['name'])
        ->and(array_column($malay['sections'], 'id'))->toBe(array_column($english['sections'], 'id'))
        ->and($malay['next']['title'])->not->toBe($english['next']['title']);

    App::setLocale('ms');
    $library = app(StoryLibrary::class);
    $story = collect($library->all())->firstWhere('slug', KOPITIAM);

    expect($malay['minutes'])->toBe((int) ceil($library->wordCount($story) / StoryLibrary::WORDS_PER_MINUTE));
});

test('LNG-007 toasts and contact form errors follow the language', function () {
    $this->withUnencryptedCookie('locale', 'ms')
        ->from(route('home'))
        ->post(route('consent.accept'))
        ->assertInertiaFlash('toast.message', 'Terima kasih. Pilihan kuki anda telah disimpan.');

    $this->withUnencryptedCookie('locale', 'ms')
        ->from(route('about'))
        ->post(route('contact.store'), ['name' => '', 'email' => 'x', 'topic' => 'spam', 'message' => 'pendek'])
        ->assertSessionHasErrors([
            'name' => 'Ruangan nama wajib diisi.',
            'email' => 'Sila masukkan alamat e-mel yang sah untuk e-mel.',
            'topic' => 'topik yang dipilih tidak sah.',
            'message' => 'mesej mestilah sekurang-kurangnya 20 aksara.',
        ]);
});

test('LNG-008 a consent record keeps the language it was accepted in', function (?string $cookie, string $expected) {
    $request = $cookie === null ? $this : $this->withUnencryptedCookie('locale', $cookie);

    $request->from(route('home'))->post(route('consent.accept'))->assertRedirect();

    expect(Consent::query()->sole()->locale)->toBe($expected);
})->with([
    'Malay' => ['ms', 'ms'],
    'English' => ['en', 'en'],
    'no saved choice' => [null, 'en'],
]);

test('LNG-009 clicking Accept again in the other language keeps the original record', function () {
    $this->withUnencryptedCookie('consent', recordedCookieValue())
        ->withUnencryptedCookie('locale', 'ms')
        ->from(route('home'))
        ->post(route('consent.accept'));

    expect(Consent::query()->sole()->locale)->toBe('en');
});

test('LNG-010 consents given before this feature stay valid in either language', function (string $locale) {
    expect(config('consent.version'))->toBe(1);

    $this->withUnencryptedCookie('consent', recordedCookieValue())
        ->withUnencryptedCookie('locale', $locale)
        ->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('consent.required', false)
            ->where('consent.choice', 'accepted'));
})->with(['en', 'ms']);

test('LNG-011 a row with no language recorded counts as English and stays active', function () {
    DB::table('consents')->insert([
        'guid' => (string) Str::uuid(),
        'version' => 1,
        'accepted_at' => now()->subDay(),
    ]);

    $consent = Consent::query()->sole();

    expect($consent->locale)->toBe('en')
        ->and($consent->status())->toBe(Consent::STATUS_ACTIVE);
});

test('LNG-012 the Privacy page names the language cookie in both languages', function (string $locale, string $when) {
    $this->withUnencryptedCookie('locale', $locale)
        ->get(route('privacy'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('cookies.locale', 'locale')
            ->where('translations.privacy.cookie_table.rows.5.cookie', 'locale')
            ->where('translations.privacy.cookie_table.rows.5.when', $when));
})->with([
    ['en', 'When you switch language'],
    ['ms', 'Apabila anda menukar bahasa'],
]);

test('LNG-013 the English and Malay word files have the same shape', function () {
    $english = Arr::dot(require lang_path('en/site.php'));
    $malay = Arr::dot(require lang_path('ms/site.php'));

    expect(array_keys($malay))->toBe(array_keys($english));

    foreach ($english as $key => $text) {
        // Ids and values the code matches on must not be translated.
        if (preg_match('/\.(id|cookie|value|year)$/', $key) === 1) {
            expect($malay[$key])->toBe($text, $key);
        }

        if (is_string($text) && is_string($malay[$key])) {
            expect(fixedTokens($malay[$key]))->toBe(fixedTokens($text), $key);
        }
    }
});

test('LNG-014 every word key the pages ask for exists', function () {
    $english = require lang_path('en/site.php');
    $files = [
        ...File::allFiles(resource_path('js/pages/site')),
        ...File::allFiles(resource_path('js/components/site')),
        ...File::files(resource_path('js/layouts')),
    ];
    $checked = 0;

    foreach ($files as $file) {
        preg_match_all("/\b(?:t|rich|list(?:<\w+>)?)\(\s*'([a-z_]+(?:\.[a-z_0-9]+)+)'/", $file->getContents(), $matches);

        foreach ($matches[1] as $key) {
            expect(Arr::has($english, $key))->toBeTrue("{$key} is used in {$file->getFilename()} but has no text.");
            $checked++;
        }
    }

    expect($checked)->toBeGreaterThan(100);
});

test('LNG-015 every story has a Malay version with the same structure', function () {
    $malay = collect(require resource_path('data/stories.ms.php'))->keyBy('slug');

    foreach (require resource_path('data/stories.php') as $story) {
        $translation = $malay->get($story['slug']);

        expect($translation)->not->toBeNull($story['slug'])
            ->and($translation['sections'])->toHaveCount(count($story['sections']));

        foreach ($story['sections'] as $i => $section) {
            $blocks = $translation['sections'][$i]['blocks'];

            expect(array_column($blocks, 'type'))->toBe(array_column($section['blocks'], 'type'), $section['name']);

            foreach ($section['blocks'] as $j => $block) {
                if ($block['type'] === 'guide') {
                    expect($blocks[$j]['rows'])->toHaveCount(count($block['rows']));
                }
            }
        }
    }

    expect($malay)->toHaveCount(5);
});
