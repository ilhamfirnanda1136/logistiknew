<?php

namespace App\Services;

use App\Contracts\Repositories\PenggunaRepositoryInterface;
use App\Contracts\Services\PenggunaServiceInterface;
use App\Models\User;
use App\Services\Concerns\AppliesQueryFilters;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class PenggunaService implements PenggunaServiceInterface
{
    use AppliesQueryFilters;

    public function __construct(
        private readonly PenggunaRepositoryInterface $penggunaRepository,
    ) {}

    public function paginate(array $params): LengthAwarePaginator
    {
        $query = $this->penggunaRepository->query();

        // Search juga support relasi jabatan
        $search = $params['search'] ?? null;
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                  ->orWhere('nama_lengkap', 'like', "%{$search}%")
                  ->orWhereHas('jabatan', fn ($j) => $j->where('nama_jabatan', 'like', "%{$search}%"));
            });
        }

        $this->applySort($query, $params['sort_by'] ?? null, $params['sort_dir'] ?? null, [
            'id',
            'username',
            'nama_lengkap',
            'is_active',
            'last_login_at',
            'created_at',
        ], 'nama_lengkap');

        return $query
            ->paginate((int) ($params['per_page'] ?? 10))
            ->withQueryString();
    }

    public function store(array $data): User
    {
        $data['is_active'] = $data['is_active'] ?? true;

        // Hash password sebelum disimpan
        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        /** @var User */
        return $this->penggunaRepository->create($data);
    }

    public function update(int $id, array $data): User
    {
        $data['is_active'] = $data['is_active'] ?? true;

        // Hash password hanya jika diisi, jika kosong hapus dari data
        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        /** @var User */
        return $this->penggunaRepository->update($id, $data);
    }

    public function destroy(int $id): bool
    {
        return $this->penggunaRepository->delete($id);
    }
}
