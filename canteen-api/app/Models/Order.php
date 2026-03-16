<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderStatusNotification;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_type',
        'status',
        'payment_method',
        'payment_id',
        'total_amount',
        'gst_amount',
        'final_amount',
        'completed_at',
        'notes',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'total_amount' => 'decimal:2',
        'gst_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'serialno');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Scopes
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeType($query, $type)
    {
        return $query->where('order_type', $type);
    }

    public function scopeUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    // Email notification helper
    private function sendStatusNotification($status)
    {
        try {
            if ($this->user && $this->user->email) {
                Mail::to($this->user->email)->send(new OrderStatusNotification($this, $status));
                \Log::info("Email sent to {$this->user->email} for order {$this->id} status: {$status}");
            }
        } catch (\Exception $e) {
            \Log::error("Failed to send email for order {$this->id}: {$e->getMessage()}");
        }
    }

    // Methods
    public function markAsConfirmed()
    {
        $this->status = 'confirmed';
        $this->save();
        $this->sendStatusNotification('confirmed');
    }

    public function markAsPreparing()
    {
        $this->status = 'preparing';
        $this->save();
        $this->sendStatusNotification('preparing');
    }

    public function markAsReady()
    {
        $this->status = 'ready';
        $this->save();
        $this->sendStatusNotification('ready');
    }

    public function markAsCompleted()
    {
        $this->status = 'completed';
        $this->completed_at = now();
        $this->save();
        $this->sendStatusNotification('completed');
    }

    public function markAsCancelled()
    {
        $this->status = 'cancelled';
        $this->save();
        $this->sendStatusNotification('cancelled');
    }

    public function isPaid()
    {
        return $this->payment_status === 'completed';
    }

    public function canBeCancelled()
    {
        return in_array($this->status, ['pending', 'confirmed']);
    }

    public function getItemCount()
    {
        return $this->items()->sum('quantity');
    }
}
