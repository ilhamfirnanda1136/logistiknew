<?php

namespace App\Services;

use App\Contracts\Repositories\DimensiRepositoryInterface;
use App\Contracts\Services\DimensiServiceInterface;
use App\Models\Dimensi;
use App\Services\Concerns\AppliesQueryFilters;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class DimensiService implements DimensiServiceInterface
{
    use AppliesQueryFilters;

    public function __construct(
        private readonly DimensiRepositoryInterface $dimensiRepository,
    ) {}

    public function paginate(array $params): LengthAwarePaginator
    {
        $query = $this->dimensiRepository->query();

        $this->applySearch($query, $params['search'] ?? null, [
            'nama_dimensi',
            'keterangan',
        ]);

        $this->applySort($query, $params['sort_by'] ?? null, $params['sort_dir'] ?? null, [
            'id',
            'nama_dimensi',
            'created_at',
        ], 'nama_dimensi');

        return $query
            ->paginate((int) ($params['per_page'] ?? 10))
            ->withQueryString();
    }

    public function store(array $data): Dimensi
    {
        /** @var Dimensi */
        return $this->dimensiRepository->create($data);
    }

    public function update(int $id, array $data): Dimensi
    {
        /** @var Dimensi */
        return $this->dimensiRepository->update($id, $data);
    }

    public function destroy(int $id): bool
    {
        return $this->dimensiRepository->delete($id);
    }
}
