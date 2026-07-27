import { Head } from '@inertiajs/react';
import { Building, Edit2, Loader2, MapPin, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ColumnDef, ServerDataTable } from '@/components/server-datatable';
import { ApiError, apiDelete, apiPost, apiPut } from '@/lib/api';
import type { Gudang, GudangFormData } from '@/types/gudang';

// Fix default Leaflet marker icons (Vite bundling)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-expect-error Leaflet default icon path override
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const EMPTY_FORM: GudangFormData = {
    nama_gudang: '',
    jenis_gudang: '',
    keterangan: '',
    latitude: '',
    longitude: '',
};

interface FormDialogProps {
    open: boolean;
    onClose: () => void;
    editData: Gudang | null;
    onSuccess: () => void;
}

function FormDialog({ open, onClose, editData, onSuccess }: FormDialogProps) {
    const [form, setForm] = useState<GudangFormData>(EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof GudangFormData, string>>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editData) {
            setForm({
                nama_gudang: editData.nama_gudang,
                jenis_gudang: editData.jenis_gudang,
                keterangan: editData.keterangan ?? '',
                latitude: editData.latitude != null ? String(editData.latitude) : '',
                longitude: editData.longitude != null ? String(editData.longitude) : '',
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setErrors({});
    }, [editData, open]);

    const handleChange = (field: keyof GudangFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const payload = {
            ...form,
            latitude: form.latitude !== '' ? Number(form.latitude) : null,
            longitude: form.longitude !== '' ? Number(form.longitude) : null,
        };

        try {
            if (editData) {
                await apiPut(`/gudang/${editData.id}`, payload);
                toast.success('Gudang berhasil diperbarui!');
            } else {
                await apiPost('/gudang', payload);
                toast.success('Gudang berhasil ditambahkan!');
            }
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const apiErr = err as { status?: number; data?: ApiError };
            if (apiErr?.status === 422 && apiErr?.data?.errors) {
                const mapped: Partial<Record<keyof GudangFormData, string>> = {};
                Object.entries(apiErr.data.errors).forEach(([key, msgs]) => {
                    mapped[key as keyof GudangFormData] = msgs[0];
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
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                            <Building className="h-4 w-4 text-primary" />
                        </span>
                        {editData ? 'Edit Gudang' : 'Form Tambah Gudang'}
                    </DialogTitle>
                </DialogHeader>

                <Separator />

                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                        <Label htmlFor="nama_gudang">
                            Nama Gudang <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="nama_gudang"
                            value={form.nama_gudang}
                            onChange={(e) => handleChange('nama_gudang', e.target.value)}
                            autoFocus
                            className={errors.nama_gudang ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                        {errors.nama_gudang && (
                            <p className="text-xs text-destructive">{errors.nama_gudang}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="jenis_gudang">
                            Jenis Gudang <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={form.jenis_gudang}
                            onValueChange={(v) => handleChange('jenis_gudang', v)}
                        >
                            <SelectTrigger className={errors.jenis_gudang ? 'border-destructive' : ''}>
                                <SelectValue placeholder="-- pilih jenis gudang --" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pusat">Pusat</SelectItem>
                                <SelectItem value="Cabang">Cabang</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.jenis_gudang && (
                            <p className="text-xs text-destructive">{errors.jenis_gudang}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="latitude">Latitude</Label>
                            <Input
                                id="latitude"
                                type="number"
                                step="any"
                                value={form.latitude}
                                onChange={(e) => handleChange('latitude', e.target.value)}
                                placeholder="-6.2088"
                                className={errors.latitude ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            {errors.latitude && (
                                <p className="text-xs text-destructive">{errors.latitude}</p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="longitude">Longitude</Label>
                            <Input
                                id="longitude"
                                type="number"
                                step="any"
                                value={form.longitude}
                                onChange={(e) => handleChange('longitude', e.target.value)}
                                placeholder="106.8456"
                                className={errors.longitude ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            {errors.longitude && (
                                <p className="text-xs text-destructive">{errors.longitude}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="keterangan">Keterangan</Label>
                        <textarea
                            id="keterangan"
                            value={form.keterangan}
                            onChange={(e) => handleChange('keterangan', e.target.value)}
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

interface MapDialogProps {
    open: boolean;
    gudang: Gudang | null;
    onClose: () => void;
}

function MapDialog({ open, gudang, onClose }: MapDialogProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);

    const hasCoords =
        gudang?.latitude != null &&
        gudang?.longitude != null &&
        !Number.isNaN(Number(gudang.latitude)) &&
        !Number.isNaN(Number(gudang.longitude));

    useEffect(() => {
        if (!open || !gudang || !hasCoords) {
            return;
        }

        let cancelled = false;
        let resizeObserver: ResizeObserver | null = null;

        const initMap = () => {
            const el = mapContainerRef.current;
            if (!el || cancelled) return false;

            // Container must have real size (dialog animation selesai)
            if (el.clientWidth === 0 || el.clientHeight === 0) return false;

            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }

            const lat = Number(gudang.latitude);
            const lng = Number(gudang.longitude);

            const map = L.map(el, {
                center: [lat, lng],
                zoom: 15,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map);

            L.marker([lat, lng])
                .addTo(map)
                .bindPopup(
                    `<strong>${gudang.nama_gudang}</strong><br/>Lat: ${lat}<br/>Lng: ${lng}`,
                )
                .openPopup();

            mapRef.current = map;

            // Paksa Leaflet hitung ulang ukuran setelah modal terbuka
            requestAnimationFrame(() => {
                map.invalidateSize();
                setTimeout(() => map.invalidateSize(), 200);
            });

            return true;
        };

        // Coba beberapa kali sampai container siap (Dialog Radix butuh waktu mount)
        let attempts = 0;
        const tryInit = () => {
            if (cancelled) return;
            if (initMap()) return;
            attempts += 1;
            if (attempts < 20) {
                setTimeout(tryInit, 50);
            }
        };

        // Mulai setelah frame berikutnya agar DialogContent sudah di DOM
        const startTimer = setTimeout(tryInit, 50);

        // Juga observe ukuran container
        if (mapContainerRef.current) {
            resizeObserver = new ResizeObserver(() => {
                mapRef.current?.invalidateSize();
            });
            resizeObserver.observe(mapContainerRef.current);
        }

        return () => {
            cancelled = true;
            clearTimeout(startTimer);
            resizeObserver?.disconnect();
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [open, gudang, hasCoords]);

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10">
                            <MapPin className="h-4 w-4 text-violet-600" />
                        </span>
                        Lokasi / Peta
                        {gudang && (
                            <span className="text-sm font-normal text-muted-foreground">
                                — {gudang.nama_gudang}
                            </span>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <Separator />

                {!hasCoords ? (
                    <div className="flex h-[360px] items-center justify-center rounded-lg border bg-muted/40 text-sm text-muted-foreground">
                        Koordinat belum diisi untuk gudang ini.
                    </div>
                ) : (
                    <div
                        ref={mapContainerRef}
                        className="h-[360px] w-full rounded-lg overflow-hidden border relative z-0 [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-pane]:z-[1] [&_.leaflet-control]:z-[2]"
                        style={{ minHeight: 360 }}
                    />
                )}

                <div className="flex justify-end pt-1">
                    <Button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-500 hover:bg-gray-600 text-white"
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
    gudang: Gudang | null;
    onClose: () => void;
    onSuccess: () => void;
}

function DeleteDialog({ open, gudang, onClose, onSuccess }: DeleteDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!gudang) return;
        setLoading(true);
        try {
            await apiDelete(`/gudang/${gudang.id}`);
            toast.success('Gudang berhasil dihapus.');
            onSuccess();
            onClose();
        } catch {
            toast.error('Gagal menghapus gudang. Silakan coba lagi.');
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
                        Hapus Gudang
                    </DialogTitle>
                </DialogHeader>

                <Separator />

                <div className="space-y-3 py-2">
                    <p className="text-sm text-muted-foreground">
                        Apakah Anda yakin ingin menghapus gudang{' '}
                        <span className="font-semibold text-foreground">"{gudang?.nama_gudang}"</span>?
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

export default function GudangIndex() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [formOpen, setFormOpen] = useState(false);
    const [editData, setEditData] = useState<Gudang | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Gudang | null>(null);
    const [mapOpen, setMapOpen] = useState(false);
    const [mapTarget, setMapTarget] = useState<Gudang | null>(null);

    const openCreate = () => {
        setEditData(null);
        setFormOpen(true);
    };

    const openEdit = (row: Gudang) => {
        setEditData(row);
        setFormOpen(true);
    };

    const openDelete = (row: Gudang) => {
        setDeleteTarget(row);
        setDeleteOpen(true);
    };

    const openMap = (row: Gudang) => {
        setMapTarget(row);
        setMapOpen(true);
    };

    const handleSuccess = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    const columns: ColumnDef<Gudang>[] = [
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
            id: 'nama_gudang',
            label: 'NAMA GUDANG',
            sortable: true,
            render: (row) => <span className="font-medium">{row.nama_gudang}</span>,
        },
        {
            id: 'jenis_gudang',
            label: 'JENIS GUDANG',
            sortable: true,
            align: 'center',
            render: (row) => (
                <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-white ${
                        row.jenis_gudang === 'Pusat' ? 'bg-blue-600' : 'bg-orange-500'
                    }`}
                >
                    {row.jenis_gudang}
                </span>
            ),
        },
        {
            id: 'lokasi_peta',
            label: 'LOKASI / PETA',
            align: 'center',
            render: (row) => (
                <button
                    onClick={() => openMap(row)}
                    className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors"
                    title="Lihat Peta"
                >
                    <MapPin className="h-3 w-3" />
                    LOKASI / PETA
                </button>
            ),
        },
        {
            id: 'keterangan',
            label: 'KETERANGAN',
            render: (row) => (
                <span className="text-muted-foreground text-xs line-clamp-2 max-w-[200px]">
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
            <Head title="Gudang" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Gudang</h1>
                    </div>
                    <Button
                        onClick={openCreate}
                        className="mt-3 sm:mt-0 gap-2 self-start sm:self-auto bg-[#16a34a] hover:bg-[#15803d] text-white"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah
                    </Button>
                </div>

                <ServerDataTable<Gudang>
                    endpoint="/gudang/datatable"
                    columns={columns}
                    refreshTrigger={refreshTrigger}
                    emptyStateIcon={<Building className="h-7 w-7" />}
                    emptyStateTitle="Tidak ada data gudang"
                    emptyStateMessage="Belum ada gudang yang ditambahkan."
                />
            </div>

            <FormDialog
                open={formOpen}
                onClose={() => setFormOpen(false)}
                editData={editData}
                onSuccess={handleSuccess}
            />

            <MapDialog
                open={mapOpen}
                gudang={mapTarget}
                onClose={() => setMapOpen(false)}
            />

            <DeleteDialog
                open={deleteOpen}
                gudang={deleteTarget}
                onClose={() => setDeleteOpen(false)}
                onSuccess={handleSuccess}
            />
        </>
    );
}

GudangIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Master', href: '#' },
        { title: 'Gudang', href: '/gudang' },
    ],
};
