<?php

namespace App\Services;

use App\Contracts\Repositories\SatuanRepositoryInterface;
use App\Contracts\Services\SatuanServiceInterface;
use App\Models\Satuan;
use App\Services\Concerns\AppliesQueryFilters;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SatuanService implements SatuanServiceInterface
{
    use AppliesQueryFilters;

    public function __construct(
        private readonly SatuanRepositoryInterface $satuanRepository,
    ) {}

    public function paginate(array $params): LengthAwarePaginator
    {
        $query = $this->satuanRepository->query();

        $this->applySearch($query, $params['search'] ?? null, [
            'nama_satuan',
            'keterangan',
        ]);

        $this->applySort($query, $params['sort_by'] ?? null, $params['sort_dir'] ?? null, [
            'id',
            'nama_satuan',
            'created_at',
        ], 'nama_satuan');

        return $query
            ->paginate((int) ($params['per_page'] ?? 10))
            ->withQueryString();
    }

    public function store(array $data): Satuan
    {
        /** @var Satuan */
        return $this->satuanRepository->create($data);
    }

    public function update(int $id, array $data): Satuan
    {
        /** @var Satuan */
        return $this->satuanRepository->update($id, $data);
    }

    public function destroy(int $id): bool
    {
        return $this->satuanRepository->delete($id);
    }
}
