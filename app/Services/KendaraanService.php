<?php

namespace App\Services;

use App\Contracts\Repositories\KendaraanRepositoryInterface;
use App\Contracts\Services\KendaraanServiceInterface;
use App\Models\Kendaraan;
use App\Services\Concerns\AppliesQueryFilters;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class KendaraanService implements KendaraanServiceInterface
{
    use AppliesQueryFilters;

    public function __construct(
        private readonly KendaraanRepositoryInterface $kendaraanRepository,
    ) {}

    public function paginate(array $params): LengthAwarePaginator
    {
        $query = $this->kendaraanRepository->query();

        $this->applySearch($query, $params['search'] ?? null, [
            'kode_kendaraan',
            'nama_kendaraan',
            'no_polisi',
            'no_rangka',
            'no_mesin',
            'warna',
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
            'kode_kendaraan',
            'tanggal_input',
            'nama_kendaraan',
            'no_polisi',
            'tahun_perolehan',
            'created_at',
        ], 'kode_kendaraan');

        return $query
            ->paginate((int) ($params['per_page'] ?? 10))
            ->withQueryString();
    }

    public function store(array $data): Kendaraan
    {
        /** @var Kendaraan */
        return $this->kendaraanRepository->create($data);
    }

    public function update(int $id, array $data): Kendaraan
    {
        /** @var Kendaraan */
        return $this->kendaraanRepository->update($id, $data);
    }

    public function destroy(int $id): bool
    {
        return $this->kendaraanRepository->delete($id);
    }
}
