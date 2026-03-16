<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Mail\RegistrationNotification;
use App\Mail\LoginNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        try {
            \Log::info('Register request received', [
                'payload' => $request->all(),
                'headers' => $request->headers->all()
            ]);
            
            $validated = $request->validate([
                'email' => 'required|unique:users|email',
                'username' => 'required|string|min:3|max:20|unique:users',
                'password' => 'required|string|min:8|max:50',
            ]);

            \Log::info('Validation passed', ['validated' => $validated]);

            // Determine user type from email
            $userType = $this->classifyUserType($validated['email']);

            $user = User::create([
                'email' => $validated['email'],
                'username' => $validated['username'],
                'password' => Hash::make($validated['password']),
                'user_type' => $userType,
            ]);

            \Log::info('User created successfully', ['username' => $user->username, 'serialno' => $user->serialno]);

            // Send registration notification email
            try {
                Mail::to($user->email)->send(new RegistrationNotification(
                    $user->username,
                    $user->email,
                    $user->user_type
                ));
                \Log::info('Registration email sent', ['email' => $user->email]);
            } catch (\Exception $mailError) {
                \Log::error('Failed to send registration email', ['error' => $mailError->getMessage()]);
            }

            // Create a simple session token
            $tokenData = base64_encode(json_encode([
                'user_id' => $user->serialno,
                'email' => $user->email,
                'created' => time()
            ]));
            $hash = hash('sha256', $tokenData . config('app.key'));
            $token = 'session_' . $hash . '.' . $tokenData;

            return response()->json([
                'success' => true,
                'message' => 'User registered successfully',
                'data' => [
                    'serialno' => $user->serialno,
                    'username' => $user->username,
                    'email' => $user->email,
                    'user_type' => $user->user_type,
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                    'expires_in' => 3600,
                ]
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation Error', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Registration failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage(),
                'user_created' => true  // User might still be created even if JWT fails
            ], 500);
        }
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        try {
            $credentials = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            $user = User::where('email', $credentials['email'])->first();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid email or password'
                ], 401);
            }

            if (!Hash::check($credentials['password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid email or password'
                ], 401);
            }

            // Generate a session token with user ID encoded
            $tokenData = base64_encode(json_encode([
                'user_id' => $user->serialno,
                'email' => $user->email,
                'created' => time()
            ]));
            $hash = hash('sha256', $tokenData . config('app.key'));
            $token = 'session_' . $hash . '.' . $tokenData;

            // Send login notification email
            try {
                Mail::to($user->email)->send(new LoginNotification(
                    $user->username,
                    $user->email
                ));
                \Log::info('Login email sent', ['email' => $user->email]);
            } catch (\Exception $mailError) {
                \Log::error('Failed to send login email', ['error' => $mailError->getMessage()]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'serialno' => $user->serialno ?? null,
                    'username' => $user->username,
                    'email' => $user->email,
                    'user_type' => $user->user_type,
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                    'expires_in' => 3600,
                    'user_id' => $user->serialno,
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed: ' . $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get email by username
     */
    public function getEmailByUsername(Request $request)
    {
        try {
            $request->validate([
                'username' => 'required|string'
            ]);

            $user = User::where('username', $request->username)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Username not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'email' => $user->email
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting user email',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Logout user
     */
    public function logout()
    {
        auth('api')->logout();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get current user
     */
    public function me()
    {
        $user = auth('api')->user();

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Refresh token
     */
    public function refresh()
    {
        try {
            $token = JWTAuth::refresh(JWTAuth::getToken());

            return response()->json([
                'success' => true,
                'message' => 'Token refreshed',
                'data' => [
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                    'expires_in' => auth('api')->factory()->getTTL() * 60,
                ]
            ]);
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Could not refresh token',
                'error' => $e->getMessage()
            ], 401);
        }
    }

    /**
     * Classify user type based on email
     */
    private function classifyUserType($email)
    {
        $local = explode('@', $email)[0];
        $first = $local[0];

        if (ctype_digit($first)) {
            return 'student';
        }
        return 'faculty';
    }
}
