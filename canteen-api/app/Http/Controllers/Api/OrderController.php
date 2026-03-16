<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrderController
{
    /**
     * Get user's orders
     */
    public function index(Request $request)
    {
        try {
            $user = auth('api')->user() ?? auth()->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            $query = Order::where('user_id', $user->getKey());

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by type
            if ($request->has('type')) {
                $query->where('order_type', $request->type);
            }

            $orders = $query->orderBy('created_at', 'desc')->paginate(20);

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
     * Get single order
     */
    public function show($orderId)
    {
        try {
            $user = auth('api')->user();
            $order = Order::where('id', $orderId)
                         ->where('user_id', $user->getKey())
                         ->with('items.menuItem')
                         ->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $order->id,
                    'status' => $order->status,
                    'order_type' => $order->order_type,
                    'payment_method' => $order->payment_method,
                    'items' => $order->items->map(function($item) {
                        return [
                            'name' => $item->menu_item_name,
                            'quantity' => $item->quantity,
                            'price' => (float) $item->price,
                            'subtotal' => (float) $item->subtotal,
                        ];
                    }),
                    'total_amount' => (float) $order->total_amount,
                    'gst_amount' => (float) $order->gst_amount,
                    'final_amount' => (float) $order->final_amount,
                    'completed_at' => $order->completed_at,
                    'created_at' => $order->created_at,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Create new order from cart
     */
    public function create(Request $request)
    {
        try {
            $validated = $request->validate([
                'order_type' => 'required|in:takeaway,dine-in',
                'payment_method' => 'required|in:upi,card,cash',
                'notes' => 'nullable|string',
            ]);

            $user = auth('api')->user() ?? auth()->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            \Log::info('OrderController.create started', [
                'user_id' => $user->getKey(),
                'user_serialno' => $user->serialno ?? null,
                'order_type' => $validated['order_type']
            ]);
            
            // Get or create cart for user
            $cart = Cart::where('user_id', $user->getKey())->first();
            
            if (!$cart) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart not found. Please add items to cart first.'
                ], 400);
            }

            if ($cart->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart is empty'
                ], 400);
            }

            $validation = $cart->validate();
            if (!$validation['valid']) {
                return response()->json([
                    'success' => false,
                    'message' => $validation['message']
                ], 400);
            }

            // Calculate subtotal and gst from items
            $subtotal = $cart->items->sum(function($item) {
                return $item->price * $item->quantity;
            });
            $gstAmount = $subtotal * 0.09;
            $finalAmount = $subtotal + $gstAmount;

            \Log::info('OrderController.create - Creating order', [
                'user_id' => $user->getKey(),
                'subtotal' => $subtotal,
                'gst' => $gstAmount,
                'total' => $finalAmount,
                'item_count' => $cart->items()->count()
            ]);

            // Create order using the correct column names for bvrit_canteen database
            $order = Order::create([
                'user_id' => $user->getKey(),
                'order_type' => $validated['order_type'],
                'payment_method' => $validated['payment_method'],
                'total_amount' => $subtotal,
                'gst_amount' => $gstAmount,
                'final_amount' => $finalAmount,
                'notes' => $validated['notes'] ?? null,
                'status' => 'pending',
            ]);

            \Log::info('OrderController.create - Order created', [
                'order_id' => $order->id,
                'user_id' => $user->getKey()
            ]);

            // Copy cart items to order
            foreach ($cart->items as $cartItem) {
                \Log::info('OrderController.create - Creating order item', [
                    'order_id' => $order->id,
                    'menu_item_id' => $cartItem->menu_item_id,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->price
                ]);
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $cartItem->menu_item_id,
                    'menu_item_name' => $cartItem->menuItem->name,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->price,
                    'subtotal' => $cartItem->price * $cartItem->quantity,
                ]);

                // Update sold count
                $cartItem->menuItem->increment('quantity_sold_today', $cartItem->quantity);
            }

            // Clear cart
            $cart->clear();
            
            \Log::info('OrderController.create - Order completed', [
                'order_id' => $order->id,
                'user_id' => $user->getKey(),
                'status' => $order->status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => [
                    'order_id' => $order->id,
                    'total' => (float) $order->final_amount,
                    'subtotal' => (float) $order->total_amount,
                    'gst_amount' => (float) $order->gst_amount,
                    'status' => $order->status,
                ]
            ], 201);
        } catch (\Exception $e) {
            \Log::error('OrderController.create error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Process payment (mock)
     */
    public function processPayment(Request $request, $orderId)
    {
        try {
            $validated = $request->validate([
                'upi_id' => 'nullable|string',
                'card_number' => 'nullable|string',
                'expiry' => 'nullable|string',
                'cvv' => 'nullable|string',
            ]);

            $user = auth('api')->user();
            $order = Order::where('id', $orderId)
                         ->where('user_id', $user->getKey())
                         ->firstOrFail();

            // Mock payment processing
            $order->update([
                'status' => 'confirmed',
                'payment_id' => 'TXN' . time(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment processed successfully',
                'data' => [
                    'order_id' => $order->id,
                    'payment_id' => $order->payment_id,
                    'status' => $order->status,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment failed',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Cancel order
     */
    public function cancel($orderId)
    {
        try {
            $user = auth('api')->user();
            $order = Order::where('id', $orderId)
                         ->where('user_id', $user->getKey())
                         ->firstOrFail();

            if (!$order->canBeCancelled()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order cannot be cancelled at this stage'
                ], 400);
            }

            $order->markAsCancelled();

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel order',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Update order status (staff/admin only)
     */
    public function updateStatus(Request $request, $orderId)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:confirmed,preparing,ready,completed,cancelled',
            ]);

            $user = auth('api')->user();
            $order = Order::findOrFail($orderId);

            $newStatus = $validated['status'];
            $oldStatus = $order->status;

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

            // Update status based on transition
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
                'message' => "Order status updated to {$newStatus}",
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

    /**
     * Confirm order (shortcut for pending -> confirmed)
     */
    public function confirm($orderId)
    {
        try {
            $order = Order::findOrFail($orderId);

            if ($order->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending orders can be confirmed'
                ], 400);
            }

            $order->markAsConfirmed();

            return response()->json([
                'success' => true,
                'message' => 'Order confirmed',
                'data' => ['status' => $order->status]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm order',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Mark order as preparing
     */
    public function markPreparing($orderId)
    {
        try {
            $order = Order::findOrFail($orderId);

            if ($order->status !== 'confirmed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Order must be confirmed before marking as preparing'
                ], 400);
            }

            $order->markAsPreparing();

            return response()->json([
                'success' => true,
                'message' => 'Order marked as preparing',
                'data' => ['status' => $order->status]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark order as preparing',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Mark order as ready
     */
    public function markReady($orderId)
    {
        try {
            $order = Order::findOrFail($orderId);

            if ($order->status !== 'preparing') {
                return response()->json([
                    'success' => false,
                    'message' => 'Order must be in preparing state before marking as ready'
                ], 400);
            }

            $order->markAsReady();

            return response()->json([
                'success' => true,
                'message' => 'Order marked as ready',
                'data' => ['status' => $order->status]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark order as ready',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Mark order as completed
     */
    public function markCompleted($orderId)
    {
        try {
            $order = Order::findOrFail($orderId);

            if ($order->status !== 'ready') {
                return response()->json([
                    'success' => false,
                    'message' => 'Order must be ready before marking as completed'
                ], 400);
            }

            $order->markAsCompleted();

            return response()->json([
                'success' => true,
                'message' => 'Order completed',
                'data' => ['status' => $order->status, 'completed_at' => $order->completed_at]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark order as completed',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get order stats for admin
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
                'total_orders' => Order::count(),
                'today_orders' => Order::today()->count(),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'confirmed_orders' => Order::where('status', 'confirmed')->count(),
                'preparing_orders' => Order::where('status', 'preparing')->count(),
                'ready_orders' => Order::where('status', 'ready')->count(),
                'completed_orders' => Order::where('status', 'completed')->count(),
                'revenue_today' => Order::today()->where('status', 'completed')->sum('final_amount'),
                'total_revenue' => Order::where('status', 'completed')->sum('final_amount'),
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
