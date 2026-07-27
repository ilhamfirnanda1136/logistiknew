<?php

namespace Database\Factories;

use App\Models\Jabatan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'jabatan_id'   => Jabatan::where('level_akses', Jabatan::LEVEL_USER)->first()?->id ?? 1,
            'nama_lengkap' => fake('id_ID')->name(),
            'username'     => fake()->unique()->userName(),
            'password'     => static::$password ??= Hash::make('password'),
            'is_active'    => true,
            'last_login_at' => null,
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Buat user dengan jabatan tertentu.
     */
    public function withJabatan(string $levelAkses): static
    {
        return $this->state(fn (array $attributes) => [
            'jabatan_id' => Jabatan::where('level_akses', $levelAkses)->first()?->id ?? 1,
        ]);
    }

    /**
     * Buat user yang tidak aktif.
     */
    public function nonAktif(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
