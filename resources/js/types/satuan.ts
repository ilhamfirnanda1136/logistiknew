export interface Satuan {
    id: number;
    nama_satuan: string;
    keterangan: string | null;
    created_at: string;
    updated_at: string;
}

export interface SatuanFormData {
    nama_satuan: string;
    keterangan: string;
}
