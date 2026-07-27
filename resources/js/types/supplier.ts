export interface Supplier {
    id: number;
    nama_supplier: string;
    no_telepon?: string;
    alamat?: string;
    keterangan?: string;
    created_at?: string;
    updated_at?: string;
}

export interface SupplierFormData {
    nama_supplier: string;
    no_telepon: string;
    alamat: string;
    keterangan: string;
}
