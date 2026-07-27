export interface Jabatan {
    id: number;
    nama_jabatan: string;
    level_akses: string;
    level_urutan: number;
    keterangan: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface JabatanDatatableResponse {
    data: Jabatan[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
}

export interface JabatanFormData {
    nama_jabatan: string;
    level_akses: string;
    level_urutan: number | string;
    keterangan: string;
    is_active: boolean;
}

export type SortDirection = 'asc' | 'desc';

export interface DatatableParams {
    search: string;
    sort_by: string;
    sort_dir: SortDirection;
    per_page: number;
    page: number;
}
