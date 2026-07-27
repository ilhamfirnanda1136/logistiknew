export interface Kendaraan {
    id: number;
    kode_kendaraan: string;
    nama_kendaraan: string;
    no_polisi: string | null;
    no_rangka: string | null;
    no_mesin: string | null;
    warna: string | null;
    jumlah: number;
    tanggal_input: string | null;
    tahun_perolehan: number | null;
    harga_perolehan: string | null;
    isi_silinder: string | null;
    masa_pakai: string | null;
    kondisi_id: number | null;
    gudang_id: number | null;
    kategori_id: number | null;
    keterangan: string | null;
    created_at: string;
    updated_at: string;
    kondisi?: { id: number; nama_kondisi: string } | null;
    gudang?: { id: number; nama_gudang: string; jenis_gudang: string } | null;
    kategori?: { id: number; nama_kategori: string } | null;
}

export interface KendaraanFormData {
    kode_kendaraan: string;
    nama_kendaraan: string;
    no_polisi: string;
    no_rangka: string;
    no_mesin: string;
    warna: string;
    jumlah: number | string;
    tanggal_input: string;
    tahun_perolehan: string;
    harga_perolehan: string;
    isi_silinder: string;
    masa_pakai: string;
    kondisi_id: number | null;
    gudang_id: number | null;
    kategori_id: number | null;
    keterangan: string;
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

export interface KategoriOption {
    id: number;
    nama_kategori: string;
}

export interface KendaraanFilters {
    gudang_id?: string;
    kategori_id?: string;
}
