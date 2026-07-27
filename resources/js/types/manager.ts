export interface Manager {
    id: number;
    nama_manager: string;
    npp: string | null;
    keterangan: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ManagerDatatableResponse {
    data: Manager[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
}

export interface ManagerFormData {
    nama_manager: string;
    npp: string;
    keterangan: string;
    is_active: boolean;
}
