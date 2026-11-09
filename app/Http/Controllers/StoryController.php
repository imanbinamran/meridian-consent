<?php

namespace App\Http\Controllers;

use App\Support\StoryLibrary;
use Inertia\Inertia;
use Inertia\Response;

class StoryController extends Controller
{
    public function __invoke(StoryLibrary $stories, string $slug): Response
    {
        $story = $stories->article($slug);

        abort_if($story === null, 404);

        return Inertia::render('site/story', ['story' => $story]);
    }
}
