<?php

use App\Events\ConsentsChanged;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
| The same gate as routes/admin.php: signed in with a verified email. A guest
| never reaches this callback, because the broadcaster refuses them first.
*/
Broadcast::channel(ConsentsChanged::CHANNEL, fn (User $user): bool => $user->hasVerifiedEmail());
