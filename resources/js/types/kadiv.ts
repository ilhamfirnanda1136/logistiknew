export interface Kadiv {
    id: number;
    nama_kadiv: string;
    npp: string | null;
    keterangan: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface KadivDatatableResponse {
    data: Kadiv[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
}

export interface KadivFormData {
    nama_kadiv: string;
    npp: string;
    keterangan: string;
    is_active: boolean;
}
