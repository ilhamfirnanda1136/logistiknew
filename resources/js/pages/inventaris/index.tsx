import { Head, usePage } from '@inertiajs/react';
import {
    Cpu,
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
    DimensiOption,
    GudangOption,
    Inventaris,
    InventarisFilters,
    InventarisFormData,
    KategoriOption,
    KondisiOption,
    SatuanOption,
} from '@/types/inventaris';

const EMPTY_FORM: InventarisFormData = {
    kode_barang: '',
    tanggal_input: '',
    tanggal_perolehan: '',
    no_inventaris: '',
    nama_inventaris: '',
    merek: '',
    jumlah: 0,
    dimensi_id: null,
    satuan_id: null,
    kategori_id: null,
    kondisi_id: null,
    gudang_id: null,
    keterangan: '',
};

interface PageProps {
    dimensiList: DimensiOption[];
    satuanList: SatuanOption[];
    kategoriList: KategoriOption[];
    kondisiList: KondisiOption[];
    gudangList: GudangOption[];
    [key: string]: unknown;
}

function formatDate(value: string | null | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function KondisiBadge({ nama }: { nama: string }) {
    const key = nama.toLowerCase();
    if (key.includes('baik')) {
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

function rowToForm(row: Inventaris): InventarisFormData {
    return {
        kode_barang: row.kode_barang,
        tanggal_input: row.tanggal_input ?? '',
        tanggal_perolehan: row.tanggal_perolehan ?? '',
        no_inventaris: row.no_inventaris ?? '',
        nama_inventaris: row.nama_inventaris,
        merek: row.merek ?? '',
        jumlah: row.jumlah ?? 0,
        dimensi_id: row.dimensi_id ?? null,
        satuan_id: row.satuan_id ?? null,
        kategori_id: row.kategori_id ?? null,
        kondisi_id: row.kondisi_id ?? null,
        gudang_id: row.gudang_id ?? null,
        keterangan: row.keterangan ?? '',
    };
}

interface FormDialogProps {
    open: boolean;
    onClose: () => void;
    editData: Inventaris | null;
    onSuccess: () => void;
    dimensiList: DimensiOption[];
    satuanList: SatuanOption[];
    kategoriList: KategoriOption[];
    kondisiList: KondisiOption[];
    gudangList: GudangOption[];
}

function FormDialog({
    open,
    onClose,
    editData,
    onSuccess,
    dimensiList,
    satuanList,
    kategoriList,
    kondisiList,
    gudangList,
}: FormDialogProps) {
    const [form, setForm] = useState<InventarisFormData>(EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof InventarisFormData, string>>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editData) {
            setForm(rowToForm(editData));
        } else {
            setForm(EMPTY_FORM);
        }
        setErrors({});
    }, [editData, open]);

    const handleChange = (field: keyof InventarisFormData, value: string | number | null) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            if (editData) {
                await apiPut(`/asset/${editData.id}`, form);
                toast.success('Inventaris berhasil diperbarui!');
            } else {
                await apiPost('/asset', form);
                toast.success('Inventaris berhasil ditambahkan!');
            }
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const apiErr = err as { status?: number; data?: ApiError };
            if (apiErr?.status === 422 && apiErr?.data?.errors) {
                const mapped: Partial<Record<keyof InventarisFormData, string>> = {};
                Object.entries(apiErr.data.errors).forEach(([key, msgs]) => {
                    mapped[key as keyof InventarisFormData] = msgs[0];
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
                            <Cpu className="h-4 w-4 text-primary" />
                        </span>
                        {editData ? 'Edit Inventaris' : 'Form Tambah Inventaris'}
                    </DialogTitle>
                </DialogHeader>
                <Separator />
                <InventarisFormFields
                    form={form}
                    errors={errors}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    loading={loading}
                    onClose={onClose}
                    dimensiList={dimensiList}
                    satuanList={satuanList}
                    kategoriList={kategoriList}
                    kondisiList={kondisiList}
                    gudangList={gudangList}
                    readOnly={false}
                />
            </DialogContent>
        </Dialog>
    );
}

interface InventarisFormFieldsProps {
    form: InventarisFormData;
    errors: Partial<Record<keyof InventarisFormData, string>>;
    onChange: (field: keyof InventarisFormData, value: string | number | null) => void;
    onSubmit?: (e: React.FormEvent) => void;
    loading?: boolean;
    onClose?: () => void;
    dimensiList: DimensiOption[];
    satuanList: SatuanOption[];
    kategoriList: KategoriOption[];
    kondisiList: KondisiOption[];
    gudangList: GudangOption[];
    readOnly?: boolean;
}

function InventarisFormFields({
    form,
    errors,
    onChange,
    onSubmit,
    loading,
    onClose,
    dimensiList,
    satuanList,
    kategoriList,
    kondisiList,
    gudangList,
    readOnly = false,
}: InventarisFormFieldsProps) {
    const ro = readOnly;

    const content = (
        <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Kode Barang {!ro && <span className="text-destructive">*</span>}</Label>
                    <Input
                        value={form.kode_barang}
                        onChange={(e) => onChange('kode_barang', e.target.value)}
                        placeholder="masukan kode barang"
                        disabled={ro}
                        readOnly={ro}
                        className={errors.kode_barang ? 'border-destructive' : ''}
                    />
                    {errors.kode_barang && <p className="text-xs text-destructive">{errors.kode_barang}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label>No Inventaris</Label>
                    <Input
                        value={form.no_inventaris}
                        onChange={(e) => onChange('no_inventaris', e.target.value)}
                        placeholder="masukan no inventaris"
                        disabled={ro}
                        readOnly={ro}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <Label>Tanggal Perolehan</Label>
                    <Input
                        type="date"
                        value={form.tanggal_perolehan}
                        onChange={(e) => onChange('tanggal_perolehan', e.target.value)}
                        disabled={ro}
                        readOnly={ro}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Nama Inventaris {!ro && <span className="text-destructive">*</span>}</Label>
                    <Input
                        value={form.nama_inventaris}
                        onChange={(e) => onChange('nama_inventaris', e.target.value)}
                        placeholder="masukan nama inventaris"
                        disabled={ro}
                        readOnly={ro}
                        className={errors.nama_inventaris ? 'border-destructive' : ''}
                    />
                    {errors.nama_inventaris && <p className="text-xs text-destructive">{errors.nama_inventaris}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label>Merek</Label>
                    <Input
                        value={form.merek}
                        onChange={(e) => onChange('merek', e.target.value)}
                        placeholder="masukan merek barang"
                        disabled={ro}
                        readOnly={ro}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Dimensi</Label>
                    {ro ? (
                        <Input value={dimensiList.find((d) => d.id === form.dimensi_id)?.nama_dimensi ?? '-'} readOnly />
                    ) : (
                        <Select
                            value={form.dimensi_id ? String(form.dimensi_id) : 'none'}
                            onValueChange={(v) => onChange('dimensi_id', v === 'none' ? null : parseInt(v))}
                        >
                            <SelectTrigger><SelectValue placeholder="pilih dimensi" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">- pilih dimensi -</SelectItem>
                                {dimensiList.map((d) => (
                                    <SelectItem key={d.id} value={String(d.id)}>{d.nama_dimensi}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
                <div className="space-y-1.5">
                    <Label>Satuan</Label>
                    {ro ? (
                        <Input value={satuanList.find((s) => s.id === form.satuan_id)?.nama_satuan ?? '-'} readOnly />
                    ) : (
                        <Select
                            value={form.satuan_id ? String(form.satuan_id) : 'none'}
                            onValueChange={(v) => onChange('satuan_id', v === 'none' ? null : parseInt(v))}
                        >
                            <SelectTrigger><SelectValue placeholder="pilih satuan" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">- pilih satuan -</SelectItem>
                                {satuanList.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>{s.nama_satuan}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            <div className="space-y-1.5">
                <Label>Keterangan</Label>
                <textarea
                    value={form.keterangan}
                    onChange={(e) => onChange('keterangan', e.target.value)}
                    placeholder="tambahkan keterangan ( opsional )..."
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

interface DetailDialogProps {
    open: boolean;
    data: Inventaris | null;
    onClose: () => void;
    dimensiList: DimensiOption[];
    satuanList: SatuanOption[];
    kategoriList: KategoriOption[];
    kondisiList: KondisiOption[];
    gudangList: GudangOption[];
}

function DetailDialog({ open, data, onClose, dimensiList, satuanList, kategoriList, kondisiList, gudangList }: DetailDialogProps) {
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
                        Form Detail Inventaris
                    </DialogTitle>
                </DialogHeader>
                <Separator />
                <InventarisFormFields
                    form={form}
                    errors={{}}
                    onChange={() => {}}
                    dimensiList={dimensiList}
                    satuanList={satuanList}
                    kategoriList={kategoriList}
                    kondisiList={kondisiList}
                    gudangList={gudangList}
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
    inventaris: Inventaris | null;
    onClose: () => void;
    onSuccess: () => void;
}

function DeleteDialog({ open, inventaris, onClose, onSuccess }: DeleteDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!inventaris) return;
        setLoading(true);
        try {
            await apiDelete(`/asset/${inventaris.id}`);
            toast.success('Inventaris berhasil dihapus.');
            onSuccess();
            onClose();
        } catch {
            toast.error('Gagal menghapus inventaris.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Hapus Inventaris</DialogTitle>
                </DialogHeader>
                <Separator />
                <p className="text-sm text-muted-foreground py-2">
                    Hapus inventaris <strong>{inventaris?.nama_inventaris}</strong>?
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

export default function InventarisIndex() {
    const { dimensiList, satuanList, kategoriList, kondisiList, gudangList } =
        usePage<PageProps>().props;

    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [formOpen, setFormOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editData, setEditData] = useState<Inventaris | null>(null);
    const [detailData, setDetailData] = useState<Inventaris | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Inventaris | null>(null);

    const [draftFilters, setDraftFilters] = useState<InventarisFilters>({});
    const [appliedFilters, setAppliedFilters] = useState<InventarisFilters>({});

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

    const columns: ColumnDef<Inventaris>[] = [
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
            id: 'kode_barang',
            label: 'KODE',
            sortable: true,
            render: (row) => <span className="font-mono text-xs font-semibold">{row.kode_barang}</span>,
        },
        {
            id: 'tanggal_input',
            label: 'TANGGAL',
            sortable: true,
            render: (row) => <span className="text-xs">{formatDate(row.tanggal_input)}</span>,
        },
        {
            id: 'no_inventaris',
            label: 'NO INVENTARIS',
            render: (row) => (
                <span className="text-xs">{row.no_inventaris ?? <span className="italic text-muted-foreground">-</span>}</span>
            ),
        },
        {
            id: 'merek',
            label: 'MEREK',
            sortable: true,
            render: (row) => <span className="text-sm">{row.merek ?? '-'}</span>,
        },
        {
            id: 'nama_inventaris',
            label: 'NAMA INVENTARIS',
            sortable: true,
            render: (row) => <span className="font-medium">{row.nama_inventaris}</span>,
        },
        {
            id: 'dimensi',
            label: 'DIMENSI',
            align: 'center',
            render: (row) => <span className="text-xs">{row.dimensi?.nama_dimensi ?? '0'}</span>,
        },
        {
            id: 'satuan',
            label: 'SATUAN',
            align: 'center',
            render: (row) => <span className="text-xs">{row.satuan?.nama_satuan ?? '0'}</span>,
        },
        {
            id: 'kategori',
            label: 'KATEGORI',
            align: 'center',
            render: (row) => (
                <span className="text-xs">{row.kategori?.nama_kategori ?? '-'}</span>
            ),
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
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                    >
                        <Eye className="h-3 w-3" />
                        Detail
                    </button>
                    <button
                        onClick={() => { setEditData(row); setFormOpen(true); }}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold bg-[#f59e0b] hover:bg-[#d97706] text-white"
                    >
                        <Edit2 className="h-3 w-3" />
                        Edit
                    </button>
                    <button
                        onClick={() => { setDeleteTarget(row); setDeleteOpen(true); }}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold bg-[#ef4444] hover:bg-[#dc2626] text-white"
                    >
                        <Trash2 className="h-3 w-3" />
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Data Inventaris" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Data Inventaris</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Kelola data inventaris asset perusahaan.
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

                <ServerDataTable<Inventaris>
                    endpoint="/asset/datatable"
                    columns={columns}
                    refreshTrigger={refreshTrigger}
                    extraParams={extraParams}
                    emptyStateIcon={<Cpu className="h-7 w-7" />}
                    emptyStateTitle="Tidak ada data inventaris"
                    emptyStateMessage="Belum ada inventaris yang ditambahkan."
                />
            </div>

            <FormDialog
                open={formOpen}
                onClose={() => setFormOpen(false)}
                editData={editData}
                onSuccess={handleSuccess}
                dimensiList={dimensiList}
                satuanList={satuanList}
                kategoriList={kategoriList}
                kondisiList={kondisiList}
                gudangList={gudangList}
            />

            <DetailDialog
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                data={detailData}
                dimensiList={dimensiList}
                satuanList={satuanList}
                kategoriList={kategoriList}
                kondisiList={kondisiList}
                gudangList={gudangList}
            />

            <DeleteDialog
                open={deleteOpen}
                inventaris={deleteTarget}
                onClose={() => setDeleteOpen(false)}
                onSuccess={handleSuccess}
            />
        </>
    );
}

InventarisIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Asset', href: '#' },
        { title: 'Data Inventaris', href: '/asset' },
    ],
};
