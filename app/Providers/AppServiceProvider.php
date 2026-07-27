<?php

namespace App\Providers;

use App\Contracts\Repositories\BarangKeluarRepositoryInterface;
use App\Contracts\Repositories\BarangMasukRepositoryInterface;
use App\Contracts\Repositories\BarangRepositoryInterface;
use App\Contracts\Repositories\DireksiRepositoryInterface;
use App\Contracts\Repositories\DimensiRepositoryInterface;
use App\Contracts\Repositories\DivisiRepositoryInterface;
use App\Contracts\Repositories\GudangRepositoryInterface;
use App\Contracts\Repositories\InventarisRepositoryInterface;
use App\Contracts\Repositories\JabatanRepositoryInterface;
use App\Contracts\Repositories\KadivRepositoryInterface;
use App\Contracts\Repositories\KategoriRepositoryInterface;
use App\Contracts\Repositories\KendaraanRepositoryInterface;
use App\Contracts\Repositories\KondisiRepositoryInterface;
use App\Contracts\Repositories\ManagerRepositoryInterface;
use App\Contracts\Repositories\PenggunaRepositoryInterface;
use App\Contracts\Repositories\SatuanRepositoryInterface;
use App\Contracts\Repositories\SupplierRepositoryInterface;
use App\Contracts\Services\BarangKeluarServiceInterface;
use App\Contracts\Services\BarangMasukServiceInterface;
use App\Contracts\Services\BarangServiceInterface;
use App\Contracts\Services\DimensiServiceInterface;
use App\Contracts\Services\DireksiServiceInterface;
use App\Contracts\Services\DivisiServiceInterface;
use App\Contracts\Services\GudangServiceInterface;
use App\Contracts\Services\InventarisServiceInterface;
use App\Contracts\Services\JabatanServiceInterface;
use App\Contracts\Services\KadivServiceInterface;
use App\Contracts\Services\KategoriServiceInterface;
use App\Contracts\Services\KendaraanServiceInterface;
use App\Contracts\Services\KondisiServiceInterface;
use App\Contracts\Services\ManagerServiceInterface;
use App\Contracts\Services\PenggunaServiceInterface;
use App\Contracts\Services\SatuanServiceInterface;
use App\Contracts\Services\SupplierServiceInterface;
use App\Repositories\BarangKeluarRepository;
use App\Repositories\BarangMasukRepository;
use App\Repositories\BarangRepository;
use App\Repositories\DireksiRepository;
use App\Repositories\DimensiRepository;
use App\Repositories\DivisiRepository;
use App\Repositories\GudangRepository;
use App\Repositories\InventarisRepository;
use App\Repositories\JabatanRepository;
use App\Repositories\KadivRepository;
use App\Repositories\KategoriRepository;
use App\Repositories\KendaraanRepository;
use App\Repositories\KondisiRepository;
use App\Repositories\ManagerRepository;
use App\Repositories\PenggunaRepository;
use App\Repositories\SatuanRepository;
use App\Repositories\SupplierRepository;
use App\Services\BarangKeluarService;
use App\Services\BarangMasukService;
use App\Services\BarangService;
use App\Services\DimensiService;
use App\Services\DireksiService;
use App\Services\DivisiService;
use App\Services\GudangService;
use App\Services\InventarisService;
use App\Services\JabatanService;
use App\Services\KadivService;
use App\Services\KategoriService;
use App\Services\KendaraanService;
use App\Services\KondisiService;
use App\Services\ManagerService;
use App\Services\PenggunaService;
use App\Services\SatuanService;
use App\Services\SupplierService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // -------------------------------------------------------
        // Repository Bindings
        // -------------------------------------------------------

        $this->app->bind(BarangRepositoryInterface::class, BarangRepository::class);
        $this->app->bind(BarangMasukRepositoryInterface::class, BarangMasukRepository::class);
        $this->app->bind(BarangKeluarRepositoryInterface::class, BarangKeluarRepository::class);
        $this->app->bind(PenggunaRepositoryInterface::class, PenggunaRepository::class);
        $this->app->bind(DimensiRepositoryInterface::class, DimensiRepository::class);
        $this->app->bind(SatuanRepositoryInterface::class, SatuanRepository::class);
        $this->app->bind(KategoriRepositoryInterface::class, KategoriRepository::class);
        $this->app->bind(InventarisRepositoryInterface::class, InventarisRepository::class);
        $this->app->bind(KendaraanRepositoryInterface::class, KendaraanRepository::class);
        $this->app->bind(KondisiRepositoryInterface::class, KondisiRepository::class);
        $this->app->bind(JabatanRepositoryInterface::class, JabatanRepository::class);
        $this->app->bind(DivisiRepositoryInterface::class, DivisiRepository::class);
        $this->app->bind(DireksiRepositoryInterface::class, DireksiRepository::class);
        $this->app->bind(ManagerRepositoryInterface::class, ManagerRepository::class);
        $this->app->bind(KadivRepositoryInterface::class, KadivRepository::class);
        $this->app->bind(SupplierRepositoryInterface::class, SupplierRepository::class);
        $this->app->bind(GudangRepositoryInterface::class, GudangRepository::class);

        // -------------------------------------------------------
        // Service Bindings
        // -------------------------------------------------------

        $this->app->bind(BarangServiceInterface::class, BarangService::class);
        $this->app->bind(BarangMasukServiceInterface::class, BarangMasukService::class);
        $this->app->bind(BarangKeluarServiceInterface::class, BarangKeluarService::class);
        $this->app->bind(DimensiServiceInterface::class, DimensiService::class);
        $this->app->bind(InventarisServiceInterface::class, InventarisService::class);
        $this->app->bind(KendaraanServiceInterface::class, KendaraanService::class);
        $this->app->bind(KondisiServiceInterface::class, KondisiService::class);
        $this->app->bind(DireksiServiceInterface::class, DireksiService::class);
        $this->app->bind(DivisiServiceInterface::class, DivisiService::class);
        $this->app->bind(GudangServiceInterface::class, GudangService::class);
        $this->app->bind(JabatanServiceInterface::class, JabatanService::class);
        $this->app->bind(KadivServiceInterface::class, KadivService::class);
        $this->app->bind(KategoriServiceInterface::class, KategoriService::class);
        $this->app->bind(ManagerServiceInterface::class, ManagerService::class);
        $this->app->bind(PenggunaServiceInterface::class, PenggunaService::class);
        $this->app->bind(SatuanServiceInterface::class, SatuanService::class);
        $this->app->bind(SupplierServiceInterface::class, SupplierService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
