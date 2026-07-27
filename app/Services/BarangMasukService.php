<?php

namespace App\Services;

use App\Contracts\Repositories\BarangMasukRepositoryInterface;
use App\Contracts\Services\BarangMasukServiceInterface;
use App\Models\Barang;
use App\Models\BarangMasuk;
use App\Services\Concerns\AppliesQueryFilters;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class BarangMasukService implements BarangMasukServiceInterface
{
    use AppliesQueryFilters;

    public function __construct(
        private readonly BarangMasukRepositoryInterface $barangMasukRepository,
    ) {}

    public function paginate(array $params): LengthAwarePaginator
    {
        $query = $this->barangMasukRepository->query();

        if (! empty($params['search'])) {
            $search = $params['search'];
            $query->where(function ($q) use ($search) {
                $q->where('no_transaksi', 'like', "%{$search}%")
                    ->orWhere('keterangan', 'like', "%{$search}%")
                    ->orWhereHas('supplier', fn ($s) => $s->where('nama_supplier', 'like', "%{$search}%"))
                    ->orWhereHas('details.barang', fn ($b) => $b->where('nama_barang', 'like', "%{$search}%"));
            });
        }

        $sortBy = $params['sort_by'] ?? 'tanggal';
        $sortDir = $params['sort_dir'] ?? 'desc';

        $this->applySort($query, $sortBy, $sortDir, [
            'id',
            'no_transaksi',
            'tanggal',
            'created_at',
        ], 'tanggal');

        return $query
            ->paginate((int) ($params['per_page'] ?? 10))
            ->withQueryString();
    }

    public function generateNoTransaksi(): string
    {
        $prefix = 'BM-'.now()->format('Ymd');
        $last = BarangMasuk::where('no_transaksi', 'like', $prefix.'%')
            ->orderByDesc('no_transaksi')
            ->value('no_transaksi');

        $seq = 1;
        if ($last) {
            $seq = (int) substr($last, -3) + 1;
        }

        return $prefix.str_pad((string) $seq, 3, '0', STR_PAD_LEFT);
    }

    public function store(array $data): BarangMasuk
    {
        return DB::transaction(function () use ($data) {
            $header = $this->barangMasukRepository->create([
                'no_transaksi' => $data['no_transaksi'] ?? $this->generateNoTransaksi(),
                'tanggal'      => $data['tanggal'],
                'supplier_id'  => $data['supplier_id'],
                'gudang_id'    => $data['gudang_id'] ?? null,
                'keterangan'   => $data['keterangan'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $header->details()->create([
                    'barang_id' => $item['barang_id'],
                    'jumlah'    => $item['jumlah'],
                ]);

                $this->adjustStok((int) $item['barang_id'], (float) $item['jumlah']);
            }

            /** @var BarangMasuk */
            return $header->fresh(['supplier', 'gudang', 'details.barang.dimensi', 'details.barang.satuan']);
        });
    }

    public function update(int $id, array $data): BarangMasuk
    {
        return DB::transaction(function () use ($id, $data) {
            /** @var BarangMasuk $header */
            $header = $this->barangMasukRepository->findOrFail($id);
            $header->load('details');

            // 1) Rollback stok lama
            foreach ($header->details as $detail) {
                $this->adjustStok((int) $detail->barang_id, -1 * (float) $detail->jumlah);
            }

            // 2) Hapus detail lama
            $header->details()->delete();

            // 3) Update header
            $header->update([
                'tanggal'     => $data['tanggal'],
                'supplier_id' => $data['supplier_id'],
                'gudang_id'   => $data['gudang_id'] ?? null,
                'keterangan'  => $data['keterangan'] ?? null,
            ]);

            // 4) Insert detail baru + tambah stok
            foreach ($data['items'] as $item) {
                $header->details()->create([
                    'barang_id' => $item['barang_id'],
                    'jumlah'    => $item['jumlah'],
                ]);

                $this->adjustStok((int) $item['barang_id'], (float) $item['jumlah']);
            }

            /** @var BarangMasuk */
            return $header->fresh(['supplier', 'gudang', 'details.barang.dimensi', 'details.barang.satuan']);
        });
    }

    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            /** @var BarangMasuk $header */
            $header = $this->barangMasukRepository->findOrFail($id);
            $header->load('details');

            // Kurangi stok sesuai detail
            foreach ($header->details as $detail) {
                $this->adjustStok((int) $detail->barang_id, -1 * (float) $detail->jumlah);
            }

            return $this->barangMasukRepository->delete($id);
        });
    }

    /**
     * Tambah / kurangi stok barang. Tidak boleh negatif.
     */
    private function adjustStok(int $barangId, float $delta): void
    {
        $barang = Barang::lockForUpdate()->findOrFail($barangId);
        $newStok = (float) $barang->stok + $delta;

        if ($newStok < 0) {
            throw new RuntimeException(
                "Stok barang \"{$barang->nama_barang}\" tidak mencukupi untuk dibatalkan/diubah (stok saat ini: {$barang->stok})."
            );
        }

        $barang->update(['stok' => $newStok]);
    }
}
