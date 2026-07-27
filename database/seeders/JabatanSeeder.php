<?php

namespace Database\Seeders;

use App\Models\Jabatan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class JabatanSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed 5 jabatan dengan level hak akses.
     */
    public function run(): void
    {
        $jabatan = [
            [
                'nama_jabatan'  => 'Super Admin',
                'level_akses'   => Jabatan::LEVEL_SUPER_ADMIN,
                'level_urutan'  => 1,
                'keterangan'    => 'Hak akses penuh terhadap seluruh sistem, konfigurasi, dan manajemen pengguna.',
                'is_active'     => true,
            ],
            [
                'nama_jabatan'  => 'Admin Pusat',
                'level_akses'   => Jabatan::LEVEL_ADMIN_PUSAT,
                'level_urutan'  => 2,
                'keterangan'    => 'Hak akses manajemen data pusat, laporan global, dan pengaturan cabang.',
                'is_active'     => true,
            ],
            [
                'nama_jabatan'  => 'Admin Cabang',
                'level_akses'   => Jabatan::LEVEL_ADMIN_CABANG,
                'level_urutan'  => 3,
                'keterangan'    => 'Hak akses manajemen data pada lingkup cabang tertentu.',
                'is_active'     => true,
            ],
            [
                'nama_jabatan'  => 'Admin Perdivisi',
                'level_akses'   => Jabatan::LEVEL_ADMIN_PERDIVISI,
                'level_urutan'  => 4,
                'keterangan'    => 'Hak akses manajemen data pada lingkup divisi tertentu dalam cabang.',
                'is_active'     => true,
            ],
            [
                'nama_jabatan'  => 'User',
                'level_akses'   => Jabatan::LEVEL_USER,
                'level_urutan'  => 5,
                'keterangan'    => 'Hak akses standar untuk penggunaan fitur operasional sehari-hari.',
                'is_active'     => true,
            ],
        ];

        foreach ($jabatan as $data) {
            Jabatan::firstOrCreate(
                ['level_akses' => $data['level_akses']],
                $data
            );
        }
    }
}
