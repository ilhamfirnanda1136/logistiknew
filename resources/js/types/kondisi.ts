export interface Kondisi {
    id: number;
    nama_kondisi: string;
    keterangan: string | null;
    created_at: string;
    updated_at: string;
}

export interface KondisiFormData {
    nama_kondisi: string;
    keterangan: string;
}
