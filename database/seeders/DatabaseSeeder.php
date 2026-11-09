<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database. Safe to run more than once.
     */
    public function run(): void
    {
        User::query()->firstOrCreate(
            ['email' => config('admin.seed.email')],
            [
                'name' => config('admin.seed.name'),
                'password' => config('admin.seed.password'),
                'email_verified_at' => now(),
            ],
        );

        if (app()->environment('local', 'testing') || config('admin.demo_data')) {
            // In this order: the demo data is skipped once any consent exists.
            $this->call([ConsentDemoSeeder::class, ExpiredConsentSeeder::class]);
        }
    }
}
