export interface Dimensi {
    id: number;
    nama_dimensi: string;
    keterangan: string | null;
    created_at: string;
    updated_at: string;
}

export interface DimensiFormData {
    nama_dimensi: string;
    keterangan: string;
}
