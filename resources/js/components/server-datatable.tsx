import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronsLeft,
    ChevronsRight,
    ChevronsUpDown,
    Loader2,
    Search,
    X,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiGet } from '@/lib/api';

export interface DatatableParams {
    search: string;
    sort_by: string;
    sort_dir: 'asc' | 'desc';
    per_page: number;
    page: number;
}

export interface DatatableResponse<T> {
    data: T[];
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    from?: number | null;
    to?: number | null;
}

export interface ColumnDef<T> {
    id: string;
    label: string;
    sortable?: boolean;
    align?: 'left' | 'center' | 'right';
    width?: string;
    render?: (row: T, index: number, from: number | null) => React.ReactNode;
}

interface ServerDataTableProps<T> {
    endpoint: string;
    columns: ColumnDef<T>[];
    refreshTrigger?: number;
    searchPlaceholder?: string;
    emptyStateIcon?: React.ReactNode;
    emptyStateTitle?: string;
    emptyStateMessage?: string;
    extraParams?: Record<string, string | number | null | undefined>;
}

function SortIcon({ column, currentCol, direction }: { column: string; currentCol: string; direction: 'asc' | 'desc' }) {
    if (currentCol !== column) return <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 text-muted-foreground/50" />;
    return direction === 'asc'
        ? <ChevronUp className="ml-1 inline h-3.5 w-3.5 text-primary" />
        : <ChevronDown className="ml-1 inline h-3.5 w-3.5 text-primary" />;
}

/** Stable empty object — jangan pakai `{}` sebagai default param (new ref tiap render). */
const EMPTY_EXTRA_PARAMS: Record<string, string | number | null | undefined> = {};

