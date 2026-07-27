export interface Kategori {
    id: number;
    nama_kategori: string;
    keterangan: string | null;
    created_at: string;
    updated_at: string;
}

export interface KategoriFormData {
    nama_kategori: string;
    keterangan: string;
}
