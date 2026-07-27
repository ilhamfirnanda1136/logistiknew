<?php

namespace App\Http\Controllers;

use App\Contracts\Services\SupplierServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function __construct(
        private readonly SupplierServiceInterface $supplierService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('supplier/index');
    }

    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->supplierService->paginate($request->only([
            'search',
            'sort_by',
            'sort_dir',
            'per_page',
            'page',
        ]));

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama_supplier' => 'required|string|max:255',
            'no_telepon'    => 'nullable|string|max:255',
            'alamat'        => 'nullable|string',
            'keterangan'    => 'nullable|string',
        ]);

        $this->supplierService->store($validated);

        return response()->json(['message' => 'Supplier berhasil ditambahkan.']);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'nama_supplier' => 'required|string|max:255',
            'no_telepon'    => 'nullable|string|max:255',
            'alamat'        => 'nullable|string',
            'keterangan'    => 'nullable|string',
        ]);

        $this->supplierService->update($id, $validated);

        return response()->json(['message' => 'Supplier berhasil diperbarui.']);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->supplierService->destroy($id);

        return response()->json(['message' => 'Supplier berhasil dihapus.']);
    }
}
