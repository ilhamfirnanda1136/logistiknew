import { Head, usePage } from '@inertiajs/react';
import { Download, Edit2, FileDown, FileUp, Loader2, Package, Trash2, Plus, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
    Barang,
    BarangFormData,
    DimensiOption,
    GudangOption,
    KategoriOption,
    SatuanOption,
} from '@/types/barang';

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_FORM: BarangFormData = {
    kode_barang: '',
    nama_barang: '',
    dimensi_id: null,
    satuan_id: null,
    kategori_id: null,
    gudang_id: null,
    stok: '0',
    is_item_sr: false,
    keterangan: '',
};

// ─── Page Props ───────────────────────────────────────────────────────────────

interface PageProps {
    dimensiList: DimensiOption[];
    satuanList: SatuanOption[];
    kategoriList: KategoriOption[];
    gudangList: GudangOption[];
    [key: string]: unknown;
}

// ─── Form Dialog ──────────────────────────────────────────────────────────────

interface FormDialogProps {
    open: boolean;
    onClose: () => void;
    editData: Barang | null;
    onSuccess: () => void;
    dimensiList: DimensiOption[];
    satuanList: SatuanOption[];
    kategoriList: KategoriOption[];
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
    gudangList,
}: FormDialogProps) {
    const [form, setForm] = useState<BarangFormData>(EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof BarangFormData, string>>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editData) {
            setForm({
                kode_barang:  editData.kode_barang,
                nama_barang:  editData.nama_barang,
                dimensi_id:   editData.dimensi_id ?? null,
                satuan_id:    editData.satuan_id ?? null,
                kategori_id:  editData.kategori_id ?? null,
                gudang_id:    editData.gudang_id ?? null,
                stok:         editData.stok ?? '0',
                is_item_sr:   editData.is_item_sr,
                keterangan:   editData.keterangan ?? '',
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setErrors({});
    }, [editData, open]);

    const handleChange = (
        field: keyof BarangFormData,
        value: string | number | boolean | null,
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            if (editData) {
                await apiPut(`/barang/${editData.id}`, form);
                toast.success('Barang berhasil diperbarui!');
            } else {
                await apiPost('/barang', form);
                toast.success('Barang berhasil ditambahkan!');
            }
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const apiErr = err as { status?: number; data?: ApiError };
            if (apiErr?.status === 422 && apiErr?.data?.errors) {
                const mapped: Partial<Record<keyof BarangFormData, string>> = {};
                Object.entries(apiErr.data.errors).forEach(([key, msgs]) => {
                    mapped[key as keyof BarangFormData] = msgs[0];
                });
                setErrors(mapped);
            } else {
                toast.error('Terjadi kesalahan. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm(EMPTY_FORM);
        setErrors({});
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                            <Package className="h-4 w-4 text-primary" />
                        </span>
                        {editData ? 'Edit Barang' : 'Form Tambah Barang'}
                    </DialogTitle>
                </DialogHeader>

                <Separator />

                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    {/* Row 1: Kode & Nama */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="kode_barang">
                                Kode Barang <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="kode_barang"
                                value={form.kode_barang}
                                onChange={(e) => handleChange('kode_barang', e.target.value)}
                                placeholder="masukan kode barang"
                                autoFocus
                                className={errors.kode_barang ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            {errors.kode_barang && (
                                <p className="text-xs text-destructive">{errors.kode_barang}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="nama_barang">
                                Nama Barang <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="nama_barang"
                                value={form.nama_barang}
                                onChange={(e) => handleChange('nama_barang', e.target.value)}
                                placeholder="masukan nama barang"
                                className={errors.nama_barang ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            {errors.nama_barang && (
                                <p className="text-xs text-destructive">{errors.nama_barang}</p>
                            )}
                        </div>
                    </div>

                    {/* Row 2: Dimensi & Satuan */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Dimensi</Label>
                            <Select
                                value={form.dimensi_id ? String(form.dimensi_id) : 'none'}
                                onValueChange={(v) =>
                                    handleChange('dimensi_id', v === 'none' ? null : parseInt(v))
                                }
                            >
                                <SelectTrigger className={errors.dimensi_id ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="pilih dimensi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">- pilih dimensi -</SelectItem>
                                    {dimensiList.map((d) => (
                                        <SelectItem key={d.id} value={String(d.id)}>
                                            {d.nama_dimensi}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.dimensi_id && (
                                <p className="text-xs text-destructive">{errors.dimensi_id}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Satuan</Label>
                            <Select
                                value={form.satuan_id ? String(form.satuan_id) : 'none'}
                                onValueChange={(v) =>
                                    handleChange('satuan_id', v === 'none' ? null : parseInt(v))
                                }
                            >
                                <SelectTrigger className={errors.satuan_id ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="pilih satuan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">- pilih satuan -</SelectItem>
                                    {satuanList.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.nama_satuan}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.satuan_id && (
                                <p className="text-xs text-destructive">{errors.satuan_id}</p>
                            )}
                        </div>
                    </div>

                    {/* Row 3: Kategori & Item SR */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Kategori</Label>
                            <Select
                                value={form.kategori_id ? String(form.kategori_id) : 'none'}
                                onValueChange={(v) =>
                                    handleChange('kategori_id', v === 'none' ? null : parseInt(v))
                                }
                            >
                                <SelectTrigger className={errors.kategori_id ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">- pilih kategori -</SelectItem>
                                    {kategoriList.map((k) => (
                                        <SelectItem key={k.id} value={String(k.id)}>
                                            {k.nama_kategori}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.kategori_id && (
                                <p className="text-xs text-destructive">{errors.kategori_id}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Item SR</Label>
                            <Select
                                value={form.is_item_sr ? 'ya' : 'tidak'}
                                onValueChange={(v) => handleChange('is_item_sr', v === 'ya')}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tidak">Tidak</SelectItem>
                                    <SelectItem value="ya">Ya</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 4: Gudang / Lokasi */}
                    <div className="space-y-1.5">
                        <Label>Lokasi / Gudang</Label>
                        <Select
                            value={form.gudang_id ? String(form.gudang_id) : 'none'}
                            onValueChange={(v) =>
                                handleChange('gudang_id', v === 'none' ? null : parseInt(v))
                            }
                        >
                            <SelectTrigger className={errors.gudang_id ? 'border-destructive' : ''}>
                                <SelectValue placeholder="pilih gudang" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">- pilih gudang -</SelectItem>
                                {gudangList.map((g) => (
                                    <SelectItem key={g.id} value={String(g.id)}>
                                        {g.nama_gudang}
                                        <span className="ml-1.5 text-xs text-muted-foreground">
                                            ({g.jenis_gudang})
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.gudang_id && (
                            <p className="text-xs text-destructive">{errors.gudang_id}</p>
                        )}
                    </div>

                    {/* Row 5: Keterangan */}
                    <div className="space-y-1.5">
                        <Label htmlFor="keterangan">Keterangan</Label>
                        <textarea
                            id="keterangan"
                            value={form.keterangan}
                            onChange={(e) => handleChange('keterangan', e.target.value)}
                            placeholder="tambahkan keterangan ( opsional )..."
                            rows={3}
                            className={`w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none ${errors.keterangan ? 'border-destructive' : 'border-input'}`}
                        />
                        {errors.keterangan && (
                            <p className="text-xs text-destructive">{errors.keterangan}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            disabled={loading}
                        >
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

// ─── Delete Dialog ────────────────────────────────────────────────────────────

interface DeleteDialogProps {
    open: boolean;
    barang: Barang | null;
    onClose: () => void;
    onSuccess: () => void;
}

function DeleteDialog({ open, barang, onClose, onSuccess }: DeleteDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!barang) return;
        setLoading(true);
        try {
            await apiDelete(`/barang/${barang.id}`);
            toast.success('Barang berhasil dihapus.');
            onSuccess();
            onClose();
        } catch {
            toast.error('Gagal menghapus barang. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </span>
                        Hapus Barang
                    </DialogTitle>
                </DialogHeader>

                <Separator />

                <div className="space-y-3 py-2">
                    <p className="text-sm text-muted-foreground">
                        Apakah Anda yakin ingin menghapus barang{' '}
                        <span className="font-semibold text-foreground">
                            "{barang?.nama_barang}"
                        </span>
                        ?
                    </p>
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
                        <p className="text-xs text-destructive">
                            ⚠️ Tindakan ini tidak dapat dibatalkan.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
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

// ─── Stok Badge ───────────────────────────────────────────────────────────────

function StokBadge({ stok }: { stok: string }) {
    const value = parseFloat(stok);
    const color =
        value === 0
            ? 'border-rose-300 text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400'
            : value < 10
              ? 'border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400'
              : 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400';

    return (
        <span
            className={`inline-flex items-center justify-center rounded border px-2 py-0.5 text-xs font-semibold tabular-nums min-w-[56px] ${color}`}
        >
            {value.toFixed(2)}
        </span>
    );
}

// ─── Import Dialog ────────────────────────────────────────────────────────────

interface ImportDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

function ImportDialog({ open, onClose, onSuccess }: ImportDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [importErrors, setImportErrors] = useState<string[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) {
            setFile(null);
            setImportErrors([]);
        }
    }, [open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(e.target.files?.[0] ?? null);
        setImportErrors([]);
    };

    const handleImport = async () => {
        if (!file) {
            toast.error('Pilih file Excel terlebih dahulu.');
            return;
        }
        setLoading(true);
        setImportErrors([]);

        const csrfMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/barang/import', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfMeta?.content ?? '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: formData,
            });

            const json = await res.json();

            if (!res.ok) {
                if (res.status === 422 && json.errors) {
                    const msgs = Object.values(json.errors as Record<string, string[]>).flat();
                    setImportErrors(msgs);
                } else {
                    toast.error(json.message ?? 'Terjadi kesalahan saat import.');
                }
                return;
            }

            toast.success(json.message ?? 'Import berhasil.');

            if (json.errors?.length > 0) {
                setImportErrors(json.errors);
                onSuccess();
            } else {
                onSuccess();
                onClose();
            }
        } catch {
            toast.error('Gagal menghubungi server. Coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/10">
                            <Upload className="h-4 w-4 text-green-600" />
                        </span>
                        Import Barang
                    </DialogTitle>
                </DialogHeader>

                <Separator />

                <div className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                        <Label htmlFor="import_file">
                            File Excel / CSV <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex items-center gap-2">
                            <input
                                ref={fileRef}
                                id="import_file"
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="flex-1 flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                <FileUp className="h-4 w-4 shrink-0" />
                                <span className="truncate">
                                    {file ? file.name : '-- pilih file --'}
                                </span>
                            </button>
                            {file && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFile(null);
                                        if (fileRef.current) fileRef.current.value = '';
                                    }}
                                    className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Format: .xlsx, .xls, .csv • Maks. 5 MB
                        </p>
                    </div>

                    {/* Error / warning list */}
                    {importErrors.length > 0 && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 max-h-40 overflow-y-auto">
                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1.5">
                                Peringatan / Error ({importErrors.length}):
                            </p>
                            <ul className="space-y-0.5">
                                {importErrors.map((e, i) => (
                                    <li key={i} className="text-xs text-amber-600 dark:text-amber-300">• {e}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Batal
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={loading || !file}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Import
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BarangIndex() {
    const { dimensiList, satuanList, kategoriList, gudangList } =
        usePage<PageProps>().props;

    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [formOpen, setFormOpen] = useState(false);
    const [editData, setEditData] = useState<Barang | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Barang | null>(null);
    const [importOpen, setImportOpen] = useState(false);
    const [exporting, setExporting] = useState(false);

    const openCreate = () => {
        setEditData(null);
        setFormOpen(true);
    };

    const openEdit = (row: Barang) => {
        setEditData(row);
        setFormOpen(true);
    };

    const openDelete = (row: Barang) => {
        setDeleteTarget(row);
        setDeleteOpen(true);
    };

    const handleSuccess = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const a = document.createElement('a');
            a.href = '/barang/export';
            a.download = '';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast.success('File Excel sedang diunduh...');
        } catch {
            toast.error('Gagal mengunduh file.');
        } finally {
            setTimeout(() => setExporting(false), 1500);
        }
    };

    const handleTemplate = () => {
        const a = document.createElement('a');
        a.href = '/barang/template';
        a.download = '';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Template Excel diunduh.');
    };

    const columns: ColumnDef<Barang>[] = [
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
            width: 'w-24',
            render: (row) => (
                <span className="font-mono text-xs font-semibold text-primary">
                    {row.kode_barang}
                </span>
            ),
        },
        {
            id: 'nama_barang',
            label: 'NAMA BARANG',
            sortable: true,
            render: (row) => <span className="font-medium">{row.nama_barang}</span>,
        },
        {
            id: 'dimensi',
            label: 'UKURAN',
            align: 'center',
            render: (row) => (
                <span className="text-muted-foreground text-xs">
                    {row.dimensi?.nama_dimensi ?? <span className="italic">-</span>}
                </span>
            ),
        },
        {
            id: 'satuan',
            label: 'SATUAN',
            align: 'center',
            render: (row) => (
                <span className="text-xs">{row.satuan?.nama_satuan ?? <span className="italic text-muted-foreground">-</span>}</span>
            ),
        },
        {
            id: 'gudang',
            label: 'LOKASI',
            align: 'center',
            render: (row) => (
                <span className="text-xs text-muted-foreground">
                    {row.gudang?.nama_gudang ?? <span className="italic">-</span>}
                </span>
            ),
        },
        {
            id: 'kategori',
            label: 'KATEGORI',
            align: 'center',
            render: (row) =>
                row.kategori ? (
                    <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                        {row.kategori.nama_kategori}
                    </span>
                ) : (
                    <span className="italic text-muted-foreground text-xs">-</span>
                ),
        },
        {
            id: 'stok',
            label: 'STOK',
            sortable: true,
            align: 'center',
            render: (row) => <StokBadge stok={row.stok} />,
        },
        {
            id: 'is_item_sr',
            label: 'ITEM SR',
            align: 'center',
            render: (row) =>
                row.is_item_sr ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-600 dark:text-violet-400">
                        Ya
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground italic">Tidak</span>
                ),
        },
        {
            id: 'actions',
            label: 'AKSI',
            align: 'center',
            render: (row) => (
                <div className="flex items-center justify-center gap-1.5">
                    <button
                        onClick={() => openEdit(row)}
                        className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-semibold bg-[#f59e0b] hover:bg-[#d97706] text-white transition-colors"
                        title="Edit"
                    >
                        <Edit2 className="h-3 w-3" />
                        Edit
                    </button>
                    <button
                        onClick={() => openDelete(row)}
                        className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-semibold bg-[#ef4444] hover:bg-[#dc2626] text-white transition-colors"
                        title="Hapus"
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
            <Head title="Barang" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Barang</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Kelola data master barang inventaris.
                        </p>
                    </div>
                    <Button
                        onClick={openCreate}
                        className="mt-3 sm:mt-0 gap-2 self-start sm:self-auto bg-[#16a34a] hover:bg-[#15803d] text-white"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah
                    </Button>
                </div>

                {/* Action bar: Export / Import / Template */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold bg-[#dc2626] hover:bg-[#b91c1c] text-white transition-colors disabled:opacity-60"
                    >
                        {exporting
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <FileDown className="h-3.5 w-3.5" />}
                        Ekspor Excel
                    </button>

                    <button
                        onClick={() => setImportOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold bg-[#16a34a] hover:bg-[#15803d] text-white transition-colors"
                    >
                        <FileUp className="h-3.5 w-3.5" />
                        Import Excel
                    </button>

                    <button
                        onClick={handleTemplate}
                        className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold bg-[#d97706] hover:bg-[#b45309] text-white transition-colors"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Template
                    </button>
                </div>

                <ServerDataTable<Barang>
                    endpoint="/barang/datatable"
                    columns={columns}
                    refreshTrigger={refreshTrigger}
                    emptyStateIcon={<Package className="h-7 w-7" />}
                    emptyStateTitle="Tidak ada data barang"
                    emptyStateMessage="Belum ada barang yang ditambahkan. Silakan klik Tambah."
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
                gudangList={gudangList}
            />

            <DeleteDialog
                open={deleteOpen}
                barang={deleteTarget}
                onClose={() => setDeleteOpen(false)}
                onSuccess={handleSuccess}
            />

            <ImportDialog
                open={importOpen}
                onClose={() => setImportOpen(false)}
                onSuccess={() => {
                    setImportOpen(false);
                    handleSuccess();
                }}
            />
        </>
    );
}

BarangIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Master', href: '#' },
        { title: 'Data Barang', href: '/barang' },
    ],
};
