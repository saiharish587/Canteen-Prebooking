<?php

namespace App\Http\Controllers\Api;

use App\Models\MenuItem;
use Illuminate\Http\Request;

class MenuController
{
    /**
     * Get all menu items with filters
     */
    public function index(Request $request)
    {
        try {
            $query = MenuItem::query();

            // Filter by category
            if ($request->has('category') && $request->category !== 'all') {
                $query->where('category', $request->category);
            }

            // Filter by availability
            if ($request->has('available') && $request->available === 'true') {
                $query->available();
            }

            // Search
            if ($request->has('search')) {
                $query->search($request->search);
            }

            // Filter vegetarian
            if ($request->has('vegetarian') && $request->vegetarian === 'true') {
                $query->vegetarian();
            }

            // Get all items without pagination for simplicity
            $items = $query->get();

            return response()->json([
                'success' => true,
                'items' => $items
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch menu items',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get single menu item
     */
    public function show($id)
    {
        try {
            $item = MenuItem::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $item
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Menu item not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Search menu items
     */
    public function search(Request $request)
    {
        try {
            $query = $request->get('q', '');
            $limit = $request->get('limit', 10);

            $items = MenuItem::search($query)
                            ->available()
                            ->limit($limit)
                            ->get();

            return response()->json([
                'success' => true,
                'data' => $items
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Search failed',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get menu categories
     */
    public function categories()
    {
        $categories = [
            'breakfast' => '🌅 Breakfast',
            'meals' => '🍛 Meals',
            'veg' => '🥬 Veg',
            'nonveg' => '🍗 Non-Veg',
            'snacks' => '🍟 Snacks',
            'beverages' => '☕ Beverages',
            'special' => '⭐ Special',
        ];

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Get stats for admin dashboard
     */
    public function stats()
    {
        try {
            if (!auth('api')->check() || !auth('api')->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $stats = [
                'total_items' => MenuItem::count(),
                'available_items' => MenuItem::available()->count(),
                'unavailable_items' => MenuItem::where('is_available', false)->count(),
                'total_value' => MenuItem::sum('price'),
                'by_category' => MenuItem::selectRaw('category, count(*) as count')
                                        ->groupBy('category')
                                        ->pluck('count', 'category'),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch stats',
                'error' => $e->getMessage()
            ], 400);
        }
    }
}
