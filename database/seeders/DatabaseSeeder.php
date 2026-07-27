<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     * Urutan penting: Jabatan harus diisi sebelum User (foreign key constraint).
     */
    public function run(): void
    {
        $this->call([
            JabatanSeeder::class,
            UserSeeder::class,
        ]);
    }
}
