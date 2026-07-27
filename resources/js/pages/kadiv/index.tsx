import { Head } from '@inertiajs/react';
import { Briefcase, Edit2, Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ColumnDef, ServerDataTable } from '@/components/server-datatable';
import { ApiError, apiDelete, apiPost, apiPut } from '@/lib/api';
import type { Kadiv, KadivFormData } from '@/types/kadiv';

const EMPTY_FORM: KadivFormData = {
    nama_kadiv: '',
    npp: '',
    keterangan: '',
    is_active: true,
};

interface FormDialogProps {
    open: boolean;
    onClose: () => void;
    editData: Kadiv | null;
    onSuccess: () => void;
}

function FormDialog({ open, onClose, editData, onSuccess }: FormDialogProps) {
    const [form, setForm] = useState<KadivFormData>(EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof KadivFormData, string>>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editData) {
            setForm({
                nama_kadiv: editData.nama_kadiv,
                npp: editData.npp ?? '',
                keterangan: editData.keterangan ?? '',
                is_active: editData.is_active,
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setErrors({});
    }, [editData, open]);

    const handleChange = (field: keyof KadivFormData, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            if (editData) {
                await apiPut(`/kadiv/${editData.id}`, form);
                toast.success('Kadiv berhasil diperbarui!');
            } else {
                await apiPost('/kadiv', form);
                toast.success('Kadiv berhasil ditambahkan!');
            }
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const apiErr = err as { status?: number; data?: ApiError };
            if (apiErr?.status === 422 && apiErr?.data?.errors) {
                const mapped: Partial<Record<keyof KadivFormData, string>> = {};
                Object.entries(apiErr.data.errors).forEach(([key, msgs]) => {
                    mapped[key as keyof KadivFormData] = msgs[0];
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
                            <Briefcase className="h-4 w-4 text-primary" />
                        </span>
                        {editData ? 'Edit Kadiv' : 'Form Tambah Kadiv'}
                    </DialogTitle>
                </DialogHeader>

                <Separator />

                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                        <Label htmlFor="nama_kadiv">
                            Nama <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="nama_kadiv"
                            value={form.nama_kadiv}
                            onChange={(e) => handleChange('nama_kadiv', e.target.value)}
                            placeholder="Nama kadiv..."
                            autoFocus
                            className={errors.nama_kadiv ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                        {errors.nama_kadiv && (
                            <p className="text-xs text-destructive">{errors.nama_kadiv}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="npp">NPP</Label>
                        <Input
                            id="npp"
                            value={form.npp}
                            onChange={(e) => handleChange('npp', e.target.value)}
                            placeholder="Nomor Pokok Pegawai..."
                            className={errors.npp ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                        {errors.npp && (
                            <p className="text-xs text-destructive">{errors.npp}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="keterangan">Keterangan</Label>
                        <textarea
                            id="keterangan"
                            value={form.keterangan}
                            onChange={(e) => handleChange('keterangan', e.target.value)}
                            placeholder="Keterangan (opsional)..."
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
    kadiv: Kadiv | null;
    onClose: () => void;
    onSuccess: () => void;
}

function DeleteDialog({ open, kadiv, onClose, onSuccess }: DeleteDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!kadiv) return;
        setLoading(true);
        try {
            await apiDelete(`/kadiv/${kadiv.id}`);
            toast.success('Kadiv berhasil dihapus.');
            onSuccess();
            onClose();
        } catch {
            toast.error('Gagal menghapus kadiv. Silakan coba lagi.');
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
                        Hapus Kadiv
                    </DialogTitle>
                </DialogHeader>

                <Separator />

                <div className="space-y-3 py-2">
                    <p className="text-sm text-muted-foreground">
                        Apakah Anda yakin ingin menghapus kadiv{' '}
                        <span className="font-semibold text-foreground">"{kadiv?.nama_kadiv}"</span>?
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

export default function KadivIndex() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [formOpen, setFormOpen] = useState(false);
    const [editData, setEditData] = useState<Kadiv | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Kadiv | null>(null);

    const openCreate = () => {
        setEditData(null);
        setFormOpen(true);
    };

    const openEdit = (row: Kadiv) => {
        setEditData(row);
        setFormOpen(true);
    };

    const openDelete = (row: Kadiv) => {
        setDeleteTarget(row);
        setDeleteOpen(true);
    };

    const handleSuccess = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    const columns: ColumnDef<Kadiv>[] = [
        {
            id: 'id',
            label: 'NO',
            sortable: true,
            align: 'center',
            width: 'w-14',
            render: (_row, _index, from) => <span className="text-muted-foreground text-xs font-mono">{from !== null ? from + _index : ''}</span>
        },
        {
            id: 'nama_kadiv',
            label: 'NAMA KADIV',
            sortable: true,
            render: (row) => <span className="font-medium">{row.nama_kadiv}</span>
        },
        {
            id: 'npp',
            label: 'NPP',
            sortable: true,
            render: (row) => <span className="text-muted-foreground font-mono text-xs">{row.npp ?? <span className="italic opacity-50">-</span>}</span>
        },
        {
            id: 'keterangan',
            label: 'KETERANGAN',
            render: (row) => (
                <span className="text-muted-foreground text-xs line-clamp-2 max-w-[300px]">
                    {row.keterangan ?? <span className="italic">-</span>}
                </span>
            )
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
                        Hapus
                    </button>
                </div>
            )
        }
    ];

    return (
        <>
            <Head title="Kadiv" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Kadiv</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Kelola data kepala divisi dalam organisasi.
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

                <ServerDataTable<Kadiv>
                    endpoint="/kadiv/datatable"
                    columns={columns}
                    refreshTrigger={refreshTrigger}
                    emptyStateIcon={<Briefcase className="h-7 w-7" />}
                    emptyStateTitle="Tidak ada data"
                    emptyStateMessage="Belum ada kadiv yang ditambahkan."
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
                kadiv={deleteTarget}
                onClose={() => setDeleteOpen(false)}
                onSuccess={handleSuccess}
            />
        </>
    );
}

KadivIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Master', href: '#' },
        { title: 'Kadiv', href: '/kadiv' },
    ],
};
