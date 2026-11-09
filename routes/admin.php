<?php

use App\Http\Controllers\Admin\ConsentController;
use App\Http\Controllers\Admin\OverviewController;
use Illuminate\Support\Facades\Route;

/*
| Admin portal. Every route needs a signed-in user with a verified email.
| Public registration is off (config/fortify.php), so the only accounts are
| the ones we seed or create by hand.
|
| The overview keeps the starter kit's `dashboard` name because Fortify and
| the settings pages redirect to it.
*/

Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::get('/', OverviewController::class)->name('dashboard');

    Route::get('consents', [ConsentController::class, 'index'])->name('admin.consents.index');
    Route::get('consents/export', [ConsentController::class, 'export'])->name('admin.consents.export');
    Route::get('consents/{consent:guid}', [ConsentController::class, 'show'])->whereUuid('consent')->name('admin.consents.show');
});
