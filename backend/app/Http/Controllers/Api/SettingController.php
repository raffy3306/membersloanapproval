<?php

namespace App\Http\Controllers\Api;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends BaseController
{
    public function index()
    {
        $settings = Setting::all();

        return $this->success([
            'approverSignature' => Setting::get('approverSignature'),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'approverSignature' => 'nullable|string',
        ]);

        if (isset($validated['approverSignature'])) {
            Setting::set('approverSignature', $validated['approverSignature']);
        }

        return $this->success($validated, 'Settings updated successfully');
    }
}
