<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $table = 'carts';

    protected $fillable = [
        'user_id',
        'total',
        'item_count',
    ];

    protected $casts = [
        'total' => 'decimal:2',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'serialno');
    }

    public function items()
    {
        return $this->hasMany(CartItem::class);
    }

    // Methods
    public function addItem($menuItemId, $quantity, $specialInstructions = null)
    {
        $menuItem = MenuItem::findOrFail($menuItemId);
        
        \Log::info('Cart.addItem', [
            'cart_id' => $this->id,
            'menu_item_id' => $menuItemId,
            'quantity' => $quantity,
            'item_exists' => $this->items()->where('menu_item_id', $menuItemId)->exists()
        ]);
        
        $item = $this->items()->where('menu_item_id', $menuItemId)->first();

        if ($item) {
            // Item exists - replace quantity, don't add
            $item->quantity = $quantity;  // Use assignment instead of increment
            $item->save();
            
            \Log::info('Cart.addItem - Updated existing', [
                'menu_item_id' => $menuItemId,
                'new_quantity' => $item->quantity
            ]);
        } else {
            // New item - create it
            \DB::table('cart_items')->insert([
                'cart_id' => $this->id,
                'menu_item_id' => $menuItemId,
                'quantity' => $quantity,
                'price' => $menuItem->price,
                'subtotal' => $menuItem->price * $quantity,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            \Log::info('Cart.addItem - Created new', [
                'menu_item_id' => $menuItemId,
                'quantity' => $quantity
            ]);
        }

        $this->recalculateTotal();
        return $this;
    }

    public function updateItem($menuItemId, $quantity)
    {
        if ($quantity <= 0) {
            $this->removeItem($menuItemId);
        } else {
            $menuItem = MenuItem::findOrFail($menuItemId);
            $newSubtotal = $menuItem->price * $quantity;
            
            $this->items()->where('menu_item_id', $menuItemId)
                        ->update([
                            'quantity' => $quantity,
                            'subtotal' => $newSubtotal
                        ]);
        }
        $this->recalculateTotal();
        return $this;
    }

    public function removeItem($menuItemId)
    {
        $this->items()->where('menu_item_id', $menuItemId)->delete();
        $this->recalculateTotal();
        return $this;
    }

    public function clear()
    {
        $this->items()->delete();
        $this->total = 0;
        $this->item_count = 0;
        $this->save();
        return $this;
    }

    public function recalculateTotal()
    {
        $subtotal = 0;
        foreach ($this->items as $item) {
            $subtotal += $item->price * $item->quantity;
        }

        $taxAmount = $subtotal * 0.09; // 9% GST
        $this->total = $subtotal + $taxAmount;
        $this->item_count = $this->items()->sum('quantity');
        $this->save();

        return $this;
    }

    public function getItemCount()
    {
        return $this->items()->sum('quantity');
    }

    public function isEmpty()
    {
        return $this->items()->count() === 0;
    }

    public function isExpired()
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function validate()
    {
        foreach ($this->items as $item) {
            if (!$item->menuItem->canOrder()) {
                return ['valid' => false, 'message' => "{$item->menuItem->name} is not available"];
            }
        }
        return ['valid' => true];
    }
}

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'menu_item_id',
        'quantity',
        'price_at_time',
        'special_instructions',
    ];

    protected $casts = [
        'price_at_time' => 'decimal:2',
    ];

    // Relationships
    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }
}
