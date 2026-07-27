import { Head } from '@inertiajs/react';
import { Edit2, Folder, Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ColumnDef, ServerDataTable } from '@/components/server-datatable';
import { ApiError, apiDelete, apiPost, apiPut } from '@/lib/api';
import type { Kategori, KategoriFormData } from '@/types/kategori';

const EMPTY_FORM: KategoriFormData = {
    nama_kategori: '',
    keterangan: '',
};

interface FormDialogProps {
    open: boolean;
    onClose: () => void;
    editData: Kategori | null;
    onSuccess: () => void;
}

function FormDialog({ open, onClose, editData, onSuccess }: FormDialogProps) {
    const [form, setForm] = useState<KategoriFormData>(EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof KategoriFormData, string>>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editData) {
            setForm({
                nama_kategori: editData.nama_kategori,
                keterangan: editData.keterangan ?? '',
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setErrors({});
    }, [editData, open]);

    const handleChange = (field: keyof KategoriFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            if (editData) {
                await apiPut(`/barang/kategori/${editData.id}`, form);
                toast.success('Kategori berhasil diperbarui!');
            } else {
                await apiPost('/barang/kategori', form);
                toast.success('Kategori berhasil ditambahkan!');
            }
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const apiErr = err as { status?: number; data?: ApiError };
            if (apiErr?.status === 422 && apiErr?.data?.errors) {
                const mapped: Partial<Record<keyof KategoriFormData, string>> = {};
                Object.entries(apiErr.data.errors).forEach(([key, msgs]) => {
                    mapped[key as keyof KategoriFormData] = msgs[0];
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                            <Folder className="h-4 w-4 text-primary" />
                        </span>
                        {editData ? 'Edit Kategori' : 'Form Simpan Kategori'}
                    </DialogTitle>
                </DialogHeader>

                <Separator />

                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                        <Label htmlFor="nama_kategori">
                            Kategori <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="nama_kategori"
                            value={form.nama_kategori}
                            onChange={(e) => handleChange('nama_kategori', e.target.value)}
                            placeholder="Contoh: Elektronik, Makanan"
                            autoFocus
                            className={errors.nama_kategori ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                        {errors.nama_kategori && (
                            <p className="text-xs text-destructive">{errors.nama_kategori}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="keterangan">Keterangan</Label>
                        <textarea
                            id="keterangan"
                            value={form.keterangan}
                            onChange={(e) => handleChange('keterangan', e.target.value)}
                            placeholder="Keterangan opsional..."
                            rows={3}
                            className={`w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none ${errors.keterangan ? 'border-destructive' : 'border-input'}`}
                        />
                        {errors.keterangan && (
                            <p className="text-xs text-destructive">{errors.keterangan}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Batal
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

interface DeleteDialogProps {
    open: boolean;
    kategori: Kategori | null;
    onClose: () => void;
    onSuccess: () => void;
}

function DeleteDialog({ open, kategori, onClose, onSuccess }: DeleteDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!kategori) return;
        setLoading(true);
        try {
            await apiDelete(`/barang/kategori/${kategori.id}`);
            toast.success('Kategori berhasil dihapus.');
            onSuccess();
            onClose();
        } catch {
            toast.error('Gagal menghapus kategori. Silakan coba lagi.');
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
                        Hapus Kategori
                    </DialogTitle>
                </DialogHeader>

                <Separator />

                <div className="space-y-3 py-2">
                    <p className="text-sm text-muted-foreground">
                        Apakah Anda yakin ingin menghapus kategori{' '}
                        <span className="font-semibold text-foreground">"{kategori?.nama_kategori}"</span>?
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

export default function KategoriIndex() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [formOpen, setFormOpen] = useState(false);
    const [editData, setEditData] = useState<Kategori | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Kategori | null>(null);

    const openCreate = () => {
        setEditData(null);
        setFormOpen(true);
    };

    const openEdit = (row: Kategori) => {
        setEditData(row);
        setFormOpen(true);
    };

    const openDelete = (row: Kategori) => {
        setDeleteTarget(row);
        setDeleteOpen(true);
    };

    const handleSuccess = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    const columns: ColumnDef<Kategori>[] = [
        {
            id: 'id',
            label: 'NO',
            sortable: true,
            align: 'center',
            width: 'w-14',
            render: (_row, _index, from) => (
                <span className="text-muted-foreground text-xs font-mono">
                    {from !== null ? from + _index : ''}
                </span>
            ),
        },
        {
            id: 'nama_kategori',
            label: 'KATEGORI',
            sortable: true,
            render: (row) => <span className="font-medium">{row.nama_kategori}</span>,
        },
        {
            id: 'keterangan',
            label: 'KETERANGAN',
            render: (row) => (
                <span className="text-muted-foreground text-xs line-clamp-2 max-w-[300px]">
                    {row.keterangan ?? <span className="italic">-</span>}
                </span>
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
            <Head title="Kategori" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Kategori</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Kelola data master kategori barang.
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

                <ServerDataTable<Kategori>
                    endpoint="/barang/kategori/datatable"
                    columns={columns}
                    refreshTrigger={refreshTrigger}
                    emptyStateIcon={<Folder className="h-7 w-7" />}
                    emptyStateTitle="Tidak ada data kategori"
                    emptyStateMessage="Belum ada kategori yang ditambahkan. Silakan klik Tambah."
                />
            </div>

            <FormDialog
                open={formOpen}
                onClose={() => setFormOpen(false)}
                editData={editData}
                onSuccess={handleSuccess}
            />

            <DeleteDialog
                open={deleteOpen}
                kategori={deleteTarget}
                onClose={() => setDeleteOpen(false)}
                onSuccess={handleSuccess}
            />
        </>
    );
}

KategoriIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Master', href: '#' },
        { title: 'Kategori', href: '/barang/kategori' },
    ],
};
