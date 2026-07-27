import { Head, usePage } from '@inertiajs/react';
import { Edit2, Eye, EyeOff, Loader2, Plus, Trash2, Users } from 'lucide-react';
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
import type { GudangOption, JabatanOption, Pengguna, PenggunaFormData } from '@/types/pengguna';

const EMPTY_FORM: PenggunaFormData = {
    username: '',
    nama_lengkap: '',
    password: '',
    jabatan_id: '',
    gudang_id: null,
    is_active: true,
};

interface PageProps {
    jabatanList: JabatanOption[];
    gudangList: GudangOption[];
    [key: string]: unknown;
}

interface FormDialogProps {
    open: boolean;
    onClose: () => void;
    editData: Pengguna | null;
    onSuccess: () => void;
    jabatanList: JabatanOption[];
    gudangList: GudangOption[];
}

function FormDialog({ open, onClose, editData, onSuccess, jabatanList, gudangList }: FormDialogProps) {
    const [form, setForm] = useState<PenggunaFormData>(EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof PenggunaFormData, string>>>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (editData) {
            setForm({
                username: editData.username,
                nama_lengkap: editData.nama_lengkap,
                password: '',
                jabatan_id: editData.jabatan_id,
                gudang_id: editData.gudang_id ?? null,
                is_active: editData.is_active,
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setErrors({});
        setShowPassword(false);
    }, [editData, open]);

    const handleChange = (field: keyof PenggunaFormData, value: string | number | boolean | null) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            if (editData) {
                await apiPut(`/pengguna/${editData.id}`, form);
                toast.success('Pengguna berhasil diperbarui!');
            } else {
                await apiPost('/pengguna', form);
                toast.success('Pengguna berhasil ditambahkan!');
            }
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const apiErr = err as { status?: number; data?: ApiError };
            if (apiErr?.status === 422 && apiErr?.data?.errors) {
                const mapped: Partial<Record<keyof PenggunaFormData, string>> = {};
                Object.entries(apiErr.data.errors).forEach(([key, msgs]) => {
                    mapped[key as keyof PenggunaFormData] = msgs[0];
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
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                            <Users className="h-4 w-4 text-primary" />
                        </span>
                        {editData ? 'Edit Pengguna' : 'Tambah Data User'}
                    </DialogTitle>
                </DialogHeader>

                <Separator />

                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Username */}
                        <div className="space-y-1.5">
                            <Label htmlFor="username">
                                Username <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="username"
                                value={form.username}
                                onChange={(e) => handleChange('username', e.target.value)}
                                autoFocus
                                autoComplete="off"
                                className={errors.username ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
                        </div>

                        {/* Nama Lengkap */}
                        <div className="space-y-1.5">
                            <Label htmlFor="nama_lengkap">
                                Nama User <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="nama_lengkap"
                                value={form.nama_lengkap}
                                onChange={(e) => handleChange('nama_lengkap', e.target.value)}
                                autoComplete="off"
                                className={errors.nama_lengkap ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            {errors.nama_lengkap && <p className="text-xs text-destructive">{errors.nama_lengkap}</p>}
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="password">
                            Password {!editData && <span className="text-destructive">*</span>}
                            {editData && <span className="text-xs text-muted-foreground ml-1">(kosongkan jika tidak ingin mengubah)</span>}
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                autoComplete="new-password"
                                className={`pr-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Jabatan */}
                        <div className="space-y-1.5">
                            <Label htmlFor="jabatan_id">
                                Jabatan <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={form.jabatan_id ? String(form.jabatan_id) : ''}
                                onValueChange={(v) => handleChange('jabatan_id', parseInt(v))}
                            >
                                <SelectTrigger className={errors.jabatan_id ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="- pilih jabatan -" />
                                </SelectTrigger>
                                <SelectContent>
                                    {jabatanList.map((j) => (
                                        <SelectItem key={j.id} value={String(j.id)}>
                                            {j.nama_jabatan}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.jabatan_id && <p className="text-xs text-destructive">{errors.jabatan_id}</p>}
                        </div>

                        {/* Gudang */}
                        <div className="space-y-1.5">
                            <Label htmlFor="gudang_id">Gudang</Label>
                            <Select
                                value={form.gudang_id ? String(form.gudang_id) : 'none'}
                                onValueChange={(v) => handleChange('gudang_id', v === 'none' ? null : parseInt(v))}
                            >
                                <SelectTrigger className={errors.gudang_id ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="- pilih gudang -" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">- Tidak ada -</SelectItem>
                                    {gudangList.map((g) => (
                                        <SelectItem key={g.id} value={String(g.id)}>
                                            {g.nama_gudang}
                                            <span className="ml-1.5 text-xs text-muted-foreground">({g.jenis_gudang})</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.gudang_id && <p className="text-xs text-destructive">{errors.gudang_id}</p>}
                        </div>
                    </div>

                    {/* Status Aktif */}
                    <div className="flex items-center gap-2 pt-1 pb-1">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={form.is_active}
                            onChange={(e) => handleChange('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="is_active" className="cursor-pointer">
                            Pengguna Aktif
                        </Label>
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
    pengguna: Pengguna | null;
    onClose: () => void;
    onSuccess: () => void;
}

function DeleteDialog({ open, pengguna, onClose, onSuccess }: DeleteDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!pengguna) return;
        setLoading(true);
        try {
            await apiDelete(`/pengguna/${pengguna.id}`);
            toast.success('Pengguna berhasil dihapus.');
            onSuccess();
            onClose();
        } catch {
            toast.error('Gagal menghapus pengguna. Silakan coba lagi.');
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
                        Hapus Pengguna
                    </DialogTitle>
                </DialogHeader>

                <Separator />

                <div className="space-y-3 py-2">
                    <p className="text-sm text-muted-foreground">
                        Apakah Anda yakin ingin menghapus pengguna{' '}
                        <span className="font-semibold text-foreground">"{pengguna?.nama_lengkap}"</span>?
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

/** Render inisial avatar dari nama */
function UserAvatar({ name }: { name: string }) {
    const initials = name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
    return (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {initials}
        </span>
    );
}

export default function PenggunaIndex() {
    const { jabatanList, gudangList } = usePage<PageProps>().props;

    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [formOpen, setFormOpen] = useState(false);
    const [editData, setEditData] = useState<Pengguna | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Pengguna | null>(null);

    const openCreate = () => { setEditData(null); setFormOpen(true); };
    const openEdit = (row: Pengguna) => { setEditData(row); setFormOpen(true); };
    const openDelete = (row: Pengguna) => { setDeleteTarget(row); setDeleteOpen(true); };
    const handleSuccess = () => setRefreshTrigger((prev) => prev + 1);

    const columns: ColumnDef<Pengguna>[] = [
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
            id: 'username',
            label: 'USERNAME',
            sortable: true,
            render: (row) => <span className="font-mono text-sm font-medium">{row.username}</span>,
        },
        {
            id: 'nama_lengkap',
            label: 'NAMA',
            sortable: true,
            render: (row) => <span className="font-medium">{row.nama_lengkap}</span>,
        },
        {
            id: 'level',
            label: 'LEVEL',
            render: (row) => (
                <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                    {row.jabatan?.nama_jabatan ?? '-'}
                </span>
            ),
        },
        {
            id: 'last_login_at',
            label: 'LOGIN',
            sortable: true,
            render: (row) => (
                <span className="text-xs text-muted-foreground">
                    {row.last_login_at
                        ? new Date(row.last_login_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                        : <span className="italic">-</span>}
                </span>
            ),
        },
        {
            id: 'is_active',
            label: 'STATUS',
            sortable: true,
            align: 'center',
            render: (row) =>
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
                ),
        },
        {
            id: 'image',
            label: 'IMAGE',
            align: 'center',
            render: (row) => <UserAvatar name={row.nama_lengkap} />,
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
            <Head title="Users" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Kelola data pengguna sistem.
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

                <ServerDataTable<Pengguna>
                    endpoint="/pengguna/datatable"
                    columns={columns}
                    refreshTrigger={refreshTrigger}
                    emptyStateIcon={<Users className="h-7 w-7" />}
                    emptyStateTitle="Tidak ada pengguna"
                    emptyStateMessage="Belum ada pengguna yang ditambahkan. Silakan klik Tambah."
                />
            </div>

            <FormDialog
                open={formOpen}
                onClose={() => setFormOpen(false)}
                editData={editData}
                onSuccess={handleSuccess}
                jabatanList={jabatanList}
                gudangList={gudangList}
            />

            <DeleteDialog
                open={deleteOpen}
                pengguna={deleteTarget}
                onClose={() => setDeleteOpen(false)}
                onSuccess={handleSuccess}
            />
        </>
    );
}

PenggunaIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pengguna', href: '/pengguna' },
        { title: 'Users', href: '/pengguna' },
    ],
};
