import { Link, router } from '@inertiajs/react';
import {
    ArrowRightLeft,
    BarChart3,
    Box,
    Building2,
    ChevronRight,
    ClipboardList,
    Cpu,
    FileText,
    LayoutDashboard,
    LogOut,
    PackageMinus,
    PackagePlus,
    RotateCcw,
    Ruler,
    Scale,
    Shield,
    Store,
    Tag,
    Users,
    Warehouse,
    UserCog,
    Car,
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { dashboard, logout } from '@/routes';
import { useCurrentUrl } from '@/hooks/use-current-url';

type NavItem = {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    children?: { title: string; href: string; icon?: React.ComponentType<{ className?: string }> }[];
};

// ── nav groups sesuai gambar ──────────────────────────────────────────────────

const homeItems: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
];

const masterItems: NavItem[] = [
    { title: 'Jabatan', href: '/jabatan', icon: FileText },
    { title: 'Divisi', href: '/divisi', icon: Building2 },
    { title: 'Direksi', href: '/direksi', icon: Building2 },
    { title: 'Manager', href: '/manager', icon: Building2 },
    { title: 'Kadiv', href: '/kadiv', icon: Building2 },
    { title: 'Supplier', href: '/supplier', icon: Store },
    { title: 'Gudang', href: '/gudang', icon: Warehouse },
    {
        title: 'Master Barang',
        href: '/barang',
        icon: Box,
        children: [
            { title: 'Dimensi Barang', href: '/barang/dimensi', icon: Ruler },
            { title: 'Satuan Barang', href: '/barang/satuan', icon: Scale },
            { title: 'Kategori Barang', href: '/barang/kategori', icon: Tag },
            { title: 'Data Barang', href: '/barang', icon: ClipboardList },
        ],
    },
];

const assetItems: NavItem[] = [
    { title: 'Kondisi', href: '/kondisi', icon: ClipboardList },
    { title: 'Asset', href: '/asset', icon: Cpu },
    { title: 'Kendaraan Dinas', href: '/kendaraan-dinas', icon: Car },
];

const transaksiItems: NavItem[] = [
    {
        title: 'Transaksi',
        href: '/transaksi',
        icon: ArrowRightLeft,
        children: [
            { title: 'Barang Masuk', href: '/transaksi/barang-masuk', icon: PackagePlus },
            { title: 'Barang Keluar', href: '/transaksi/barang-keluar', icon: PackageMinus },
            { title: 'Barang Retur', href: '/transaksi/barang-retur', icon: RotateCcw },
            { title: 'DPPB', href: '/transaksi/dppb', icon: FileText },
            { title: 'DPB', href: '/transaksi/dpb', icon: FileText },
            { title: 'PP', href: '/transaksi/pp', icon: FileText },
            { title: 'BPB', href: '/transaksi/bpb', icon: FileText },
            { title: 'BPPB', href: '/transaksi/bppb', icon: FileText },
        ],
    },
];

const mutasiItems: NavItem[] = [
    { title: 'Mutasi Masuk', href: '/mutasi/masuk', icon: PackagePlus, badge: 25 },
    { title: 'Mutasi Keluar', href: '/mutasi/keluar', icon: PackageMinus, badge: 75 },
];

const laporanItems: NavItem[] = [
    {
        title: 'Laporan',
        href: '/laporan',
        icon: BarChart3,
        children: [
            { title: 'Laporan Transaksi', href: '/laporan/transaksi' },
            { title: 'Laporan Mutasi', href: '/laporan/mutasi' },
            { title: 'Laporan Asset', href: '/laporan/asset' },
        ],
    },
];

const userItems: NavItem[] = [
    { title: 'Data Pengguna', href: '/pengguna', icon: Users },
    { title: 'Level Akses', href: '/level-akses', icon: Shield },
];

// ── reusable nav-group component ────────────────────────────────────────────

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) =>
                    item.children ? (
                        <Collapsible
                            key={item.title}
                            asChild
                            defaultOpen={isCurrentOrParentUrl(item.href)}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        isActive={isCurrentOrParentUrl(item.href)}
                                    >
                                        <item.icon className="size-4" />
                                        <span>{item.title}</span>
                                        <ChevronRight className="ml-auto size-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.children.map((child) => (
                                            <SidebarMenuSubItem key={child.title}>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    isActive={isCurrentUrl(child.href)}
                                                >
                                                    <Link href={child.href}>
                                                        {child.icon && <child.icon className="size-3 opacity-60" />}
                                                        <span>{child.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    ) : (
                        <SidebarMenuItem key={item.title} className="relative">
                            <SidebarMenuButton
                                asChild
                                isActive={isCurrentUrl(item.href)}
                                tooltip={item.title}
                            >
                                <Link href={item.href}>
                                    <item.icon className="size-4" />
                                    <span>{item.title}</span>
                                    {item.badge !== undefined && (
                                        <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white group-data-[collapsible=icon]:hidden">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ),
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
}

// ── main sidebar ──────────────────────────────────────────────────────────────

export function AppSidebar() {
    const handleLogout = () => {
        router.flushAll();
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* Header – Logo */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-full overflow-hidden shrink-0">
                                    <img src="/img/logo.png" alt="Logo" className="size-8 object-contain" />
                                </div>
                                <div className="ml-1 grid flex-1 text-left text-sm">
                                    <span className="truncate font-bold leading-tight">
                                        Logistik &amp; Asset
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavGroup label="Home" items={homeItems} />
                <NavGroup label="Data Master" items={masterItems} />
                <NavGroup label="Asset" items={assetItems} />
                <NavGroup label="Transaksi" items={transaksiItems} />
                <NavGroup label="Mutasi" items={mutasiItems} />
                <NavGroup label="Laporan" items={laporanItems} />
                <NavGroup label="Data User" items={userItems} />
            </SidebarContent>

            {/* Footer – Log Out */}
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip="Log Out"
                            className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                        >
                            <Link
                                href={logout()}
                                method="post"
                                as="button"
                                onClick={handleLogout}
                                data-test="logout-button"
                                className="flex w-full items-center"
                            >
                                <LogOut className="size-4" />
                                <span>Log Out</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
