<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;

class BaseController extends \Illuminate\Routing\Controller
{
    protected function success($data = [], $message = '', $code = 200)
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
        ], $code);
    }

    protected function error($message = '', $code = 400, $errors = [])
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $code);
    }
}
