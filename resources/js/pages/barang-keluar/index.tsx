import { Head, router, usePage } from '@inertiajs/react';
import { Edit2, Eye, Loader2, PackageMinus, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ApiError, apiDelete, apiPost, apiPut } from '@/lib/api';
import type {
    BarangKeluar,
    BarangKeluarFormData,
    BarangKeluarItemForm,
    BarangOption,
    GudangOption,
} from '@/types/barang-keluar';

interface PageProps {
    gudangList: GudangOption[];
    barangList: BarangOption[];
    nextNoTransaksi: string;
    [key: string]: unknown;
}

function uid(): string {
    return Math.random().toString(36).slice(2, 10);
}

function emptyItem(): BarangKeluarItemForm {
    return { key: uid(), barang_id: null, jumlah: '' };
}

function todayStr(): string {
    return new Date().toISOString().slice(0, 10);
}

function formatDateId(value: string | null | undefined): string {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatQty(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') return '0';
    const n = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(n)) return '0';
    return n.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

interface FormDialogProps {
    open: boolean;
    onClose: () => void;
    editData: BarangKeluar | null;
    onSuccess: () => void;
    gudangList: GudangOption[];
    barangList: BarangOption[];
    nextNoTransaksi: string;
}

function FormDialog({
    open,
    onClose,
    editData,
    onSuccess,
    gudangList,
    barangList,
    nextNoTransaksi,
}: FormDialogProps) {
    const [form, setForm] = useState<BarangKeluarFormData>({
        tanggal: todayStr(),
        gudang_id: null,
        keterangan: '',
        items: [emptyItem()],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (editData) {
            setForm({
                tanggal: editData.tanggal?.slice(0, 10) ?? todayStr(),
                gudang_id: editData.gudang_id,
                keterangan: editData.keterangan ?? '',
                items: editData.details.map((d) => ({
                    key: uid(),
                    barang_id: d.barang_id,
                    jumlah: String(d.jumlah),
                })),
            });
        } else {
            setForm({
                tanggal: todayStr(),
                gudang_id: null,
                keterangan: '',
                items: [emptyItem()],
            });
        }
        setErrors({});
    }, [editData, open]);

    const noTransaksi = editData?.no_transaksi ?? nextNoTransaksi;

    const getBarang = (id: number | null) =>
        id ? (barangList.find((b) => b.id === id) ?? null) : null;

    /** Stok tersedia di form: untuk edit, tambahkan kembali qty lama item yang sama. */
    const availableStok = (barangId: number | null, itemKey: string): number | null => {
        const barang = getBarang(barangId);
        if (!barang) return null;
        let stok = parseFloat(String(barang.stok)) || 0;
        if (editData && barangId) {
            const oldQty = editData.details
                .filter((d) => d.barang_id === barangId)
                .reduce((sum, d) => sum + (parseFloat(String(d.jumlah)) || 0), 0);
            stok += oldQty;
        }
        // Kurangi qty item lain di form yang memilih barang sama
        form.items.forEach((it) => {
            if (it.key !== itemKey && it.barang_id === barangId) {
                stok -= parseFloat(String(it.jumlah)) || 0;
            }
        });
        return stok;
    };

    const updateItem = (key: string, field: keyof BarangKeluarItemForm, value: string | number | null) => {
        setForm((prev) => ({
            ...prev,
            items: prev.items.map((it) => (it.key === key ? { ...it, [field]: value } : it)),
        }));
    };

    const addItem = () => {
        setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
    };

    const removeItem = (key: string) => {
        setForm((prev) => ({
            ...prev,
            items: prev.items.length <= 1 ? prev.items : prev.items.filter((it) => it.key !== key),
        }));
    };

    const handleReset = () => {
        setForm({
            tanggal: todayStr(),
            gudang_id: null,
            keterangan: '',
            items: [emptyItem()],
        });
        setErrors({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // Validasi stok di frontend
        const clientErrors: Record<string, string> = {};
        form.items.forEach((it, idx) => {
            if (!it.barang_id) return;
            const avail = availableStok(it.barang_id, it.key);
            const qty = parseFloat(String(it.jumlah)) || 0;
            if (avail !== null && qty > avail) {
                clientErrors[`items.${idx}.jumlah`] = `Melebihi stok tersedia (${formatQty(avail)})`;
            }
        });
        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            setLoading(false);
            toast.error('Jumlah melebihi stok tersedia.');
            return;
        }

        const payload = {
            tanggal: form.tanggal,
            gudang_id: form.gudang_id,
            keterangan: form.keterangan || null,
            items: form.items.map((it) => ({
                barang_id: it.barang_id,
                jumlah: Number(it.jumlah),
            })),
        };

        try {
            if (editData) {
                await apiPut(`/transaksi/barang-keluar/${editData.id}`, payload);
                toast.success('Barang keluar berhasil diperbarui!');
            } else {
                await apiPost('/transaksi/barang-keluar', payload);
                toast.success('Barang keluar berhasil ditambahkan!');
            }
            onSuccess();
            onClose();
            router.reload({ only: ['barangList', 'nextNoTransaksi'] });
        } catch (err: unknown) {
            const apiErr = err as { status?: number; data?: ApiError & { message?: string } };
            if (apiErr?.status === 422 && apiErr?.data?.errors) {
                const mapped: Record<string, string> = {};
                Object.entries(apiErr.data.errors).forEach(([key, msgs]) => {
                    mapped[key] = msgs[0];
                });
                setErrors(mapped);
            } else if (apiErr?.data?.message) {
                toast.error(apiErr.data.message);
            } else {
                toast.error('Terjadi kesalahan. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                            <PackageMinus className="h-4 w-4 text-primary" />
                        </span>
                        {editData ? 'Edit Barang Keluar' : 'Form Tambah Barang Keluar'}
                    </DialogTitle>
                </DialogHeader>

                <Separator />

                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label>No Transaksi</Label>
                            <Input value={noTransaksi} readOnly className="bg-muted/50 font-mono text-sm" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>
                                Tanggal <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                type="date"
                                value={form.tanggal}
                                onChange={(e) => setForm((p) => ({ ...p, tanggal: e.target.value }))}
                                className={errors.tanggal ? 'border-destructive' : ''}
                            />
                            {errors.tanggal && <p className="text-xs text-destructive">{errors.tanggal}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Lokasi / Cabang</Label>
                            <Select
                                value={form.gudang_id ? String(form.gudang_id) : 'none'}
                                onValueChange={(v) =>
                                    setForm((p) => ({ ...p, gudang_id: v === 'none' ? null : parseInt(v) }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="pilih lokasi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">- pilih lokasi -</SelectItem>
                                    {gudangList.map((g) => (
                                        <SelectItem key={g.id} value={String(g.id)}>
                                            {g.nama_gudang}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">+ Banyak Barang</Label>
                        <Button
                            type="button"
                            onClick={addItem}
                            className="h-8 gap-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Tambah Barang
                        </Button>
                    </div>
                    {errors.items && <p className="text-xs text-destructive">{errors.items}</p>}

                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/40 border-b">
                                <tr>
                                    <th className="px-2 py-2 text-xs font-semibold w-10 text-center">NO</th>
                                    <th className="px-2 py-2 text-xs font-semibold text-left min-w-[180px]">
                                        NAMA BARANG
                                    </th>
                                    <th className="px-2 py-2 text-xs font-semibold text-center w-24">DIMENSI</th>
                                    <th className="px-2 py-2 text-xs font-semibold text-center w-20">SATUAN</th>
                                    <th className="px-2 py-2 text-xs font-semibold text-center w-28">JUMLAH</th>
                                    <th className="px-2 py-2 text-xs font-semibold text-center w-28">
                                        STOK SAAT INI
                                    </th>
                                    <th className="px-2 py-2 text-xs font-semibold text-center w-20">AKSI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {form.items.map((item, idx) => {
                                    const barang = getBarang(item.barang_id);
                                    const stokAvail = availableStok(item.barang_id, item.key);
                                    return (
                                        <tr key={item.key}>
                                            <td className="px-2 py-2 text-center text-xs text-muted-foreground">
                                                {idx + 1}
                                            </td>
                                            <td className="px-2 py-2">
                                                <Select
                                                    value={item.barang_id ? String(item.barang_id) : ''}
                                                    onValueChange={(v) =>
                                                        updateItem(item.key, 'barang_id', parseInt(v))
                                                    }
                                                >
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue placeholder="pilih barang" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {barangList.map((b) => (
                                                            <SelectItem key={b.id} value={String(b.id)}>
                                                                {b.nama_barang} ({b.kode_barang})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors[`items.${idx}.barang_id`] && (
                                                    <p className="text-[10px] text-destructive mt-0.5">
                                                        {errors[`items.${idx}.barang_id`]}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-2 py-2 text-center text-xs text-muted-foreground">
                                                {barang?.dimensi?.nama_dimensi ?? '-'}
                                            </td>
                                            <td className="px-2 py-2 text-center text-xs text-muted-foreground">
                                                {barang?.satuan?.nama_satuan ?? '-'}
                                            </td>
                                            <td className="px-2 py-2">
                                                <Input
                                                    type="number"
                                                    min={0.01}
                                                    step="any"
                                                    value={item.jumlah}
                                                    onChange={(e) =>
                                                        updateItem(item.key, 'jumlah', e.target.value)
                                                    }
                                                    placeholder="0,00"
                                                    className="h-8 text-xs text-center"
                                                />
                                                {errors[`items.${idx}.jumlah`] && (
                                                    <p className="text-[10px] text-destructive mt-0.5">
                                                        {errors[`items.${idx}.jumlah`]}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-2 py-2 text-center text-xs font-medium">
                                                {stokAvail !== null ? formatQty(stokAvail) : '-'}
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(item.key)}
                                                    disabled={form.items.length <= 1}
                                                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold bg-[#ef4444] hover:bg-[#dc2626] text-white disabled:opacity-40"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Keterangan</Label>
                        <textarea
                            value={form.keterangan}
                            onChange={(e) => setForm((p) => ({ ...p, keterangan: e.target.value }))}
                            rows={3}
                            placeholder="tambahkan keterangan (opsional)..."
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-[#16a34a] hover:bg-[#15803d] text-white"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface DetailDialogProps {
    open: boolean;
    data: BarangKeluar | null;
    onClose: () => void;
}

function DetailDialog({ open, data, onClose }: DetailDialogProps) {
    if (!data) return null;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                            <Eye className="h-4 w-4 text-blue-600" />
                        </span>
                        Form Detail Barang Keluar
                    </DialogTitle>
                </DialogHeader>

                <Separator />

                <div className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label>No Transaksi</Label>
                            <Input value={data.no_transaksi} readOnly className="bg-muted/50 font-mono text-sm" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Tanggal</Label>
                            <Input value={formatDateId(data.tanggal)} readOnly className="bg-muted/50" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Lokasi</Label>
                            <Input
                                value={data.gudang?.nama_gudang ?? '-'}
                                readOnly
                                className="bg-muted/50"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/40 border-b">
                                <tr>
                                    <th className="px-2 py-2 text-xs font-semibold w-10 text-center">NO</th>
                                    <th className="px-2 py-2 text-xs font-semibold text-left">NAMA BARANG</th>
                                    <th className="px-2 py-2 text-xs font-semibold text-center">DIMENSI</th>
                                    <th className="px-2 py-2 text-xs font-semibold text-center">SATUAN</th>
                                    <th className="px-2 py-2 text-xs font-semibold text-center">JUMLAH</th>
                                    <th className="px-2 py-2 text-xs font-semibold text-center">STOK SAAT INI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {data.details.map((d, idx) => (
                                    <tr key={d.id}>
                                        <td className="px-2 py-2 text-center text-xs text-muted-foreground">
                                            {idx + 1}
                                        </td>
                                        <td className="px-2 py-2 text-sm">
                                            {d.barang?.nama_barang ?? '-'}
                                        </td>
                                        <td className="px-2 py-2 text-center text-xs text-muted-foreground">
                                            {d.barang?.dimensi?.nama_dimensi ?? '-'}
                                        </td>
                                        <td className="px-2 py-2 text-center text-xs text-muted-foreground">
                                            {d.barang?.satuan?.nama_satuan ?? '-'}
                                        </td>
                                        <td className="px-2 py-2 text-center text-sm font-medium">
                                            {formatQty(d.jumlah)}
                                        </td>
                                        <td className="px-2 py-2 text-center text-xs font-medium">
                                            {d.barang ? formatQty(d.barang.stok) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Keterangan</Label>
                        <textarea
                            value={data.keterangan ?? ''}
                            readOnly
                            rows={3}
                            className="w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm resize-none"
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button variant="outline" onClick={onClose}>
                            Kembali
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface DeleteDialogProps {
    open: boolean;
    data: BarangKeluar | null;
    onClose: () => void;
    onSuccess: () => void;
}

function DeleteDialog({ open, data, onClose, onSuccess }: DeleteDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!data) return;
        setLoading(true);
        try {
            await apiDelete(`/transaksi/barang-keluar/${data.id}`);
            toast.success('Barang keluar berhasil dihapus. Stok telah dikembalikan.');
            onSuccess();
            onClose();
            router.reload({ only: ['barangList', 'nextNoTransaksi'] });
        } catch (err: unknown) {
            const apiErr = err as { data?: { message?: string } };
            toast.error(apiErr?.data?.message ?? 'Gagal menghapus barang keluar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Hapus Barang Keluar</DialogTitle>
                </DialogHeader>
                <Separator />
                <p className="text-sm text-muted-foreground py-2">
                    Hapus transaksi <strong>{data?.no_transaksi}</strong>? Stok barang terkait akan
                    dikembalikan.
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Batal
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Hapus
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

type FlatRow = {
    id: string;
    transaksi: BarangKeluar;
    detail: BarangKeluar['details'][0];
    detailIndex: number;
    isFirst: boolean;
    rowspan: number;
};

export default function BarangKeluarIndex() {
    const { gudangList, barangList, nextNoTransaksi } = usePage<PageProps>().props;

    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [formOpen, setFormOpen] = useState(false);
    const [editData, setEditData] = useState<BarangKeluar | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailData, setDetailData] = useState<BarangKeluar | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<BarangKeluar | null>(null);
    const [rawRows, setRawRows] = useState<BarangKeluar[]>([]);

    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [meta, setMeta] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: null as number | null,
        to: null as number | null,
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                search,
                page: String(page),
                per_page: String(perPage),
                sort_by: 'tanggal',
                sort_dir: 'desc',
            });
            const res = await fetch(`/transaksi/barang-keluar/datatable?${params}`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            const json = await res.json();
            setRawRows(json.data ?? []);
            if (json.meta) setMeta(json.meta);
        } catch {
            toast.error('Gagal memuat data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, page, perPage, refreshTrigger]);

    const flatRows: FlatRow[] = useMemo(() => {
        const rows: FlatRow[] = [];
        rawRows.forEach((trx) => {
            const details = trx.details?.length ? trx.details : [];
            const rowspan = Math.max(details.length, 1);
            if (details.length === 0) {
                rows.push({
                    id: `${trx.id}-empty`,
                    transaksi: trx,
                    detail: { id: 0, barang_id: 0, jumlah: '0' },
                    detailIndex: 0,
                    isFirst: true,
                    rowspan: 1,
                });
            } else {
                details.forEach((d, i) => {
                    rows.push({
                        id: `${trx.id}-${d.id}`,
                        transaksi: trx,
                        detail: d,
                        detailIndex: i,
                        isFirst: i === 0,
                        rowspan,
                    });
                });
            }
        });
        return rows;
    }, [rawRows]);

    const handleSuccess = () => setRefreshTrigger((p) => p + 1);

    return (
        <>
            <Head title="Barang Keluar" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Barang Keluar</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Transaksi pengeluaran barang. Stok master otomatis dikurangi.
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditData(null);
                            setFormOpen(true);
                        }}
                        className="mt-3 sm:mt-0 gap-2 self-start sm:self-auto bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah
                    </Button>
                </div>

                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b bg-muted/20">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Show</span>
                            <Select
                                value={String(perPage)}
                                onValueChange={(v) => {
                                    setPerPage(Number(v));
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="h-8 w-[68px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 25, 50].map((n) => (
                                        <SelectItem key={n} value={String(n)}>
                                            {n}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span>Entries</span>
                        </div>
                        <Input
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="h-8 sm:max-w-xs"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b bg-muted/40">
                                <tr>
                                    {[
                                        'NO',
                                        'TANGGAL',
                                        'NO TRANSAKSI',
                                        'NAMA BARANG',
                                        'DIMENSI',
                                        'SATUAN',
                                        'JUMLAH',
                                        'LOKASI',
                                        'AKSI',
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-left"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                                                <span className="text-sm">Memuat data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : flatRows.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="px-4 py-16 text-center text-sm text-muted-foreground"
                                        >
                                            Belum ada transaksi barang keluar.
                                        </td>
                                    </tr>
                                ) : (
                                    flatRows.map((row) => (
                                        <tr key={row.id} className="hover:bg-muted/30">
                                            {row.isFirst && (
                                                <>
                                                    <td
                                                        rowSpan={row.rowspan}
                                                        className="px-3 py-2 text-xs font-mono text-muted-foreground align-top"
                                                    >
                                                        {(meta.from ?? 1) +
                                                            rawRows.findIndex(
                                                                (r) => r.id === row.transaksi.id,
                                                            )}
                                                    </td>
                                                    <td
                                                        rowSpan={row.rowspan}
                                                        className="px-3 py-2 text-xs align-top whitespace-nowrap"
                                                    >
                                                        {formatDateId(row.transaksi.tanggal)}
                                                    </td>
                                                    <td
                                                        rowSpan={row.rowspan}
                                                        className="px-3 py-2 text-xs font-mono font-semibold align-top whitespace-nowrap"
                                                    >
                                                        {row.transaksi.no_transaksi}
                                                    </td>
                                                </>
                                            )}
                                            <td className="px-3 py-2 text-sm">
                                                {row.detail.barang?.nama_barang ?? '-'}
                                            </td>
                                            <td className="px-3 py-2 text-xs text-center text-muted-foreground">
                                                {row.detail.barang?.dimensi?.nama_dimensi ?? '-'}
                                            </td>
                                            <td className="px-3 py-2 text-xs text-center text-muted-foreground">
                                                {row.detail.barang?.satuan?.nama_satuan ?? '-'}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-center font-medium">
                                                {formatQty(row.detail.jumlah)}
                                            </td>
                                            {row.isFirst && (
                                                <>
                                                    <td
                                                        rowSpan={row.rowspan}
                                                        className="px-3 py-2 text-xs align-top"
                                                    >
                                                        {row.transaksi.gudang?.nama_gudang ?? '-'}
                                                    </td>
                                                    <td
                                                        rowSpan={row.rowspan}
                                                        className="px-3 py-2 align-top"
                                                    >
                                                        <div className="flex items-center gap-1 flex-wrap">
                                                            <button
                                                                onClick={() => {
                                                                    setDetailData(row.transaksi);
                                                                    setDetailOpen(true);
                                                                }}
                                                                className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
                                                            >
                                                                <Eye className="h-3 w-3" />
                                                                Detail
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditData(row.transaksi);
                                                                    setFormOpen(true);
                                                                }}
                                                                className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold bg-[#f59e0b] hover:bg-[#d97706] text-white"
                                                            >
                                                                <Edit2 className="h-3 w-3" />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setDeleteTarget(row.transaksi);
                                                                    setDeleteOpen(true);
                                                                }}
                                                                className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold bg-[#ef4444] hover:bg-[#dc2626] text-white"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between bg-muted/10">
                        <p className="text-xs text-muted-foreground">
                            {meta.total > 0
                                ? `Showing ${meta.from ?? 0} to ${meta.to ?? 0} of ${meta.total} entries`
                                : 'No data available'}
                        </p>
                        {meta.last_page > 1 && (
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={meta.current_page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    Previous
                                </Button>
                                <span className="px-2 text-xs font-medium">{meta.current_page}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={meta.current_page >= meta.last_page}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <FormDialog
                open={formOpen}
                onClose={() => setFormOpen(false)}
                editData={editData}
                onSuccess={handleSuccess}
                gudangList={gudangList}
                barangList={barangList}
                nextNoTransaksi={nextNoTransaksi}
            />

            <DetailDialog open={detailOpen} data={detailData} onClose={() => setDetailOpen(false)} />

            <DeleteDialog
                open={deleteOpen}
                data={deleteTarget}
                onClose={() => setDeleteOpen(false)}
                onSuccess={handleSuccess}
            />
        </>
    );
}

BarangKeluarIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Transaksi', href: '#' },
        { title: 'Barang Keluar', href: '/transaksi/barang-keluar' },
    ],
};
