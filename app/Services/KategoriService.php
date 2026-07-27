<?php

namespace App\Services;

use App\Contracts\Repositories\KategoriRepositoryInterface;
use App\Contracts\Services\KategoriServiceInterface;
use App\Models\Kategori;
use App\Services\Concerns\AppliesQueryFilters;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class KategoriService implements KategoriServiceInterface
{
    use AppliesQueryFilters;

    public function __construct(
        private readonly KategoriRepositoryInterface $kategoriRepository,
    ) {}

    public function paginate(array $params): LengthAwarePaginator
    {
        $query = $this->kategoriRepository->query();

        $this->applySearch($query, $params['search'] ?? null, [
            'nama_kategori',
            'keterangan',
        ]);

        $this->applySort($query, $params['sort_by'] ?? null, $params['sort_dir'] ?? null, [
            'id',
            'nama_kategori',
            'created_at',
        ], 'nama_kategori');

        return $query
            ->paginate((int) ($params['per_page'] ?? 10))
            ->withQueryString();
    }

    public function store(array $data): Kategori
    {
        /** @var Kategori */
        return $this->kategoriRepository->create($data);
    }

    public function update(int $id, array $data): Kategori
    {
        /** @var Kategori */
        return $this->kategoriRepository->update($id, $data);
    }

    public function destroy(int $id): bool
    {
        return $this->kategoriRepository->delete($id);
    }
}
