<?php

namespace App\Http\Controllers\Api;

use App\Models\Cart;
use App\Models\MenuItem;
use Illuminate\Http\Request;

class CartController
{
    /**
     * Get user's cart
     */
    public function index()
    {
        try {
            $user = auth()->user();
            $cart = Cart::with('items.menuItem')->firstOrCreate(
                ['user_id' => $user->serialno ?? $user->id]
            );

            if (!$cart->isEmpty()) {
                $cart->recalculateTotal();
            }

            // Calculate subtotal and tax from items
            $subtotal = $cart->items->sum(function($item) {
                return $item->price * $item->quantity;
            });
            $taxAmount = $subtotal * 0.09;
            $total = $subtotal + $taxAmount;

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $cart->id,
                    'items' => $cart->items->map(function($item) {
                        return [
                            'id' => $item->id,
                            'menu_item_id' => $item->menu_item_id,
                            'name' => $item->menuItem->name,
                            'quantity' => $item->quantity,
                            'price' => (float) $item->price,
                            'subtotal' => (float) ($item->quantity * $item->price),
                        ];
                    }),
                    'subtotal' => (float) $subtotal,
                    'tax_amount' => (float) $taxAmount,
                    'total' => (float) $total,
                    'item_count' => $cart->getItemCount(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch cart',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Add item to cart
     */
    public function addItem(Request $request)
    {
        try {
            $validated = $request->validate([
                'item_id' => 'required|exists:menu_items,id',
                'quantity' => 'required|integer|min:1',
                'special_instructions' => 'nullable|string',
            ]);

            $user = auth()->user();
            
            \Log::info('CartController.addItem', [
                'user' => $user ? $user->serialno : 'null',
                'item_id' => $validated['item_id'],
                'quantity' => $validated['quantity']
            ]);
            
            if(!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            $cart = Cart::firstOrCreate(['user_id' => $user->serialno ?? $user->id]);

            $menuItem = MenuItem::findOrFail($validated['item_id']);

            if (!$menuItem->canOrder()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Item is not available for ordering'
                ], 400);
            }

            $cart->addItem(
                $validated['item_id'],
                $validated['quantity'],
                $validated['special_instructions'] ?? null
            );

            // Reload and calculate totals
            $cart = $cart->fresh();
            $subtotal = $cart->items->sum(function($item) {
                return $item->price * $item->quantity;
            });
            $taxAmount = $subtotal * 0.09;

            return response()->json([
                'success' => true,
                'message' => 'Item added to cart',
                'data' => [
                    'item_count' => $cart->getItemCount(),
                    'subtotal' => (float) $subtotal,
                    'tax_amount' => (float) $taxAmount,
                    'total' => (float) ($subtotal + $taxAmount),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add item',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Update cart item quantity
     */
    public function updateItem(Request $request, $itemId)
    {
        try {
            $validated = $request->validate([
                'quantity' => 'required|integer|min:0',
            ]);

            $user = auth()->user();
            $cart = Cart::where('user_id', $user->serialno ?? $user->id)->firstOrFail();

            $cart->updateItem($itemId, $validated['quantity']);

            // Reload and calculate totals
            $cart = $cart->fresh();
            $subtotal = $cart->items->sum(function($item) {
                return $item->price * $item->quantity;
            });
            $taxAmount = $subtotal * 0.09;

            return response()->json([
                'success' => true,
                'message' => 'Item updated',
                'data' => [
                    'item_count' => $cart->getItemCount(),
                    'subtotal' => (float) $subtotal,
                    'tax_amount' => (float) $taxAmount,
                    'total' => (float) ($subtotal + $taxAmount),
                ]
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
     * Remove item from cart
     */
    public function removeItem($itemId)
    {
        try {
            $user = auth()->user();
            $cart = Cart::where('user_id', $user->serialno ?? $user->id)->firstOrFail();

            $cart->removeItem($itemId);

            // Reload and calculate totals
            $cart = $cart->fresh();
            $subtotal = $cart->items->sum(function($item) {
                return $item->price * $item->quantity;
            });
            $taxAmount = $subtotal * 0.09;

            return response()->json([
                'success' => true,
                'message' => 'Item removed from cart',
                'data' => [
                    'item_count' => $cart->getItemCount(),
                    'subtotal' => (float) $subtotal,
                    'tax_amount' => (float) $taxAmount,
                    'total' => (float) ($subtotal + $taxAmount),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove item',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Clear entire cart
     */
    public function clear()
    {
        try {
            $user = auth()->user();
            $cart = Cart::where('user_id', $user->serialno ?? $user->id)->firstOrFail();
            $cart->clear();

            return response()->json([
                'success' => true,
                'message' => 'Cart cleared'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cart',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Validate cart items
     */
    public function validate()
    {
        try {
            $user = auth()->user();
            $cart = Cart::where('user_id', $user->serialno ?? $user->id)->firstOrFail();

            $validation = $cart->validate();

            return response()->json([
                'success' => $validation['valid'],
                'message' => $validation['message'] ?? 'Cart is valid',
                'data' => [
                    'valid' => $validation['valid'],
                ]
            ], $validation['valid'] ? 200 : 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'error' => $e->getMessage()
            ], 400);
        }
    }
}
