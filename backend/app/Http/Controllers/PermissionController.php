<?php

namespace App\Http\Controllers;

use App\Http\Resources\PermissionResource;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PermissionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        if (!$request->user()?->hasPermissionTo('user.permission.show', 'api')) {
            abort(Response::HTTP_FORBIDDEN, 'This action is unauthorized.');
        }

        return PermissionResource::collection(
            Permission::where('guard_name', 'api')->get()
        );
    }
}
