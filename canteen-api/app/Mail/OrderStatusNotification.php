<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderStatusNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $status;
    public $statusMessages = [
        'confirmed' => 'Your order has been confirmed and will be prepared soon.',
        'preparing' => 'Your order is being prepared. Please wait!',
        'ready' => 'Your order is ready! Please collect it from the counter.',
        'completed' => 'Thank you! Your order has been completed.',
        'cancelled' => 'Your order has been cancelled.',
    ];

    /**
     * Create a new message instance.
     */
    public function __construct(Order $order, $status)
    {
        $this->order = $order;
        $this->status = $status;
    }

    /**
     * Get the message envelope.
     */
    public function envelope()
    {
        $statusLabel = ucfirst($this->status);
        return [
            'subject' => "Order #{$this->order->id} Status: {$statusLabel}",
        ];
    }

    /**
     * Get the message content definition.
     */
    public function content()
    {
        return view('emails.order-status', [
            'order' => $this->order,
            'status' => $this->status,
            'message' => $this->statusMessages[$this->status] ?? 'Your order status has been updated.',
        ]);
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments()
    {
        return [];
    }
}
