import { Head } from '@inertiajs/react';
import { Edit2, Loader2, Plus, Shield, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ColumnDef, ServerDataTable } from '@/components/server-datatable';
import { ApiError, apiDelete, apiPost, apiPut } from '@/lib/api';
import type { Jabatan, JabatanFormData } from '@/types/jabatan';

const EMPTY_FORM: JabatanFormData = {
    nama_jabatan: '',
    level_akses: 'USER',
    level_urutan: 1,
    keterangan: '',
    is_active: true,
};

interface FormDialogProps {
    open: boolean;
    onClose: () => void;
    editData: Jabatan | null;
    onSuccess: () => void;
}

function FormDialog({ open, onClose, editData, onSuccess }: FormDialogProps) {
    const [form, setForm] = useState<JabatanFormData>(EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof JabatanFormData, string>>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editData) {
            setForm({
                nama_jabatan: editData.nama_jabatan,
                level_akses: editData.level_akses,
                level_urutan: editData.level_urutan,
                keterangan: editData.keterangan ?? '',
                is_active: editData.is_active,
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setErrors({});
    }, [editData, open]);

    const handleChange = (field: keyof JabatanFormData, value: string | number | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            if (editData) {
                await apiPut(`/jabatan/${editData.id}`, form);
                toast.success('Jabatan berhasil diperbarui!');
            } else {
                await apiPost('/jabatan', form);
                toast.success('Jabatan berhasil ditambahkan!');
            }
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const apiErr = err as { status?: number; data?: ApiError };
            if (apiErr?.status === 422 && apiErr?.data?.errors) {
                const mapped: Partial<Record<keyof JabatanFormData, string>> = {};
                Object.entries(apiErr.data.errors).forEach(([key, msgs]) => {
                    mapped[key as keyof JabatanFormData] = msgs[0];
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
                            <Shield className="h-4 w-4 text-primary" />
                        </span>
                        {editData ? 'Edit Jabatan' : 'Form Tambah Jabatan'}
                    </DialogTitle>
                </DialogHeader>

                <Separator />

                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                        <Label htmlFor="nama_jabatan">
                            Nama Jabatan <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="nama_jabatan"
                            value={form.nama_jabatan}
                            onChange={(e) => handleChange('nama_jabatan', e.target.value)}
                            placeholder="Contoh: Manager IT"
                            autoFocus
                            className={errors.nama_jabatan ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                        {errors.nama_jabatan && (
                            <p className="text-xs text-destructive">{errors.nama_jabatan}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="level_akses">
                                Level Akses <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={form.level_akses}
                                onValueChange={(v) => handleChange('level_akses', v)}
                            >
                                <SelectTrigger className={errors.level_akses ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Pilih Akses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                                    <SelectItem value="MANAGER">MANAGER</SelectItem>
                                    <SelectItem value="KADIV">KADIV</SelectItem>
                                    <SelectItem value="DIREKSI">DIREKSI</SelectItem>
                                    <SelectItem value="USER">USER</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.level_akses && (
                                <p className="text-xs text-destructive">{errors.level_akses}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="level_urutan">
                                Urutan (Ranking) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="level_urutan"
                                type="number"
                                min={1}
                                value={form.level_urutan}
                                onChange={(e) => handleChange('level_urutan', parseInt(e.target.value) || 1)}
                                className={errors.level_urutan ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            {errors.level_urutan && (
                                <p className="text-xs text-destructive">{errors.level_urutan}</p>
                            )}
                        </div>
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

                    <div className="flex items-center gap-2 pt-2 pb-1">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={form.is_active}
                            onChange={(e) => handleChange('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="is_active" className="cursor-pointer">
                            Jabatan Aktif
                        </Label>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90"
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
    jabatan: Jabatan | null;
    onClose: () => void;
    onSuccess: () => void;
}

function DeleteDialog({ open, jabatan, onClose, onSuccess }: DeleteDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!jabatan) return;
        setLoading(true);
        try {
            await apiDelete(`/jabatan/${jabatan.id}`);
            toast.success('Jabatan berhasil dihapus.');
            onSuccess();
            onClose();
        } catch {
            toast.error('Gagal menghapus jabatan. Silakan coba lagi.');
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
                        Hapus Jabatan
                    </DialogTitle>
                </DialogHeader>

                <Separator />

                <div className="space-y-3 py-2">
                    <p className="text-sm text-muted-foreground">
                        Apakah Anda yakin ingin menghapus jabatan{' '}
                        <span className="font-semibold text-foreground">"{jabatan?.nama_jabatan}"</span>?
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

export default function JabatanIndex() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [formOpen, setFormOpen] = useState(false);
    const [editData, setEditData] = useState<Jabatan | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Jabatan | null>(null);

    const openCreate = () => {
        setEditData(null);
        setFormOpen(true);
    };

    const openEdit = (row: Jabatan) => {
        setEditData(row);
        setFormOpen(true);
    };

    const openDelete = (row: Jabatan) => {
        setDeleteTarget(row);
        setDeleteOpen(true);
    };

    const handleSuccess = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    const columns: ColumnDef<Jabatan>[] = [
        {
            id: 'id',
            label: 'NO',
            sortable: true,
            align: 'center',
            width: 'w-14',
            render: (_row, _index, from) => <span className="text-muted-foreground text-xs font-mono">{from !== null ? from + _index : ''}</span>
        },
        {
            id: 'nama_jabatan',
            label: 'NAMA JABATAN',
            sortable: true,
            render: (row) => <span className="font-medium">{row.nama_jabatan}</span>
        },
        {
            id: 'level_akses',
            label: 'LEVEL AKSES',
            sortable: true,
            render: (row) => (
                <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                    {row.level_akses}
                </span>
            )
        },
        {
            id: 'level_urutan',
            label: 'URUTAN',
            sortable: true,
            align: 'center',
            render: (row) => <span className="font-mono text-sm">{row.level_urutan}</span>
        },
        {
            id: 'keterangan',
            label: 'KETERANGAN',
            render: (row) => (
                <span className="text-muted-foreground text-xs line-clamp-2 max-w-[200px]">
                    {row.keterangan ?? <span className="italic">-</span>}
                </span>
            )
        },
        {
            id: 'is_active',
            label: 'STATUS',
            sortable: true,
            align: 'center',
            render: (row) => (
                row.is_active ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Aktif
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                        Nonaktif
                    </span>
                )
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
                        className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
                        title="Edit"
                    >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:ml-1">Edit</span>
                    </button>
                    <button
                        onClick={() => openDelete(row)}
                        className="inline-flex items-center gap-1 rounded bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        title="Hapus"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:ml-1">Hapus</span>
                    </button>
                </div>
            )
        }
    ];

    return (
        <>
            <Head title="Jabatan" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Jabatan</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Kelola data master jabatan dan hak aksesnya.
                        </p>
                    </div>
                    <Button onClick={openCreate} className="mt-3 sm:mt-0 gap-2 self-start sm:self-auto">
                        <Plus className="h-4 w-4" />
                        Tambah Jabatan
                    </Button>
                </div>

                <ServerDataTable<Jabatan>
                    endpoint="/jabatan/datatable"
                    columns={columns}
                    refreshTrigger={refreshTrigger}
                    emptyStateIcon={<Shield className="h-7 w-7" />}
                    emptyStateTitle="Tidak ada jabatan"
                    emptyStateMessage="Belum ada jabatan yang ditambahkan. Silakan klik Tambah Jabatan."
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
                jabatan={deleteTarget}
                onClose={() => setDeleteOpen(false)}
                onSuccess={handleSuccess}
            />
        </>
    );
}

JabatanIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Master', href: '#' },
        { title: 'Jabatan', href: '/jabatan' },
    ],
};
