<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * 5 level hak akses:
 *  1 = Super Admin
 *  2 = Admin Pusat
 *  3 = Admin Cabang
 *  4 = Admin Perdivisi
 *  5 = User
 */
#[Fillable(['nama_jabatan', 'level_akses', 'level_urutan', 'keterangan', 'is_active'])]
class Jabatan extends Model
{
    /**
     * Nama tabel di database (mencegah auto-pluralisasi menjadi 'jabatans').
     */
    protected $table = 'jabatan';
    /**
     * Konstanta level akses yang tersedia.
     */
    const LEVEL_SUPER_ADMIN     = 'super_admin';
    const LEVEL_ADMIN_PUSAT     = 'admin_pusat';
    const LEVEL_ADMIN_CABANG    = 'admin_cabang';
    const LEVEL_ADMIN_PERDIVISI = 'admin_perdivisi';
    const LEVEL_USER            = 'user';

    /**
     * Daftar semua level akses yang valid.
     */
    public static array $levelAksesList = [
        self::LEVEL_SUPER_ADMIN,
        self::LEVEL_ADMIN_PUSAT,
        self::LEVEL_ADMIN_CABANG,
        self::LEVEL_ADMIN_PERDIVISI,
        self::LEVEL_USER,
    ];

    /**
     * Label tampilan untuk setiap level akses.
     */
    public static array $levelLabels = [
        self::LEVEL_SUPER_ADMIN     => 'Super Admin',
        self::LEVEL_ADMIN_PUSAT     => 'Admin Pusat',
        self::LEVEL_ADMIN_CABANG    => 'Admin Cabang',
        self::LEVEL_ADMIN_PERDIVISI => 'Admin Perdivisi',
        self::LEVEL_USER            => 'User',
    ];

    /**
     * Relasi ke tabel users.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Scope: hanya jabatan yang aktif.
     */
    public function scopeAktif($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: urutkan berdasarkan level_urutan.
     */
    public function scopeByUrutan($query)
    {
        return $query->orderBy('level_urutan');
    }

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'is_active'     => 'boolean',
            'level_urutan'  => 'integer',
        ];
    }
}
