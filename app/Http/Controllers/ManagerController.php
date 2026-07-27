<?php

namespace App\Http\Controllers;

use App\Contracts\Services\ManagerServiceInterface;
use App\Http\Requests\Manager\StoreManagerRequest;
use App\Http\Requests\Manager\UpdateManagerRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ManagerController extends Controller
{
    public function __construct(
        private readonly ManagerServiceInterface $managerService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('manager/index');
    }

    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->managerService->paginate($request->only([
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

    public function store(StoreManagerRequest $request): JsonResponse
    {
        $this->managerService->store(array_merge(
            $request->validated(),
            ['is_active' => $request->boolean('is_active', true)],
        ));

        return response()->json(['message' => 'Manager berhasil ditambahkan.']);
    }

    public function update(UpdateManagerRequest $request, int $manager): JsonResponse
    {
        $this->managerService->update($manager, array_merge(
            $request->validated(),
            ['is_active' => $request->boolean('is_active', true)],
        ));

        return response()->json(['message' => 'Manager berhasil diperbarui.']);
    }

    public function destroy(int $manager): JsonResponse
    {
        $this->managerService->destroy($manager);

        return response()->json(['message' => 'Manager berhasil dihapus.']);
    }
}
