<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LoginNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $username;
    public $email;
    public $loginTime;

    public function __construct($username, $email)
    {
        $this->username = $username;
        $this->email = $email;
        $this->loginTime = now()->format('d-m-Y H:i:s');
    }

    public function envelope()
    {
        return [
            'subject' => '🔐 BVRIT Canteen - Login Notification',
        ];
    }

    public function content()
    {
        return view('emails.login-notification', [
            'username' => $this->username,
            'email' => $this->email,
            'loginTime' => $this->loginTime,
        ]);
    }

    public function attachments()
    {
        return [];
    }
}
