<?php

namespace App\Http\Controllers;

use App\Models\ContactMe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactMeController extends Controller
{
    // ✅ إرسال رسالة عبر الـ API
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:15',
            'message' => 'required|string',
        ]);

        $contact = ContactMe::create($data);

        return response()->json([
            'message' => 'Message sent successfully!',
            'data' => $contact
        ], 201);
    }

    // ✅ جلب جميع الرسائل
    public function index()
    {
        $messages = ContactMe::all();
        return response()->json($messages);
    }

    // ✅ جلب رسالة معينة حسب ID
    public function show($id)
    {
        $message = ContactMe::find($id);

        if (!$message) {
            return response()->json(['error' => 'Message not found'], 404);
        }

        return response()->json($message);
    }

    // ✅ إرسال رد عبر البريد الإلكتروني وتحديث `is_replied`
    public function reply(Request $request, $id)
    {
        $message = ContactMe::findOrFail($id);

        $data = $request->validate([
            'reply' => 'required|string',
        ]);

        // إرسال البريد الإلكتروني
        Mail::raw($data['reply'], function ($mail) use ($message) {
            $mail->to($message->email)
                ->subject('Reply to your inquiry')
                ->from('admin@example.com');
        });

        // تحديث حالة الرد
        $message->update(['is_replied' => true]);

        return response()->json(['message' => 'Reply sent successfully!']);
    }

    // ✅ حذف رسالة معينة
    public function destroy($id)
    {
        $message = ContactMe::find($id);

        if (!$message) {
            return response()->json(['error' => 'Message not found'], 404);
        }

        $message->delete();
        return response()->json(['message' => 'Message deleted successfully']);
    }
}
