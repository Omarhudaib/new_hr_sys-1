<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReplyEmail extends Mailable
{
    public $replyMessage;
    public $unreadMessageCount;

    public function __construct($replyMessage, $unreadMessageCount)
    {
        $this->replyMessage = $replyMessage;
        $this->unreadMessageCount = $unreadMessageCount;
    }

    public function build()
    {
        return $this->view('emails.reply')
                    ->with([
                        'replyMessage' => $this->replyMessage,
                        'unreadMessageCount' => $this->unreadMessageCount,
                    ]);
    }
}
