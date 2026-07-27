<?php

namespace Database\Seeders;

use App\Models\Jabatan;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed user default Super Admin.
     */
    public function run(): void
    {
        $superAdmin = Jabatan::where('level_akses', Jabatan::LEVEL_SUPER_ADMIN)->first();

        if (! $superAdmin) {
            $this->command->warn('Jabatan Super Admin belum ada. Jalankan JabatanSeeder terlebih dahulu.');
            return;
        }

        User::firstOrCreate(
            ['username' => 'superadmin'],
            [
                'jabatan_id'   => $superAdmin->id,
                'nama_lengkap' => 'Super Administrator',
                'username'     => 'superadmin',
                'password'     => Hash::make('password'),
                'is_active'    => true,
            ]
        );

        $this->command->info('User Super Admin berhasil dibuat. Username: superadmin | Password: password');
    }
}
