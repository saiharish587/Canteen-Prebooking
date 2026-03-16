<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'price',
        'cost',
        'image_url',
        'is_available',
        'is_vegetarian',
        'preparation_time_mins',
        'daily_limit',
        'sold_today',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'is_vegetarian' => 'boolean',
        'price' => 'decimal:2',
        'cost' => 'decimal:2',
    ];

    // Relationships
    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeVegetarian($query)
    {
        return $query->where('is_vegetarian', true);
    }

    public function scopeNonVegetarian($query)
    {
        return $query->where('is_vegetarian', false);
    }

    public function scopeSearch($query, $term)
    {
        return $query->where('name', 'LIKE', "%{$term}%")
                    ->orWhere('description', 'LIKE', "%{$term}%");
    }

    public function scopeInStock($query)
    {
        return $query->where(function($q) {
            $q->whereNull('daily_limit')
              ->orWhereRaw('sold_today < daily_limit');
        });
    }

    // Methods
    public function isDailyLimitReached()
    {
        if (!$this->daily_limit) return false;
        return $this->sold_today >= $this->daily_limit;
    }

    public function canOrder()
    {
        return $this->is_available && !$this->isDailyLimitReached();
    }

    public function getProfitAttribute()
    {
        return $this->price - ($this->cost ?? 0);
    }
}
