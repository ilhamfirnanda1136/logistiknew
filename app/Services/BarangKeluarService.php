<?php

namespace App\Services;

use App\Contracts\Repositories\BarangKeluarRepositoryInterface;
use App\Contracts\Services\BarangKeluarServiceInterface;
use App\Models\Barang;
use App\Models\BarangKeluar;
use App\Services\Concerns\AppliesQueryFilters;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class BarangKeluarService implements BarangKeluarServiceInterface
{
    use AppliesQueryFilters;

    public function __construct(
        private readonly BarangKeluarRepositoryInterface $barangKeluarRepository,
    ) {}

    public function paginate(array $params): LengthAwarePaginator
    {
        $query = $this->barangKeluarRepository->query();

        if (! empty($params['search'])) {
            $search = $params['search'];
            $query->where(function ($q) use ($search) {
                $q->where('no_transaksi', 'like', "%{$search}%")
                    ->orWhere('keterangan', 'like', "%{$search}%")
                    ->orWhereHas('gudang', fn ($g) => $g->where('nama_gudang', 'like', "%{$search}%"))
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
        $prefix = 'BK-'.now()->format('Ymd');
        $last = BarangKeluar::where('no_transaksi', 'like', $prefix.'%')
            ->orderByDesc('no_transaksi')
            ->value('no_transaksi');

        $seq = 1;
        if ($last) {
            $seq = (int) substr($last, -3) + 1;
        }

        return $prefix.str_pad((string) $seq, 3, '0', STR_PAD_LEFT);
    }

    public function store(array $data): BarangKeluar
    {
        return DB::transaction(function () use ($data) {
            $header = $this->barangKeluarRepository->create([
                'no_transaksi' => $data['no_transaksi'] ?? $this->generateNoTransaksi(),
                'tanggal'      => $data['tanggal'],
                'gudang_id'    => $data['gudang_id'] ?? null,
                'keterangan'   => $data['keterangan'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                // Kurangi stok (validasi stok cukup di dalamnya)
                $this->adjustStok((int) $item['barang_id'], -1 * (float) $item['jumlah']);

                $header->details()->create([
                    'barang_id' => $item['barang_id'],
                    'jumlah'    => $item['jumlah'],
                ]);
            }

            /** @var BarangKeluar */
            return $header->fresh(['gudang', 'details.barang.dimensi', 'details.barang.satuan']);
        });
    }

    public function update(int $id, array $data): BarangKeluar
    {
        return DB::transaction(function () use ($id, $data) {
            /** @var BarangKeluar $header */
            $header = $this->barangKeluarRepository->findOrFail($id);
            $header->load('details');

            // 1) Kembalikan stok lama (batalkan pengurangan sebelumnya)
            foreach ($header->details as $detail) {
                $this->adjustStok((int) $detail->barang_id, (float) $detail->jumlah);
            }

            // 2) Hapus detail lama
            $header->details()->delete();

            // 3) Update header
            $header->update([
                'tanggal'    => $data['tanggal'],
                'gudang_id'  => $data['gudang_id'] ?? null,
                'keterangan' => $data['keterangan'] ?? null,
            ]);

            // 4) Insert detail baru + kurangi stok
            foreach ($data['items'] as $item) {
                $this->adjustStok((int) $item['barang_id'], -1 * (float) $item['jumlah']);

                $header->details()->create([
                    'barang_id' => $item['barang_id'],
                    'jumlah'    => $item['jumlah'],
                ]);
            }

            /** @var BarangKeluar */
            return $header->fresh(['gudang', 'details.barang.dimensi', 'details.barang.satuan']);
        });
    }

    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            /** @var BarangKeluar $header */
            $header = $this->barangKeluarRepository->findOrFail($id);
            $header->load('details');

            // Kembalikan stok
            foreach ($header->details as $detail) {
                $this->adjustStok((int) $detail->barang_id, (float) $detail->jumlah);
            }

            return $this->barangKeluarRepository->delete($id);
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
                "Stok barang \"{$barang->nama_barang}\" tidak mencukupi (stok saat ini: {$barang->stok})."
            );
        }

        $barang->update(['stok' => $newStok]);
    }
}
