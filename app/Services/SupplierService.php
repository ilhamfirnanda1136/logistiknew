<?php

namespace App\Services;

use App\Contracts\Repositories\SupplierRepositoryInterface;
use App\Contracts\Services\SupplierServiceInterface;
use App\Models\Supplier;
use App\Services\Concerns\AppliesQueryFilters;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SupplierService implements SupplierServiceInterface
{
    use AppliesQueryFilters;

    public function __construct(
        private readonly SupplierRepositoryInterface $supplierRepository,
    ) {}

    public function paginate(array $params): LengthAwarePaginator
    {
        $query = $this->supplierRepository->query();

        $this->applySearch($query, $params['search'] ?? null, [
            'nama_supplier',
            'no_telepon',
            'alamat',
            'keterangan',
        ]);

        $this->applySort($query, $params['sort_by'] ?? null, $params['sort_dir'] ?? null, [
            'id',
            'nama_supplier',
            'created_at',
        ], 'id');

        return $query
            ->paginate((int) ($params['per_page'] ?? 10))
            ->withQueryString();
    }

    public function store(array $data): Supplier
    {
        /** @var Supplier */
        return $this->supplierRepository->create($data);
    }

    public function update(int $id, array $data): Supplier
    {
        /** @var Supplier */
        return $this->supplierRepository->update($id, $data);
    }

    public function destroy(int $id): bool
    {
        return $this->supplierRepository->delete($id);
    }
}
