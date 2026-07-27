<?php

namespace App\Services;

use App\Contracts\Repositories\JabatanRepositoryInterface;
use App\Contracts\Services\JabatanServiceInterface;
use App\Models\Jabatan;
use App\Services\Concerns\AppliesQueryFilters;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class JabatanService implements JabatanServiceInterface
{
    use AppliesQueryFilters;

    public function __construct(
        private readonly JabatanRepositoryInterface $jabatanRepository,
    ) {}

    public function paginate(array $params): LengthAwarePaginator
    {
        $query = $this->jabatanRepository->query();

        $this->applySearch($query, $params['search'] ?? null, [
            'nama_jabatan',
            'level_akses',
            'keterangan',
        ]);

        $this->applySort($query, $params['sort_by'] ?? null, $params['sort_dir'] ?? null, [
            'id',
            'nama_jabatan',
            'level_akses',
            'level_urutan',
            'is_active',
            'created_at',
        ], 'level_urutan');

        return $query
            ->paginate((int) ($params['per_page'] ?? 10))
            ->withQueryString();
    }

    public function store(array $data): Jabatan
    {
        $data['is_active'] = $data['is_active'] ?? true;

        /** @var Jabatan */
        return $this->jabatanRepository->create($data);
    }

    public function update(int $id, array $data): Jabatan
    {
        $data['is_active'] = $data['is_active'] ?? true;

        /** @var Jabatan */
        return $this->jabatanRepository->update($id, $data);
    }

    public function destroy(int $id): bool
    {
        return $this->jabatanRepository->delete($id);
    }
}
