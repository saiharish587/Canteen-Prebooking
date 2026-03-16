<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckAdminRole
{
    public function handle(Request $request, Closure $next)
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - user not authenticated'
            ], 401);
        }

        // Log the user details for debugging
        \Log::info('Admin middleware check', [
            'user_id' => $user->serialno ?? null,
            'email' => $user->email ?? null,
            'user_type' => $user->user_type ?? null,
        ]);

        // Check if user is admin by user_type
        $isAdmin = ($user->user_type === 'admin');
        
        if (!$isAdmin) {
            \Log::warning('Access denied - user not admin', [
                'user_id' => $user->serialno ?? null,
                'email' => $user->email ?? null,
                'user_type' => $user->user_type ?? null
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - admin role required. Your role: ' . ($user->user_type ?? 'unknown')
            ], 403);
        }

        return $next($request);
    }
}
