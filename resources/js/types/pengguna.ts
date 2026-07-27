export interface Pengguna {
    id: number;
    jabatan_id: number;
    gudang_id: number | null;
    username: string;
    nama_lengkap: string;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
    jabatan?: {
        id: number;
        nama_jabatan: string;
        level_akses: string;
    };
    gudang?: {
        id: number;
        nama_gudang: string;
        jenis_gudang: string;
    } | null;
}

export interface PenggunaFormData {
    username: string;
    nama_lengkap: string;
    password: string;
    jabatan_id: number | string;
    gudang_id: number | string | null;
    is_active: boolean;
}

export interface JabatanOption {
    id: number;
    nama_jabatan: string;
    level_akses: string;
}

export interface GudangOption {
    id: number;
    nama_gudang: string;
    jenis_gudang: string;
}
