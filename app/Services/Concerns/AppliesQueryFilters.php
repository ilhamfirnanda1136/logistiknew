<?php

namespace App\Services\Concerns;

use Illuminate\Database\Eloquent\Builder;

/**
 * Trait untuk apply search dan sort pada query builder.
 *
 * Dipakai oleh Service layer agar logic filter tidak
 * tersebar di Repository maupun Controller.
 */
trait AppliesQueryFilters
{
    /**
     * Terapkan pencarian LIKE pada beberapa kolom.
     *
     * WHERE LOWER(col1) LIKE '%term%' OR LOWER(col2) LIKE '%term%' ...
     *
     * @param  string[]  $columns  Kolom yang akan di-search
     */
    protected function applySearch(Builder $query, ?string $term, array $columns): Builder
    {
        if (! $term || empty($columns)) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($term, $columns) {
            foreach ($columns as $column) {
                $q->orWhere($column, 'like', "%{$term}%");
            }
        });
    }

    /**
     * Terapkan sorting dengan whitelist validasi kolom.
     *
     * @param  string[]  $allowedColumns  Kolom yang diizinkan untuk sort
     * @param  string    $default         Kolom default jika `$sort` tidak valid
     */
    protected function applySort(
        Builder $query,
        ?string $sort,
        ?string $direction,
        array $allowedColumns,
        string $default = 'id',
    ): Builder {
        if (! $sort || ! in_array($sort, $allowedColumns, true)) {
            $sort = $default;
        }

        $direction = strtolower($direction ?? 'asc') === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sort, $direction);
    }
}
