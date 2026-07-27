<?php

namespace App\Repositories\Eloquent;

use App\Contracts\Repositories\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Abstract base repository — menyediakan method CRUD generik.
 *
 * Setiap concrete repository cukup set `$modelClass` dan override
 * method yang perlu custom logic (misal: `query()` untuk eager-load relasi).
 */
abstract class BaseRepository implements BaseRepositoryInterface
{
    /**
     * FQCN dari Eloquent Model yang dikelola repository ini.
     *
     * @var class-string<Model>
     */
    protected string $modelClass;

    /**
     * Dapatkan query builder bersih dari model.
     */
    public function query(): Builder
    {
        return ($this->modelClass)::query();
    }

    /**
     * Cari model berdasarkan ID atau gagal (404).
     */
    public function findOrFail(int $id): Model
    {
        return ($this->modelClass)::findOrFail($id);
    }

    /**
     * Simpan record baru.
     *
     * @param  array<string, mixed> $data
     */
    public function create(array $data): Model
    {
        return ($this->modelClass)::create($data);
    }

    /**
     * Update record berdasarkan ID, lalu refresh model.
     *
     * @param  array<string, mixed> $data
     */
    public function update(int $id, array $data): Model
    {
        $model = $this->findOrFail($id);
        $model->update($data);

        return $model->refresh();
    }

    /**
     * Hapus record berdasarkan ID.
     */
    public function delete(int $id): bool
    {
        $model = $this->findOrFail($id);

        return (bool) $model->delete();
    }
}
