import { Head, usePage } from '@inertiajs/react';
import {
    Car,
    Edit2,
    Eye,
    Loader2,
    Plus,
    RefreshCw,
    Search,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ColumnDef, ServerDataTable } from '@/components/server-datatable';
import { ApiError, apiDelete, apiPost, apiPut } from '@/lib/api';
import type {
    GudangOption,
    KategoriOption,
    Kendaraan,
    KendaraanFilters,
    KendaraanFormData,
    KondisiOption,
} from '@/types/kendaraan';

const EMPTY_FORM: KendaraanFormData = {
    kode_kendaraan: '',
    nama_kendaraan: '',
    no_polisi: '',
    no_rangka: '',
    no_mesin: '',
    warna: '',
    jumlah: 1,
    tanggal_input: '',
    tahun_perolehan: '',
    harga_perolehan: '',
    isi_silinder: '',
    masa_pakai: '',
    kondisi_id: null,
    gudang_id: null,
    kategori_id: null,
    keterangan: '',
};

interface PageProps {
    kondisiList: KondisiOption[];
    gudangList: GudangOption[];
    kategoriList: KategoriOption[];
    [key: string]: unknown;
}

function formatDate(value: string | null | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatRupiah(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') return '-';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(num)) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
}

function KondisiBadge({ nama }: { nama: string }) {
    const key = nama.toLowerCase();
    if (key.includes('baik') || key.includes('tersedia')) {
        return (
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {nama}
            </span>
        );
    }
    if (key.includes('rusak')) {
        return (
            <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                {nama}
            </span>
        );
    }
    if (key.includes('hilang')) {
        return (
            <span className="inline-flex items-center rounded-full bg-gray-500/10 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                {nama}
            </span>
        );
    }
    return (
        <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
            {nama}
        </span>
    );
}

function rowToForm(row: Kendaraan): KendaraanFormData {
    return {
        kode_kendaraan: row.kode_kendaraan,
        nama_kendaraan: row.nama_kendaraan,
        no_polisi: row.no_polisi ?? '',
        no_rangka: row.no_rangka ?? '',
        no_mesin: row.no_mesin ?? '',
        warna: row.warna ?? '',
        jumlah: row.jumlah ?? 1,
        tanggal_input: row.tanggal_input ?? '',
        tahun_perolehan: row.tahun_perolehan ? String(row.tahun_perolehan) : '',
        harga_perolehan: row.harga_perolehan ?? '',
        isi_silinder: row.isi_silinder ?? '',
        masa_pakai: row.masa_pakai ?? '',
        kondisi_id: row.kondisi_id ?? null,
        gudang_id: row.gudang_id ?? null,
        kategori_id: row.kategori_id ?? null,
        keterangan: row.keterangan ?? '',
    };
}

interface FormFieldsProps {
    form: KendaraanFormData;
    errors: Partial<Record<keyof KendaraanFormData, string>>;
    onChange: (field: keyof KendaraanFormData, value: string | number | null) => void;
    onSubmit?: (e: React.FormEvent) => void;
    loading?: boolean;
    onClose?: () => void;
    kondisiList: KondisiOption[];
    gudangList: GudangOption[];
    kategoriList: KategoriOption[];
    readOnly?: boolean;
}

function KendaraanFormFields({
    form,
    errors,
    onChange,
    onSubmit,
    loading,
    onClose,
    kondisiList,
    gudangList,
    kategoriList,
    readOnly = false,
}: FormFieldsProps) {
    const ro = readOnly;

    const content = (
        <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Left column */}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Kode Kendaraan {!ro && <span className="text-destructive">*</span>}</Label>
                        <Input
                            value={form.kode_kendaraan}
                            onChange={(e) => onChange('kode_kendaraan', e.target.value)}
                            placeholder="masukan kode kendaraan"
                            disabled={ro}
                            readOnly={ro}
                            className={errors.kode_kendaraan ? 'border-destructive' : ''}
                        />
                        {errors.kode_kendaraan && <p className="text-xs text-destructive">{errors.kode_kendaraan}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Nama Kendaraan {!ro && <span className="text-destructive">*</span>}</Label>
                        <Input
                            value={form.nama_kendaraan}
                            onChange={(e) => onChange('nama_kendaraan', e.target.value)}
                            placeholder="masukan nama kendaraan"
                            disabled={ro}
                            readOnly={ro}
                            className={errors.nama_kendaraan ? 'border-destructive' : ''}
                        />
                        {errors.nama_kendaraan && <p className="text-xs text-destructive">{errors.nama_kendaraan}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label>No Polisi</Label>
                        <Input
                            value={form.no_polisi}
                            onChange={(e) => onChange('no_polisi', e.target.value)}
                            placeholder="masukan no polisi"
                            disabled={ro}
                            readOnly={ro}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>No Rangka</Label>
                        <Input
                            value={form.no_rangka}
                            onChange={(e) => onChange('no_rangka', e.target.value)}
                            placeholder="masukan no rangka"
                            disabled={ro}
                            readOnly={ro}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>No Mesin</Label>
                        <Input
                            value={form.no_mesin}
                            onChange={(e) => onChange('no_mesin', e.target.value)}
                            placeholder="masukan no mesin"
                            disabled={ro}
                            readOnly={ro}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Warna</Label>
                        <Input
                            value={form.warna}
                            onChange={(e) => onChange('warna', e.target.value)}
                            placeholder="masukan warna"
                            disabled={ro}
                            readOnly={ro}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Jumlah</Label>
                        <Input
                            type="number"
                            min={0}
                            value={form.jumlah}
                            onChange={(e) => onChange('jumlah', parseInt(e.target.value) || 0)}
                            disabled={ro}
                            readOnly={ro}
                        />
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Tanggal Input</Label>
                        <Input
                            type="date"
                            value={form.tanggal_input}
                            onChange={(e) => onChange('tanggal_input', e.target.value)}
                            disabled={ro}
                            readOnly={ro}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Tahun Perolehan</Label>
                        <Input
                            type="number"
                            min={1900}
                            max={2100}
                            value={form.tahun_perolehan}
                            onChange={(e) => onChange('tahun_perolehan', e.target.value)}
                            placeholder="tttt"
                            disabled={ro}
                            readOnly={ro}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Harga Perolehan</Label>
                        {ro ? (
                            <Input value={formatRupiah(form.harga_perolehan)} readOnly />
                        ) : (
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                                <Input
                                    type="number"
                                    min={0}
                                    value={form.harga_perolehan}
                                    onChange={(e) => onChange('harga_perolehan', e.target.value)}
                                    className="pl-9"
                                    placeholder="0"
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Isi Silinder ( cc )</Label>
                        <Input
                            value={form.isi_silinder}
                            onChange={(e) => onChange('isi_silinder', e.target.value)}
                            placeholder="contoh: 1500"
                            disabled={ro}
                            readOnly={ro}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Kondisi</Label>
                        {ro ? (
                            <Input value={kondisiList.find((k) => k.id === form.kondisi_id)?.nama_kondisi ?? '-'} readOnly />
                        ) : (
                            <Select
                                value={form.kondisi_id ? String(form.kondisi_id) : 'none'}
                                onValueChange={(v) => onChange('kondisi_id', v === 'none' ? null : parseInt(v))}
                            >
                                <SelectTrigger><SelectValue placeholder="pilih kondisi" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">- pilih kondisi -</SelectItem>
                                    {kondisiList.map((k) => (
                                        <SelectItem key={k.id} value={String(k.id)}>{k.nama_kondisi}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Masa Pakai</Label>
                        <Input
                            value={form.masa_pakai}
                            onChange={(e) => onChange('masa_pakai', e.target.value)}
                            placeholder="contoh: 5 tahun"
                            disabled={ro}
                            readOnly={ro}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Lokasi</Label>
                        {ro ? (
                            <Input value={gudangList.find((g) => g.id === form.gudang_id)?.nama_gudang ?? '-'} readOnly />
                        ) : (
                            <Select
                                value={form.gudang_id ? String(form.gudang_id) : 'none'}
                                onValueChange={(v) => onChange('gudang_id', v === 'none' ? null : parseInt(v))}
                            >
                                <SelectTrigger><SelectValue placeholder="pilih lokasi" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">- pilih lokasi -</SelectItem>
                                    {gudangList.map((g) => (
                                        <SelectItem key={g.id} value={String(g.id)}>{g.nama_gudang}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Kategori</Label>
                        {ro ? (
                            <Input value={kategoriList.find((k) => k.id === form.kategori_id)?.nama_kategori ?? '-'} readOnly />
                        ) : (
                            <Select
                                value={form.kategori_id ? String(form.kategori_id) : 'none'}
                                onValueChange={(v) => onChange('kategori_id', v === 'none' ? null : parseInt(v))}
                            >
                                <SelectTrigger><SelectValue placeholder="pilih kategori" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">- pilih kategori -</SelectItem>
                                    {kategoriList.map((k) => (
                                        <SelectItem key={k.id} value={String(k.id)}>{k.nama_kategori}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-1.5">
                <Label>Keterangan</Label>
                <textarea
                    value={form.keterangan}
                    onChange={(e) => onChange('keterangan', e.target.value)}
                    placeholder="tambahkan keterangan (opsional)..."
                    rows={3}
                    disabled={ro}
                    readOnly={ro}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                />
            </div>

            {!readOnly && (
                <div className="flex justify-end gap-2 pt-1">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-[#16a34a] hover:bg-[#15803d] text-white">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan
                    </Button>
                </div>
            )}
        </div>
    );

    if (readOnly || !onSubmit) return content;
    return <form onSubmit={onSubmit}>{content}</form>;
}

interface FormDialogProps {
    open: boolean;
    onClose: () => void;
    editData: Kendaraan | null;
    onSuccess: () => void;
    kondisiList: KondisiOption[];
    gudangList: GudangOption[];
    kategoriList: KategoriOption[];
}

function FormDialog({ open, onClose, editData, onSuccess, kondisiList, gudangList, kategoriList }: FormDialogProps) {
    const [form, setForm] = useState<KendaraanFormData>(EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof KendaraanFormData, string>>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editData) {
            setForm(rowToForm(editData));
        } else {
            setForm(EMPTY_FORM);
        }
        setErrors({});
    }, [editData, open]);

    const handleChange = (field: keyof KendaraanFormData, value: string | number | null) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            if (editData) {
                await apiPut(`/kendaraan-dinas/${editData.id}`, form);
                toast.success('Kendaraan berhasil diperbarui!');
            } else {
                await apiPost('/kendaraan-dinas', form);
                toast.success('Kendaraan berhasil ditambahkan!');
            }
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const apiErr = err as { status?: number; data?: ApiError };
            if (apiErr?.status === 422 && apiErr?.data?.errors) {
                const mapped: Partial<Record<keyof KendaraanFormData, string>> = {};
                Object.entries(apiErr.data.errors).forEach(([key, msgs]) => {
                    mapped[key as keyof KendaraanFormData] = msgs[0];
                });
                setErrors(mapped);
            } else {
                toast.error('Terjadi kesalahan. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                            <Car className="h-4 w-4 text-primary" />
                        </span>
                        {editData ? 'Edit Kendaraan' : 'Form Tambah Kendaraan'}
                    </DialogTitle>
                </DialogHeader>
                <Separator />
                <KendaraanFormFields
                    form={form}
                    errors={errors}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    loading={loading}
                    onClose={onClose}
                    kondisiList={kondisiList}
                    gudangList={gudangList}
                    kategoriList={kategoriList}
                />
            </DialogContent>
        </Dialog>
    );
}

interface DetailDialogProps {
    open: boolean;
    data: Kendaraan | null;
    onClose: () => void;
    kondisiList: KondisiOption[];
    gudangList: GudangOption[];
    kategoriList: KategoriOption[];
}

function DetailDialog({ open, data, onClose, kondisiList, gudangList, kategoriList }: DetailDialogProps) {
    if (!data) return null;
    const form = rowToForm(data);

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                            <Eye className="h-4 w-4 text-primary" />
                        </span>
                        Form Detail Kendaraan
                    </DialogTitle>
                </DialogHeader>
                <Separator />
                <KendaraanFormFields
                    form={form}
                    errors={{}}
                    onChange={() => {}}
                    kondisiList={kondisiList}
                    gudangList={gudangList}
                    kategoriList={kategoriList}
                    readOnly
                />
                <div className="flex justify-end pt-2">
                    <Button
                        type="button"
                        onClick={onClose}
                        className="bg-[#f59e0b] hover:bg-[#d97706] text-white"
                    >
                        Kembali
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface DeleteDialogProps {
    open: boolean;
    kendaraan: Kendaraan | null;
    onClose: () => void;
    onSuccess: () => void;
}

function DeleteDialog({ open, kendaraan, onClose, onSuccess }: DeleteDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!kendaraan) return;
        setLoading(true);
        try {
            await apiDelete(`/kendaraan-dinas/${kendaraan.id}`);
            toast.success('Kendaraan berhasil dihapus.');
            onSuccess();
            onClose();
        } catch {
            toast.error('Gagal menghapus kendaraan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Hapus Kendaraan</DialogTitle>
                </DialogHeader>
                <Separator />
                <p className="text-sm text-muted-foreground py-2">
                    Hapus kendaraan <strong>{kendaraan?.nama_kendaraan}</strong>?
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Hapus
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function KendaraanIndex() {
    const { kondisiList, gudangList, kategoriList } = usePage<PageProps>().props;

    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [formOpen, setFormOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editData, setEditData] = useState<Kendaraan | null>(null);
    const [detailData, setDetailData] = useState<Kendaraan | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Kendaraan | null>(null);

    const [draftFilters, setDraftFilters] = useState<KendaraanFilters>({});
    const [appliedFilters, setAppliedFilters] = useState<KendaraanFilters>({});

    const extraParams = useMemo(() => {
        const params: Record<string, string> = {};
        if (appliedFilters.gudang_id) params.gudang_id = appliedFilters.gudang_id;
        if (appliedFilters.kategori_id) params.kategori_id = appliedFilters.kategori_id;
        return params;
    }, [appliedFilters]);

    const handleFilter = () => {
        setAppliedFilters({ ...draftFilters });
        setRefreshTrigger((p) => p + 1);
    };

    const handleRefresh = () => {
        setDraftFilters({});
        setAppliedFilters({});
        setRefreshTrigger((p) => p + 1);
    };

    const handleSuccess = () => setRefreshTrigger((p) => p + 1);

    const columns: ColumnDef<Kendaraan>[] = [
        {
            id: 'id',
            label: 'NO',
            sortable: true,
            align: 'center',
            width: 'w-12',
            render: (_row, _index, from) => (
                <span className="text-muted-foreground text-xs font-mono">
                    {from !== null ? from + _index : ''}
                </span>
            ),
        },
        {
            id: 'kode_kendaraan',
            label: 'KODE',
            sortable: true,
            render: (row) => <span className="font-mono text-xs font-semibold">{row.kode_kendaraan}</span>,
        },
        {
            id: 'tanggal_input',
            label: 'TANGGAL',
            sortable: true,
            render: (row) => <span className="text-xs">{formatDate(row.tanggal_input)}</span>,
        },
        {
            id: 'nama_kendaraan',
            label: 'NAMA KENDARAAN',
            sortable: true,
            render: (row) => <span className="font-medium text-sm">{row.nama_kendaraan}</span>,
        },
        {
            id: 'no_polisi',
            label: 'NO POLISI',
            render: (row) => <span className="text-xs font-mono">{row.no_polisi ?? '-'}</span>,
        },
        {
            id: 'no_rangka',
            label: 'NO RANGKA',
            render: (row) => (
                <span className="text-xs max-w-[120px] truncate block">{row.no_rangka ?? '-'}</span>
            ),
        },
        {
            id: 'no_mesin',
            label: 'NO MESIN',
            render: (row) => (
                <span className="text-xs max-w-[120px] truncate block">{row.no_mesin ?? '-'}</span>
            ),
        },
        {
            id: 'warna',
            label: 'WARNA',
            align: 'center',
            render: (row) => <span className="text-xs">{row.warna ?? '-'}</span>,
        },
        {
            id: 'isi_silinder',
            label: 'ISI SILINDER',
            align: 'center',
            render: (row) => <span className="text-xs">{row.isi_silinder ?? '-'}</span>,
        },
        {
            id: 'tahun_perolehan',
            label: 'TH PEROLEHAN',
            sortable: true,
            align: 'center',
            render: (row) => <span className="text-xs">{row.tahun_perolehan ?? '-'}</span>,
        },
        {
            id: 'gudang',
            label: 'LOKASI',
            align: 'center',
            render: (row) => <span className="text-xs">{row.gudang?.nama_gudang ?? '-'}</span>,
        },
        {
            id: 'kondisi',
            label: 'KONDISI',
            align: 'center',
            render: (row) =>
                row.kondisi ? (
                    <KondisiBadge nama={row.kondisi.nama_kondisi} />
                ) : (
                    <span className="italic text-muted-foreground text-xs">-</span>
                ),
        },
        {
            id: 'actions',
            label: 'AKSI',
            align: 'center',
            render: (row) => (
                <div className="flex items-center justify-center gap-1">
                    <button
                        onClick={() => { setDetailData(row); setDetailOpen(true); }}
                        className="inline-flex items-center justify-center rounded p-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                        title="Detail"
                    >
                        <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => { setEditData(row); setFormOpen(true); }}
                        className="inline-flex items-center justify-center rounded p-1.5 bg-[#f59e0b] hover:bg-[#d97706] text-white"
                        title="Edit"
                    >
                        <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => { setDeleteTarget(row); setDeleteOpen(true); }}
                        className="inline-flex items-center justify-center rounded p-1.5 bg-[#ef4444] hover:bg-[#dc2626] text-white"
                        title="Hapus"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Data Kendaraan" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Data Kendaraan</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Kelola data kendaraan dinas perusahaan.
                        </p>
                    </div>
                    <Button
                        onClick={() => { setEditData(null); setFormOpen(true); }}
                        className="mt-3 sm:mt-0 gap-2 self-start sm:self-auto bg-[#16a34a] hover:bg-[#15803d] text-white"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah
                    </Button>
                </div>

                {/* Filter bar */}
                <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
                    <div className="space-y-1.5 min-w-[180px]">
                        <Label className="text-xs text-muted-foreground">Lokasi</Label>
                        <Select
                            value={draftFilters.gudang_id ?? 'all'}
                            onValueChange={(v) =>
                                setDraftFilters((prev) => ({
                                    ...prev,
                                    gudang_id: v === 'all' ? undefined : v,
                                }))
                            }
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="-- pilih semua lokasi --" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">-- pilih semua lokasi --</SelectItem>
                                {gudangList.map((g) => (
                                    <SelectItem key={g.id} value={String(g.id)}>{g.nama_gudang}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5 min-w-[180px]">
                        <Label className="text-xs text-muted-foreground">Kategori Asset</Label>
                        <Select
                            value={draftFilters.kategori_id ?? 'all'}
                            onValueChange={(v) =>
                                setDraftFilters((prev) => ({
                                    ...prev,
                                    kategori_id: v === 'all' ? undefined : v,
                                }))
                            }
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="-- pilih Kategori asset --" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">-- pilih Kategori asset --</SelectItem>
                                {kategoriList.map((k) => (
                                    <SelectItem key={k.id} value={String(k.id)}>{k.nama_kategori}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleFilter}
                        className="h-9 gap-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                    >
                        <Search className="h-3.5 w-3.5" />
                        filter
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        className="h-9 gap-1.5 bg-gray-700 hover:bg-gray-800 text-white border-0"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        refresh
                    </Button>
                </div>

                <ServerDataTable<Kendaraan>
                    endpoint="/kendaraan-dinas/datatable"
                    columns={columns}
                    refreshTrigger={refreshTrigger}
                    extraParams={extraParams}
                    emptyStateIcon={<Car className="h-7 w-7" />}
                    emptyStateTitle="Tidak ada data kendaraan"
                    emptyStateMessage="Belum ada kendaraan yang ditambahkan."
                />
            </div>

            <FormDialog
                open={formOpen}
                onClose={() => setFormOpen(false)}
                editData={editData}
                onSuccess={handleSuccess}
                kondisiList={kondisiList}
                gudangList={gudangList}
                kategoriList={kategoriList}
            />

            <DetailDialog
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                data={detailData}
                kondisiList={kondisiList}
                gudangList={gudangList}
                kategoriList={kategoriList}
            />

            <DeleteDialog
                open={deleteOpen}
                kendaraan={deleteTarget}
                onClose={() => setDeleteOpen(false)}
                onSuccess={handleSuccess}
            />
        </>
    );
}

KendaraanIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Asset', href: '#' },
        { title: 'Kendaraan Dinas', href: '/kendaraan-dinas' },
    ],
};
