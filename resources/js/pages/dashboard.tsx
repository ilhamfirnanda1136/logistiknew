import { Head } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    Box,
    Clock,
    DollarSign,
    MapPin,
    Package,
    ShoppingCart,
    Truck,
    TrendingUp,
    Users,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Timer,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { dashboard } from '@/routes';

// --- Stat Card Component ---
function StatCard({
    title,
    value,
    change,
    changeType,
    icon: Icon,
    iconColor,
    iconBg,
}: {
    title: string;
    value: string;
    change: string;
    changeType: 'up' | 'down';
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    iconBg: string;
}) {
    return (
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/80 shadow-lg shadow-black/[0.04] transition-all duration-300 hover:shadow-xl hover:shadow-black/[0.08] hover:-translate-y-0.5 dark:shadow-black/[0.2] dark:hover:shadow-black/[0.3]">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/[0.02] dark:to-white/[0.02]" />
            <CardContent className="relative p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                            {title}
                        </p>
                        <p className="text-3xl font-bold tracking-tight">
                            {value}
                        </p>
                        <div className="flex items-center gap-1.5">
                            {changeType === 'up' ? (
                                <div className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                                    <ArrowUpRight className="h-4 w-4" />
                                    <span className="text-sm font-semibold">{change}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400">
                                    <ArrowDownRight className="h-4 w-4" />
                                    <span className="text-sm font-semibold">{change}</span>
                                </div>
                            )}
                            <span className="text-xs text-muted-foreground">vs last month</span>
                        </div>
                    </div>
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} transition-transform duration-300 group-hover:scale-110`}
                    >
                        <Icon className={`h-6 w-6 ${iconColor}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// --- Mini Chart Visualization ---
function MiniBarChart({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data);
    return (
        <div className="flex items-end gap-1 h-12">
            {data.map((value, i) => (
                <div
                    key={i}
                    className={`w-2 rounded-full ${color} transition-all duration-500 ease-out`}
                    style={{
                        height: `${(value / max) * 100}%`,
                        opacity: 0.4 + (i / data.length) * 0.6,
                        animationDelay: `${i * 50}ms`,
                    }}
                />
            ))}
        </div>
    );
}

// --- Order Status Item ---
function OrderStatusItem({
    label,
    count,
    total,
    color,
    icon: Icon,
}: {
    label: string;
    count: number;
    total: number;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
}) {
    const percentage = Math.round((count / total) * 100);
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span className="text-sm font-medium">{label}</span>
                </div>
                <span className="text-sm font-semibold">{count}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${color.replace('text-', 'bg-')}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

// --- Shipment Row ---
function ShipmentRow({
    id,
    destination,
    status,
    eta,
    driver,
}: {
    id: string;
    destination: string;
    status: 'in_transit' | 'delivered' | 'delayed' | 'pending';
    eta: string;
    driver: string;
}) {
    const statusConfig = {
        in_transit: {
            label: 'In Transit',
            variant: 'default' as const,
            className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
        },
        delivered: {
            label: 'Delivered',
            variant: 'default' as const,
            className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
        },
        delayed: {
            label: 'Delayed',
            variant: 'default' as const,
            className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
        },
        pending: {
            label: 'Pending',
            variant: 'default' as const,
            className: 'bg-neutral-500/10 text-neutral-700 dark:text-neutral-400 border-neutral-500/20',
        },
    };

    const config = statusConfig[status];

    return (
        <div className="flex items-center justify-between py-3 group/row hover:bg-muted/50 -mx-4 px-4 rounded-lg transition-colors duration-200">
            <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20">
                    <Truck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <p className="text-sm font-semibold">{id}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {destination}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground">{driver}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Clock className="h-3 w-3" /> {eta}
                    </p>
                </div>
                <Badge
                    variant="outline"
                    className={`${config.className} text-[11px] font-medium`}
                >
                    {config.label}
                </Badge>
            </div>
        </div>
    );
}

// --- Activity Item ---
function ActivityItem({
    title,
    time,
    description,
    type,
}: {
    title: string;
    time: string;
    description: string;
    type: 'success' | 'warning' | 'info' | 'error';
}) {
    const typeConfig = {
        success: {
            icon: CheckCircle2,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
        },
        warning: {
            icon: AlertTriangle,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
        },
        info: {
            icon: Package,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
        },
        error: {
            icon: XCircle,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/20',
        },
    };

    const config = typeConfig[type];
    const Icon = config.icon;

    return (
        <div className="flex gap-3 group/activity">
            <div className="relative flex flex-col items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${config.bg} ${config.border} border`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div className="w-px flex-1 bg-border mt-1 group-last/activity:hidden" />
            </div>
            <div className="pb-6 flex-1">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{title}</p>
                    <span className="text-[11px] text-muted-foreground">{time}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
        </div>
    );
}

// --- Warehouse Card ---
function WarehouseCard({
    name,
    location,
    capacity,
    used,
}: {
    name: string;
    location: string;
    capacity: number;
    used: number;
}) {
    const percentage = Math.round((used / capacity) * 100);
    const isHigh = percentage > 80;

    return (
        <div className="rounded-xl border bg-card/50 p-4 space-y-3 transition-all duration-200 hover:shadow-md hover:bg-card">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {location}
                    </p>
                </div>
                <Badge
                    variant="outline"
                    className={`text-[10px] ${isHigh ? 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'}`}
                >
                    {percentage}% Full
                </Badge>
            </div>
            <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>{used.toLocaleString()} items</span>
                    <span>{capacity.toLocaleString()} max</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            isHigh
                                ? 'bg-gradient-to-r from-rose-400 to-rose-500'
                                : 'bg-gradient-to-r from-indigo-400 to-purple-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

// --- Main Dashboard ---
export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 overflow-x-auto">
                {/* Header Section */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Welcome back! Here&apos;s your supply chain overview for today.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Revenue"
                        value="Rp 847.2M"
                        change="+12.5%"
                        changeType="up"
                        icon={DollarSign}
                        iconColor="text-emerald-600 dark:text-emerald-400"
                        iconBg="bg-emerald-500/10"
                    />
                    <StatCard
                        title="Active Orders"
                        value="1,284"
                        change="+8.2%"
                        changeType="up"
                        icon={ShoppingCart}
                        iconColor="text-blue-600 dark:text-blue-400"
                        iconBg="bg-blue-500/10"
                    />
                    <StatCard
                        title="Shipments"
                        value="356"
                        change="-3.1%"
                        changeType="down"
                        icon={Truck}
                        iconColor="text-purple-600 dark:text-purple-400"
                        iconBg="bg-purple-500/10"
                    />
                    <StatCard
                        title="Customers"
                        value="2,847"
                        change="+15.3%"
                        changeType="up"
                        icon={Users}
                        iconColor="text-amber-600 dark:text-amber-400"
                        iconBg="bg-amber-500/10"
                    />
                </div>

                {/* Charts & Summary Row */}
                <div className="grid gap-4 lg:grid-cols-7">
                    {/* Revenue Chart Placeholder */}
                    <Card className="lg:col-span-4 border-0 shadow-lg shadow-black/[0.04] dark:shadow-black/[0.2]">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Revenue Overview</CardTitle>
                                    <CardDescription>Monthly revenue for the current year</CardDescription>
                                </div>
                                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                    <TrendingUp className="h-4 w-4" />
                                    <span className="text-sm font-semibold">+24.5%</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Simple Bar Visualization */}
                                <div className="flex items-end justify-between gap-2 h-40 pt-4">
                                    {[
                                        { label: 'Jan', value: 65 },
                                        { label: 'Feb', value: 45 },
                                        { label: 'Mar', value: 78 },
                                        { label: 'Apr', value: 52 },
                                        { label: 'May', value: 88 },
                                        { label: 'Jun', value: 95 },
                                        { label: 'Jul', value: 72 },
                                        { label: 'Aug', value: 84 },
                                        { label: 'Sep', value: 91 },
                                        { label: 'Oct', value: 68 },
                                        { label: 'Nov', value: 100 },
                                        { label: 'Dec', value: 82 },
                                    ].map((item, i) => (
                                        <div
                                            key={item.label}
                                            className="flex-1 flex flex-col items-center gap-1.5 group/bar"
                                        >
                                            <div className="w-full relative">
                                                <div
                                                    className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-purple-500 transition-all duration-500 group-hover/bar:from-indigo-400 group-hover/bar:to-purple-400 relative"
                                                    style={{
                                                        height: `${item.value * 1.4}px`,
                                                        animationDelay: `${i * 80}ms`,
                                                    }}
                                                >
                                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                                                        {item.value}M
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-medium">
                                                {item.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Status */}
                    <Card className="lg:col-span-3 border-0 shadow-lg shadow-black/[0.04] dark:shadow-black/[0.2]">
                        <CardHeader>
                            <CardTitle className="text-base">Order Status</CardTitle>
                            <CardDescription>Current order distribution</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <OrderStatusItem
                                label="Completed"
                                count={892}
                                total={1284}
                                color="text-emerald-500"
                                icon={CheckCircle2}
                            />
                            <OrderStatusItem
                                label="Processing"
                                count={234}
                                total={1284}
                                color="text-blue-500"
                                icon={Timer}
                            />
                            <OrderStatusItem
                                label="Pending"
                                count={128}
                                total={1284}
                                color="text-amber-500"
                                icon={AlertTriangle}
                            />
                            <OrderStatusItem
                                label="Cancelled"
                                count={30}
                                total={1284}
                                color="text-rose-500"
                                icon={XCircle}
                            />

                            <Separator />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 rounded-lg bg-muted/50">
                                    <p className="text-2xl font-bold">96.2%</p>
                                    <p className="text-xs text-muted-foreground mt-1">Fulfillment Rate</p>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-muted/50">
                                    <p className="text-2xl font-bold">2.4d</p>
                                    <p className="text-xs text-muted-foreground mt-1">Avg. Delivery</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Shipments & Activity Row */}
                <div className="grid gap-4 lg:grid-cols-7">
                    {/* Recent Shipments */}
                    <Card className="lg:col-span-4 border-0 shadow-lg shadow-black/[0.04] dark:shadow-black/[0.2]">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Recent Shipments</CardTitle>
                                    <CardDescription>Latest shipment activities</CardDescription>
                                </div>
                                <Badge variant="outline" className="text-[11px]">
                                    <Truck className="h-3 w-3 mr-1" />
                                    24 Active
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-0">
                            <ShipmentRow
                                id="SHP-2024-001"
                                destination="Jakarta, Indonesia"
                                status="in_transit"
                                eta="Est. 2h 30m"
                                driver="Ahmad Rizki"
                            />
                            <ShipmentRow
                                id="SHP-2024-002"
                                destination="Surabaya, Indonesia"
                                status="delivered"
                                eta="Completed"
                                driver="Budi Santoso"
                            />
                            <ShipmentRow
                                id="SHP-2024-003"
                                destination="Bandung, Indonesia"
                                status="delayed"
                                eta="Delayed 45m"
                                driver="Candra W."
                            />
                            <ShipmentRow
                                id="SHP-2024-004"
                                destination="Semarang, Indonesia"
                                status="in_transit"
                                eta="Est. 5h 15m"
                                driver="Dani Putra"
                            />
                            <ShipmentRow
                                id="SHP-2024-005"
                                destination="Medan, Indonesia"
                                status="pending"
                                eta="Scheduled"
                                driver="Eko Firmansyah"
                            />
                        </CardContent>
                    </Card>

                    {/* Activity Feed */}
                    <Card className="lg:col-span-3 border-0 shadow-lg shadow-black/[0.04] dark:shadow-black/[0.2]">
                        <CardHeader>
                            <CardTitle className="text-base">Recent Activity</CardTitle>
                            <CardDescription>Latest system events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ActivityItem
                                title="Order #1284 completed"
                                time="2m ago"
                                description="Package delivered to Jl. Sudirman No. 45, Jakarta"
                                type="success"
                            />
                            <ActivityItem
                                title="Low stock alert"
                                time="15m ago"
                                description="Item SKU-2847 is below minimum threshold (12 remaining)"
                                type="warning"
                            />
                            <ActivityItem
                                title="New shipment created"
                                time="1h ago"
                                description="SHP-2024-006 to Yogyakarta scheduled for tomorrow"
                                type="info"
                            />
                            <ActivityItem
                                title="Payment failed"
                                time="2h ago"
                                description="Order #1279 payment declined — awaiting retry"
                                type="error"
                            />
                            <ActivityItem
                                title="Inventory updated"
                                time="3h ago"
                                description="Bulk import completed: 247 items updated across 3 warehouses"
                                type="success"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Warehouse Overview */}
                <Card className="border-0 shadow-lg shadow-black/[0.04] dark:shadow-black/[0.2]">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Warehouse Overview</CardTitle>
                                <CardDescription>Storage capacity across all locations</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <MiniBarChart
                                    data={[40, 55, 70, 85, 60, 75, 90]}
                                    color="bg-indigo-500"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <WarehouseCard
                                name="Warehouse A"
                                location="Jakarta Utara"
                                capacity={10000}
                                used={7500}
                            />
                            <WarehouseCard
                                name="Warehouse B"
                                location="Surabaya"
                                capacity={8000}
                                used={4200}
                            />
                            <WarehouseCard
                                name="Warehouse C"
                                location="Bandung"
                                capacity={6000}
                                used={5400}
                            />
                            <WarehouseCard
                                name="Warehouse D"
                                location="Semarang"
                                capacity={5000}
                                used={2100}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats Footer */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-4 space-y-1 dark:from-indigo-500/10 dark:to-purple-500/10">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Box className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wide">Total Products</span>
                        </div>
                        <p className="text-2xl font-bold">4,521</p>
                        <p className="text-xs text-muted-foreground">Across 12 categories</p>
                    </div>
                    <div className="rounded-xl border bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-4 space-y-1 dark:from-emerald-500/10 dark:to-teal-500/10">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Truck className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wide">Deliveries Today</span>
                        </div>
                        <p className="text-2xl font-bold">47</p>
                        <p className="text-xs text-muted-foreground">38 completed, 9 in transit</p>
                    </div>
                    <div className="rounded-xl border bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-4 space-y-1 dark:from-amber-500/10 dark:to-orange-500/10">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wide">Low Stock Items</span>
                        </div>
                        <p className="text-2xl font-bold">23</p>
                        <p className="text-xs text-muted-foreground">Requires immediate attention</p>
                    </div>
                    <div className="rounded-xl border bg-gradient-to-br from-rose-500/5 to-pink-500/5 p-4 space-y-1 dark:from-rose-500/10 dark:to-pink-500/10">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wide">Active Suppliers</span>
                        </div>
                        <p className="text-2xl font-bold">156</p>
                        <p className="text-xs text-muted-foreground">8 new this month</p>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
