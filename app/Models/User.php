<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['jabatan_id', 'gudang_id', 'nama_lengkap', 'username', 'password', 'is_active', 'last_login_at'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Relasi ke tabel jabatan.
     */
    public function jabatan(): BelongsTo
    {
        return $this->belongsTo(Jabatan::class);
    }

    /**
     * Relasi ke tabel gudangs.
     */
    public function gudang(): BelongsTo
    {
        return $this->belongsTo(Gudang::class);
    }

    /**
     * Helper: cek apakah user memiliki level akses tertentu.
     */
    public function hasLevelAkses(string $levelAkses): bool
    {
        return $this->jabatan?->level_akses === $levelAkses;
    }

    /**
     * Helper: cek apakah user adalah Super Admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasLevelAkses('super_admin');
    }

    /**
     * Helper: cek apakah user adalah Admin Pusat atau lebih tinggi.
     */
    public function isAdminPusat(): bool
    {
        return $this->jabatan?->level_urutan <= 2;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password'       => 'hashed',
            'is_active'      => 'boolean',
            'last_login_at'  => 'datetime',
        ];
    }
}
