export interface Divisi {
    id: number;
    nama_divisi: string;
    keterangan: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface DivisiDatatableResponse {
    data: Divisi[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
}

export interface DivisiFormData {
    nama_divisi: string;
    keterangan: string;
    is_active: boolean;
}
