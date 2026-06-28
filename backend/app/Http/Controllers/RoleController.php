<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Services\RoleService;
use Spatie\Permission\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class RoleController extends Controller
{
    protected RoleService $roleService;

    public function __construct(RoleService $roleService)
    {
        $this->roleService = $roleService;
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        if (!$user?->hasPermissionTo('user.permission.show', 'api')) {
            abort(Response::HTTP_FORBIDDEN, 'This action is unauthorized.');
        }

        return RoleResource::collection($this->roleService->list());
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = $this->roleService->create($request->validated());

        return response()->json(new RoleResource($role), Response::HTTP_CREATED);
    }

    public function show(Request $request, Role $role): RoleResource
    {
        if (!$request->user()?->hasPermissionTo('user.permission.show', 'api')) {
            abort(Response::HTTP_FORBIDDEN, 'This action is unauthorized.');
        }

        return new RoleResource($role->load(['permissions', 'users']));
    }

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $updatedRole = $this->roleService->update($role, $request->validated());

        return response()->json(new RoleResource($updatedRole));
    }

    public function destroy(Request $request, Role $role): JsonResponse
    {
        if (!$request->user()?->hasPermissionTo('user.permission.delete', 'api')) {
            abort(Response::HTTP_FORBIDDEN, 'This action is unauthorized.');
        }

        $this->roleService->delete($role);

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
