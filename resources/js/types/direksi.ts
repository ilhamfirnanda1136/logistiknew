export interface Direksi {
    id: number;
    nama_direksi: string;
    keterangan: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface DireksiDatatableResponse {
    data: Direksi[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
}

export interface DireksiFormData {
    nama_direksi: string;
    keterangan: string;
    is_active: boolean;
}
