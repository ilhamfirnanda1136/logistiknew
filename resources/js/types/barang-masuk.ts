export interface BarangOption {
    id: number;
    kode_barang: string;
    nama_barang: string;
    dimensi_id: number | null;
    satuan_id: number | null;
    stok: string;
    dimensi?: { id: number; nama_dimensi: string } | null;
    satuan?: { id: number; nama_satuan: string } | null;
}

export interface SupplierOption {
    id: number;
    nama_supplier: string;
}

export interface GudangOption {
    id: number;
    nama_gudang: string;
}

export interface BarangMasukDetail {
    id: number;
    barang_id: number;
    jumlah: string;
    barang?: BarangOption | null;
}

export interface BarangMasuk {
    id: number;
    no_transaksi: string;
    tanggal: string;
    supplier_id: number;
    gudang_id: number | null;
    keterangan: string | null;
    created_at: string;
    updated_at: string;
    supplier?: SupplierOption | null;
    gudang?: GudangOption | null;
    details: BarangMasukDetail[];
}

export interface BarangMasukItemForm {
    key: string;
    barang_id: number | null;
    jumlah: string;
}

export interface BarangMasukFormData {
    tanggal: string;
    supplier_id: number | null;
    gudang_id: number | null;
    keterangan: string;
    items: BarangMasukItemForm[];
}
