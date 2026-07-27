export interface Barang {
    id: number;
    kode_barang: string;
    nama_barang: string;
    dimensi_id: number | null;
    satuan_id: number | null;
    kategori_id: number | null;
    gudang_id: number | null;
    stok: string; // decimal from Laravel comes as string
    is_item_sr: boolean;
    keterangan: string | null;
    created_at: string;
    updated_at: string;
    dimensi?: { id: number; nama_dimensi: string } | null;
    satuan?: { id: number; nama_satuan: string } | null;
    kategori?: { id: number; nama_kategori: string } | null;
    gudang?: { id: number; nama_gudang: string; jenis_gudang: string } | null;
}

export interface BarangFormData {
    kode_barang: string;
    nama_barang: string;
    dimensi_id: number | null;
    satuan_id: number | null;
    kategori_id: number | null;
    gudang_id: number | null;
    stok: string;
    is_item_sr: boolean;
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

export interface GudangOption {
    id: number;
    nama_gudang: string;
    jenis_gudang: string;
}
