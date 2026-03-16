<?php

namespace App\Http\Controllers\Api;

use App\Models\MenuItem;
use App\Models\Order;
use Illuminate\Http\Request;

class AdminController
{
    /**
     * Get all menu items (admin)
     */
    public function getMenuItems(Request $request)
    {
        try {
            if (!auth('api')->check() || !auth('api')->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $query = MenuItem::query();

            if ($request->has('category')) {
                $query->where('category', $request->category);
            }

            $items = $query->orderBy('category')->paginate(50);

            return response()->json([
                'success' => true,
                'data' => $items->items(),
                'pagination' => [
                    'total' => $items->total(),
                    'count' => $items->count(),
                    'per_page' => $items->perPage(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch items',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Create menu item (admin)
     */
    public function createMenuItem(Request $request)
    {
        try {
            if (!auth('api')->check() || !auth('api')->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $validated = $request->validate([
                'name' => 'required|string|unique:menu_items',
                'category' => 'required|in:breakfast,meals,veg,nonveg,snacks,beverages,special',
                'price' => 'required|numeric|min:0',
                'description' => 'nullable|string',
                'image_url' => 'nullable|string',
                'is_vegetarian' => 'nullable|boolean',
                'preparation_time_mins' => 'nullable|integer|min:1',
                'daily_limit' => 'nullable|integer|min:1',
            ]);

            $item = MenuItem::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Menu item created',
                'data' => $item
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create item',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Update menu item (admin)
     */
    public function updateMenuItem(Request $request, $itemId)
    {
        try {
            if (!auth('api')->check() || !auth('api')->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $item = MenuItem::findOrFail($itemId);

            $validated = $request->validate([
                'name' => 'sometimes|string|unique:menu_items,name,' . $itemId,
                'category' => 'sometimes|in:breakfast,meals,veg,nonveg,snacks,beverages,special',
                'price' => 'sometimes|numeric|min:0',
                'description' => 'nullable|string',
                'image_url' => 'nullable|string',
                'is_available' => 'sometimes|boolean',
                'is_vegetarian' => 'sometimes|boolean',
                'preparation_time_mins' => 'sometimes|integer|min:1',
                'daily_limit' => 'nullable|integer|min:1',
            ]);

            $item->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Menu item updated',
                'data' => $item
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update item',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Delete menu item (admin)
     */
    public function deleteMenuItem($itemId)
    {
        try {
            if (!auth('api')->check() || !auth('api')->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $item = MenuItem::findOrFail($itemId);
            $item->delete();

            return response()->json([
                'success' => true,
                'message' => 'Menu item deleted'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete item',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Toggle item availability (admin)
     */
    public function toggleAvailability($itemId)
    {
        try {
            if (!auth('api')->check() || !auth('api')->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $item = MenuItem::findOrFail($itemId);
            $item->update(['is_available' => !$item->is_available]);

            return response()->json([
                'success' => true,
                'message' => 'Availability updated',
                'data' => ['is_available' => $item->is_available]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update availability',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Update price (admin)
     */
    public function updatePrice(Request $request, $itemId)
    {
        try {
            if (!auth('api')->check() || !auth('api')->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $validated = $request->validate([
                'price' => 'required|numeric|min:0',
            ]);

            $item = MenuItem::findOrFail($itemId);
            $item->update(['price' => $validated['price']]);

            return response()->json([
                'success' => true,
                'message' => 'Price updated',
                'data' => ['price' => (float) $item->price]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update price',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Reset daily counts (admin)
     */
    public function resetDailyCounts()
    {
        try {
            if (!auth('api')->check() || !auth('api')->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            MenuItem::query()->update(['sold_today' => 0]);

            return response()->json([
                'success' => true,
                'message' => 'Daily counts reset'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset counts',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get all orders (admin kitchen display)
     */
    public function getAllOrders(Request $request)
    {
        try {
            if (!auth('api')->check() || !auth('api')->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $query = Order::query();

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by type
            if ($request->has('type')) {
                $query->where('order_type', $request->type);
            }

            // Filter by date
            if ($request->has('date')) {
                $query->whereDate('created_at', $request->date);
            } else {
                // Default to today's orders
                $query->whereDate('created_at', today());
            }

            $orders = $query->with('items', 'user')
                           ->orderBy('created_at', 'desc')
                           ->paginate(50);

            return response()->json([
                'success' => true,
                'data' => $orders->items(),
                'pagination' => [
                    'total' => $orders->total(),
                    'count' => $orders->count(),
                    'per_page' => $orders->perPage(),
                    'current_page' => $orders->currentPage(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch orders',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get pending orders (kitchen display)
     */
    public function getPendingOrders()
    {
        try {
            if (!auth('api')->check() || !auth('api')->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Include all active orders: pending, confirmed, preparing, ready
            // (completed and cancelled are archived)
            $orders = Order::whereIn('status', ['pending', 'confirmed', 'preparing', 'ready'])
                          ->with('items.menuItem', 'user')
                          ->orderBy('created_at', 'asc')
                          ->get();

            return response()->json([
                'success' => true,
                'data' => $orders->map(function($order) {
                    return [
                        'id' => $order->id,
                        'status' => $order->status,
                        'order_type' => $order->order_type,
                        'user' => [
                            'username' => $order->user ? $order->user->username : 'Unknown',
                            'email' => $order->user ? $order->user->email : 'N/A',
                        ],
                        'items' => $order->items->map(function($item) {
                            return [
                                'name' => $item->menu_item_name,
                                'quantity' => $item->quantity,
                            ];
                        }),
                        'total' => (float) $order->final_amount,
                        'created_at' => $order->created_at,
                    ];
                }),
                'count' => $orders->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch pending orders',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Update order status (admin)
     */
    public function updateOrderStatus(Request $request, $orderId)
    {
        try {
            if (!auth('api')->check() || !auth('api')->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $validated = $request->validate([
                'status' => 'required|in:confirmed,preparing,ready,completed,cancelled',
            ]);

            $order = Order::findOrFail($orderId);
            $oldStatus = $order->status;
            $newStatus = $validated['status'];

            // Validate status transitions
            $validTransitions = [
                'pending' => ['confirmed', 'cancelled'],
                'confirmed' => ['preparing', 'cancelled'],
                'preparing' => ['ready'],
                'ready' => ['completed'],
                'completed' => [],
                'cancelled' => [],
            ];

            if (!isset($validTransitions[$oldStatus]) || !in_array($newStatus, $validTransitions[$oldStatus])) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot transition from {$oldStatus} to {$newStatus}"
                ], 400);
            }

            // Update status
            switch ($newStatus) {
                case 'confirmed':
                    $order->markAsConfirmed();
                    break;
                case 'preparing':
                    $order->markAsPreparing();
                    break;
                case 'ready':
                    $order->markAsReady();
                    break;
                case 'completed':
                    $order->markAsCompleted();
                    break;
                case 'cancelled':
                    $order->markAsCancelled();
                    break;
            }

            return response()->json([
                'success' => true,
                'message' => "Order #{$order->id} status updated to {$newStatus}",
                'data' => [
                    'order_id' => $order->id,
                    'old_status' => $oldStatus,
                    'new_status' => $order->status,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status',
                'error' => $e->getMessage()
            ], 400);
        }
    }
}
