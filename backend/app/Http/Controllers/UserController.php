<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class UserController extends Controller
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        if (!$request->user()?->hasPermissionTo('user.user.show', 'api')) {
            abort(Response::HTTP_FORBIDDEN, 'This action is unauthorized.');
        }

        $perPage = (int) $request->query('per_page', 10);
        $users = $this->userService->list($perPage);

        return UserResource::collection($users);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->create($request->validated());
        
        return response()->json(new UserResource($user), Response::HTTP_CREATED);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $updatedUser = $this->userService->update($user, $request->validated());
        
        return response()->json(new UserResource($updatedUser));
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if (!$request->user()?->hasPermissionTo('user.user.delete', 'api')) {
            abort(Response::HTTP_FORBIDDEN, 'This action is unauthorized.');
        }

        $this->userService->delete($user);
        
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
