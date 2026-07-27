export interface Inventaris {
    id: number;
    kode_barang: string;
    tanggal_input: string | null;
    tanggal_perolehan: string | null;
    no_inventaris: string | null;
    nama_inventaris: string;
    merek: string | null;
    jumlah: number;
    dimensi_id: number | null;
    satuan_id: number | null;
    kategori_id: number | null;
    kondisi_id: number | null;
    gudang_id: number | null;
    keterangan: string | null;
    created_at: string;
    updated_at: string;
    dimensi?: { id: number; nama_dimensi: string } | null;
    satuan?: { id: number; nama_satuan: string } | null;
    kategori?: { id: number; nama_kategori: string } | null;
    kondisi?: { id: number; nama_kondisi: string } | null;
    gudang?: { id: number; nama_gudang: string; jenis_gudang: string } | null;
}

export interface InventarisFormData {
    kode_barang: string;
    tanggal_input: string;
    tanggal_perolehan: string;
    no_inventaris: string;
    nama_inventaris: string;
    merek: string;
    jumlah: number | string;
    dimensi_id: number | null;
    satuan_id: number | null;
    kategori_id: number | null;
    kondisi_id: number | null;
    gudang_id: number | null;
    keterangan: string;
}

export interface DimensiOption {
    id: number;
    nama_dimensi: string;
}

export interface SatuanOption {
    id: number;
    nama_satuan: string;
}

export interface KategoriOption {
    id: number;
    nama_kategori: string;
}

export interface KondisiOption {
    id: number;
    nama_kondisi: string;
}

export interface GudangOption {
    id: number;
    nama_gudang: string;
    jenis_gudang: string;
}

export interface InventarisFilters {
    gudang_id?: string;
    kategori_id?: string;
}
