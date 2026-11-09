<?php

namespace App\Http\Controllers;

use App\Support\StoryLibrary;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(StoryLibrary $stories): Response
    {
        return Inertia::render('site/home', [
            'edition' => $stories->edition(),
            'longRead' => $stories->longRead(),
        ]);
    }
}