export function ServerDataTable<T extends Record<string, any>>({
    endpoint,
    columns,
    refreshTrigger = 0,
    searchPlaceholder = 'Search...',
    emptyStateIcon,
    emptyStateTitle = 'Tidak ada data',
    emptyStateMessage = 'Belum ada data yang ditambahkan.',
    extraParams,
}: ServerDataTableProps<T>) {
    const extraParamsRef = useRef(extraParams ?? EMPTY_EXTRA_PARAMS);
    extraParamsRef.current = extraParams ?? EMPTY_EXTRA_PARAMS;
    const extraParamsKey = JSON.stringify(extraParams ?? EMPTY_EXTRA_PARAMS);

    const [rows, setRows] = useState<T[]>([]);
    const [meta, setMeta] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: null as number | null,
        to: null as number | null,
    });
    const [loading, setLoading] = useState(false);

    const [params, setParams] = useState<DatatableParams>({
        search: '',
        sort_by: 'id',
        sort_dir: 'asc',
        per_page: 10,
        page: 1,
    });

    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [searchInput, setSearchInput] = useState('');

    const fetchData = useCallback(async (p: DatatableParams) => {
        setLoading(true);
        try {
            const response = await apiGet<DatatableResponse<T>>(endpoint, {
                ...p,
                ...extraParamsRef.current,
            } as unknown as Record<string, unknown>);
            setRows(response.data || []);
            
            if (response.meta) {
                setMeta(response.meta);
            } else if (response.total !== undefined) {
                setMeta({
                    current_page: response.current_page ?? 1,
                    last_page: response.last_page ?? 1,
                    per_page: response.per_page ?? 10,
                    total: response.total ?? 0,
                    from: response.from ?? null,
                    to: response.to ?? null,
                });
            } else {
                setMeta({ current_page: 1, last_page: 1, per_page: 10, total: 0, from: null, to: null });
            }
        } catch {
            toast.error('Gagal memuat data. Silakan refresh halaman.');
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    useEffect(() => {
        fetchData(params);
    }, [params, refreshTrigger, fetchData, extraParamsKey]);

    const handleSearch = (value: string) => {
        setSearchInput(value);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setParams((prev) => ({ ...prev, search: value, page: 1 }));
        }, 400);
    };

    const handleSort = (column: string, sortable?: boolean) => {
        if (!sortable) return;
        setParams((prev) => ({
            ...prev,
            sort_by: column,
            sort_dir: prev.sort_by === column && prev.sort_dir === 'asc' ? 'desc' : 'asc',
            page: 1,
        }));
    };

    const handlePerPage = (value: string) => {
        setParams((prev) => ({ ...prev, per_page: Number(value), page: 1 }));
    };

    const handlePage = (page: number) => {
        setParams((prev) => ({ ...prev, page }));
    };

    const pageNumbers = () => {
        const pages: (number | '...')[] = [];
        const { current_page, last_page } = meta;
        if (last_page <= 7) {
            for (let i = 1; i <= last_page; i++) pages.push(i);
        } else {
            pages.push(1);
            if (current_page > 3) pages.push('...');
            for (let i = Math.max(2, current_page - 1); i <= Math.min(last_page - 1, current_page + 1); i++) {
                pages.push(i);
            }
            if (current_page < last_page - 2) pages.push('...');
            pages.push(last_page);
        }
        return pages;
    };

    const thClass =
        'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none transition-colors';
    const tdClass = 'px-4 py-3 text-sm';

    return (
        <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] overflow-hidden dark:shadow-black/[0.2]">
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b bg-muted/20">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Show</span>
                    <Select value={String(params.per_page)} onValueChange={handlePerPage}>
                        <SelectTrigger className="h-8 w-[68px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 25, 50, 100].map((n) => (
                                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span>Entries</span>
                </div>

                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchInput}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-9 pr-8 h-8"
                    />
                    {searchInput && (
                        <button
                            onClick={() => {
                                setSearchInput('');
                                setParams((p) => ({ ...p, search: '', page: 1 }));
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b bg-muted/40">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.id}
                                    className={`${thClass} text-${col.align ?? 'left'} ${col.width ?? ''} ${col.sortable ? 'cursor-pointer hover:text-foreground' : ''}`}
                                    onClick={() => handleSort(col.id, col.sortable)}
                                >
                                    {col.label}
                                    {col.sortable && <SortIcon column={col.id} currentCol={params.sort_by} direction={params.sort_dir} />}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                                        <span className="text-sm">Memuat data...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                        {emptyStateIcon && (
                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted opacity-40">
                                                {emptyStateIcon}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-sm">{emptyStateTitle}</p>
                                            <p className="text-xs mt-0.5">
                                                {params.search
                                                    ? `Tidak ada hasil untuk "${params.search}"`
                                                    : emptyStateMessage}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, index) => {
                                return (
                                    <tr key={row.id ?? index} className="transition-colors hover:bg-muted/30">
                                        {columns.map((col) => (
                                            <td key={col.id} className={`${tdClass} text-${col.align ?? 'left'}`}>
                                                {col.render ? col.render(row, index, meta.from) : row[col.id]}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between bg-muted/10">
                <p className="text-xs text-muted-foreground">
                    {meta.total > 0
                        ? `Showing ${meta.from ?? 0} to ${meta.to ?? 0} of ${meta.total} entries`
                        : 'No data available'}
                </p>

                {meta.last_page > 1 && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handlePage(1)}
                            disabled={meta.current_page === 1}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-xs text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                        >
                            <ChevronsLeft className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => handlePage(meta.current_page - 1)}
                            disabled={meta.current_page === 1}
                            className="inline-flex h-8 px-3 items-center justify-center rounded-md border text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                        >
                            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                            Previous
                        </button>

                        {pageNumbers().map((p, i) =>
                            p === '...' ? (
                                <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground">···</span>
                            ) : (
                                <button
                                    key={p}
                                    onClick={() => handlePage(p as number)}
                                    className={`inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors ${
                                        meta.current_page === p
                                            ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    {p}
                                </button>
                            ),
                        )}

                        <button
                            onClick={() => handlePage(meta.current_page + 1)}
                            disabled={meta.current_page === meta.last_page}
                            className="inline-flex h-8 px-3 items-center justify-center rounded-md border text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                        >
                            Next
                            <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => handlePage(meta.last_page)}
                            disabled={meta.current_page === meta.last_page}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-xs text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                        >
                            <ChevronsRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
