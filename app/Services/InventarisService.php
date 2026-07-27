<?php

namespace App\Services;

use App\Contracts\Repositories\InventarisRepositoryInterface;
use App\Contracts\Services\InventarisServiceInterface;
use App\Models\Inventaris;
use App\Services\Concerns\AppliesQueryFilters;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class InventarisService implements InventarisServiceInterface
{
    use AppliesQueryFilters;

    public function __construct(
        private readonly InventarisRepositoryInterface $inventarisRepository,
    ) {}

    public function paginate(array $params): LengthAwarePaginator
    {
        $query = $this->inventarisRepository->query();

        $this->applySearch($query, $params['search'] ?? null, [
            'kode_barang',
            'no_inventaris',
            'nama_inventaris',
            'merek',
            'keterangan',
        ]);

        if (! empty($params['gudang_id'])) {
            $query->where('gudang_id', $params['gudang_id']);
        }

        if (! empty($params['kategori_id'])) {
            $query->where('kategori_id', $params['kategori_id']);
        }

        $this->applySort($query, $params['sort_by'] ?? null, $params['sort_dir'] ?? null, [
            'id',
            'kode_barang',
            'tanggal_input',
            'nama_inventaris',
            'merek',
            'jumlah',
            'created_at',
        ], 'kode_barang');

        return $query
            ->paginate((int) ($params['per_page'] ?? 10))
            ->withQueryString();
    }

    public function store(array $data): Inventaris
    {
        /** @var Inventaris */
        return $this->inventarisRepository->create($data);
    }

    public function update(int $id, array $data): Inventaris
    {
        /** @var Inventaris */
        return $this->inventarisRepository->update($id, $data);
    }

    public function destroy(int $id): bool
    {
        return $this->inventarisRepository->delete($id);
    }
}
