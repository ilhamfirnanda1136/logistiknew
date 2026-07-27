export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-full overflow-hidden shrink-0">
                <img src="/img/logo.png" alt="Logo" className="size-8 object-contain" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="truncate font-bold leading-tight">
                    Logistik &amp; Asset
                </span>
            </div>
        </>
    );
}
