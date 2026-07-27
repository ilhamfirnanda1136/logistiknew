<?php

namespace App\Http\Controllers;

use App\Contracts\Services\KadivServiceInterface;
use App\Http\Requests\Kadiv\StoreKadivRequest;
use App\Http\Requests\Kadiv\UpdateKadivRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KadivController extends Controller
{
    public function __construct(
        private readonly KadivServiceInterface $kadivService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('kadiv/index');
    }

    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->kadivService->paginate($request->only([
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

    public function store(StoreKadivRequest $request): JsonResponse
    {
        $this->kadivService->store(array_merge(
            $request->validated(),
            ['is_active' => $request->boolean('is_active', true)],
        ));

        return response()->json(['message' => 'Kadiv berhasil ditambahkan.']);
    }

    public function update(UpdateKadivRequest $request, int $kadiv): JsonResponse
    {
        $this->kadivService->update($kadiv, array_merge(
            $request->validated(),
            ['is_active' => $request->boolean('is_active', true)],
        ));

        return response()->json(['message' => 'Kadiv berhasil diperbarui.']);
    }

    public function destroy(int $kadiv): JsonResponse
    {
        $this->kadivService->destroy($kadiv);

        return response()->json(['message' => 'Kadiv berhasil dihapus.']);
    }
}
