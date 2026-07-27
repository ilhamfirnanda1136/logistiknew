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

export interface GudangOption {
    id: number;
    nama_gudang: string;
}

export interface BarangKeluarDetail {
    id: number;
    barang_id: number;
    jumlah: string;
    barang?: BarangOption | null;
}

export interface BarangKeluar {
    id: number;
    no_transaksi: string;
    tanggal: string;
    gudang_id: number | null;
    keterangan: string | null;
    created_at: string;
    updated_at: string;
    gudang?: GudangOption | null;
    details: BarangKeluarDetail[];
}

export interface BarangKeluarItemForm {
    key: string;
    barang_id: number | null;
    jumlah: string;
}

export interface BarangKeluarFormData {
    tanggal: string;
    gudang_id: number | null;
    keterangan: string;
    items: BarangKeluarItemForm[];
}
