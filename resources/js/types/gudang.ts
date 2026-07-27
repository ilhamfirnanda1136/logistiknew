export interface Gudang {
    id: number;
    nama_gudang: string;
    jenis_gudang: 'Pusat' | 'Cabang';
    keterangan?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    created_at?: string;
    updated_at?: string;
}

export interface GudangFormData {
    nama_gudang: string;
    jenis_gudang: 'Pusat' | 'Cabang' | '';
    keterangan: string;
    latitude: string;
    longitude: string;
}
