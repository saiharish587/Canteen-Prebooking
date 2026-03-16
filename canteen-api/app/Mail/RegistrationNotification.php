<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RegistrationNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $username;
    public $email;
    public $userType;

    public function __construct($username, $email, $userType)
    {
        $this->username = $username;
        $this->email = $email;
        $this->userType = $userType;
    }

    public function envelope()
    {
        return [
            'subject' => '🎉 Welcome to BVRIT Canteen!',
        ];
    }

    public function content()
    {
        return view('emails.registration-notification', [
            'username' => $this->username,
            'email' => $this->email,
            'userType' => $this->userType,
        ]);
    }

    public function attachments()
    {
        return [];
    }
}
