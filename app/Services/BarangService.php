<?php

namespace App\Services;

use App\Contracts\Repositories\BarangRepositoryInterface;
use App\Contracts\Services\BarangServiceInterface;
use App\Models\Barang;
use App\Services\Concerns\AppliesQueryFilters;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class BarangService implements BarangServiceInterface
{
    use AppliesQueryFilters;

    public function __construct(
        private readonly BarangRepositoryInterface $barangRepository,
    ) {}

    public function paginate(array $params): LengthAwarePaginator
    {
        $query = $this->barangRepository->query();

        $this->applySearch($query, $params['search'] ?? null, [
            'kode_barang',
            'nama_barang',
            'keterangan',
        ]);

        if (! empty($params['satuan_id'])) {
            $query->where('satuan_id', $params['satuan_id']);
        }

        if (! empty($params['kategori_id'])) {
            $query->where('kategori_id', $params['kategori_id']);
        }

        $this->applySort($query, $params['sort_by'] ?? null, $params['sort_dir'] ?? null, [
            'id',
            'kode_barang',
            'nama_barang',
            'stok',
            'created_at',
        ], 'kode_barang');

        return $query
            ->paginate((int) ($params['per_page'] ?? 10))
            ->withQueryString();
    }

    public function store(array $data): Barang
    {
        /** @var Barang */
        return $this->barangRepository->create($data);
    }

    public function update(int $id, array $data): Barang
    {
        /** @var Barang */
        return $this->barangRepository->update($id, $data);
    }

    public function destroy(int $id): bool
    {
        return $this->barangRepository->delete($id);
    }
}
