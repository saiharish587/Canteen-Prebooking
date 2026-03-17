<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #ecf0f1; padding: 20px; border-radius: 0 0 5px 5px; }
        .order-info { background-color: white; padding: 15px; margin: 15px 0; border-radius: 3px; }
        .status-badge { display: inline-block; padding: 8px 15px; background-color: #3498db; color: white; border-radius: 3px; font-weight: bold; }
        .status-preparing { background-color: #f39c12; }
        .status-ready { background-color: #27ae60; }
        .status-confirmed { background-color: #3498db; }
        .status-completed { background-color: #16a085; }
        .status-cancelled { background-color: #e74c3c; }
        .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .items-table th { background-color: #34495e; color: white; }
        .footer { text-align: center; color: #7f8c8d; font-size: 12px; margin-top: 20px; }
        .message { padding: 15px; background-color: #fff; border-left: 4px solid #3498db; margin: 15px 0; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Status Update</h1>
        </div>
        
        <div class="content">
            <p>Hi {{ $order->user->username ?? 'Valued Customer' }},</p>
            
            <div class="message">
                <span class="status-badge status-{{ strtolower($status) }}">{{ strtoupper($status) }}</span>
                <p>{{ $message }}</p>
            </div>

            <div class="order-info">
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> #{{ $order->id }}</p>
                <p><strong>Order Type:</strong> {{ ucfirst($order->order_type) }}</p>
                <p><strong>Status:</strong> {{ ucfirst($order->status) }}</p>
                <p><strong>Order Time:</strong> {{ $order->created_at->format('d M Y, h:i A') }}</p>
            </div>

            <div class="order-info">
                <h3>Items Ordered</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($order->items as $item)
                        <tr>
                            <td>{{ $item->menu_item->name ?? 'Item' }}</td>
                            <td>{{ $item->quantity }}</td>
                            <td>₹{{ number_format($item->price, 2) }}</td>
                            <td>₹{{ number_format($item->quantity * $item->price, 2) }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <div class="order-info">
                <h3>Order Summary</h3>
                <p><strong>Subtotal:</strong> ₹{{ number_format($order->total_amount, 2) }}</p>
                <p><strong>GST (5%):</strong> ₹{{ number_format($order->gst_amount, 2) }}</p>
                <p style="font-size: 18px; font-weight: bold; border-top: 2px solid #34495e; padding-top: 10px; color: #e74c3c;">
                    <strong>Total Amount:</strong> ₹{{ number_format($order->final_amount, 2) }}
                </p>
            </div>

            <p style="margin-top: 20px; color: #555;">
                @if($status === 'ready')
                    Please collect your order from the counter. Thank you for ordering from BVRIT Canteen!
                @elseif($status === 'completed')
                    Thank you for your order! We hope you enjoyed your meal.
                @elseif($status === 'cancelled')
                    For any questions, please contact us.
                @else
                    We'll notify you when your order is ready.
                @endif
            </p>
        </div>

        <div class="footer">
            <p>&copy; 2024 BVRIT Canteen. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
