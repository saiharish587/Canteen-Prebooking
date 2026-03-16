<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;

class ValidateSessionToken
{
    public function handle(Request $request, Closure $next)
    {
        $token = null;

        // Method 1: Use Laravel's bearerToken() if available
        $token = $request->bearerToken();
        
        // Method 2: Use apache_request_headers() if available (most reliable for Apache)
        if (!$token && function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            if (isset($headers['Authorization'])) {
                $authHeader = $headers['Authorization'];
                if (stripos($authHeader, 'Bearer ') === 0) {
                    $token = trim(substr($authHeader, 7));
                }
            }
        }

        // Method 3: Check $_SERVER['HTTP_AUTHORIZATION'] (set by .htaccess)
        if (!$token && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $header = $_SERVER['HTTP_AUTHORIZATION'];
            if (stripos($header, 'Bearer ') === 0) {
                $token = trim(substr($header, 7));
            }
        }
        
        // Method 4: Check REDIRECT_HTTP_AUTHORIZATION (some Apache setups)
        if (!$token && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
            if (stripos($header, 'Bearer ') === 0) {
                $token = trim(substr($header, 7));
            }
        }
        
        // Method 5: Check X-Auth-Token custom header (fallback)
        if (!$token) {
            $token = $request->header('X-Auth-Token');
        }
        
        // Method 6: Check URL parameter (last resort)
        if (!$token) {
            $token = $request->query('x-auth-token');
        }

        if (!$token) {
            // Log detailed info for debugging
            $debugInfo = [
                'Method 1 - bearerToken()' => $request->bearerToken(),
                'Method 2 - apache_request_headers()' => function_exists('apache_request_headers') ? (apache_request_headers()['Authorization'] ?? 'not set') : 'function not available',
                'Method 3 - $_SERVER[HTTP_AUTHORIZATION]' => $_SERVER['HTTP_AUTHORIZATION'] ?? 'not set',
                'Method 4 - $_SERVER[REDIRECT_HTTP_AUTHORIZATION]' => $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? 'not set',
                'Method 5 - X-Auth-Token' => $request->header('X-Auth-Token'),
                'All HTTP_ keys in $_SERVER' => array_filter(array_keys($_SERVER), fn($k) => strpos($k, 'HTTP_') === 0)
            ];
            
            \Log::error('ValidateSessionToken: No authorization token found', $debugInfo);
            
            return response()->json([
                'success' => false,
                'message' => 'Missing authorization token'
            ], 401);
        }

        // Check if it's a session token
        if (strpos($token, 'session_') === 0) {
            // Decode user data from token
            if (strpos($token, '.') === false) {
                \Log::error('Token validation: Invalid token format', ['token' => substr($token, 0, 20)]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token format'
                ], 401);
            }

            list($hash, $encodedData) = explode('.', $token, 2);
            
            try {
                $decodedData = base64_decode($encodedData);
                if ($decodedData === false) {
                    \Log::error('Token validation: base64_decode failed');
                    throw new \Exception('Invalid base64 encoding');
                }
                
                $tokenData = json_decode($decodedData, true);
                
                if (!$tokenData || !isset($tokenData['user_id'])) {
                    \Log::error('Token validation: Missing user_id', ['tokenData' => $tokenData]);
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid token data'
                    ], 401);
                }

                // Find the user by serialno (primary key)
                $user = User::where('serialno', $tokenData['user_id'])->first();
                if (!$user) {
                    \Log::error('Token validation: User not found', ['user_id' => $tokenData['user_id']]);
                    return response()->json([
                        'success' => false,
                        'message' => 'User not found'
                    ], 401);
                }

                // Set the user as authenticated for the api guard
                auth('api')->setUser($user);
                auth()->setUser($user);
                $request->setUserResolver(function () use ($user) {
                    return $user;
                });
                
                \Log::info('Auth: User authenticated via session token', ['user_id' => $user->serialno]);
                
                return $next($request);
                
            } catch (\Exception $e) {
                \Log::error('Token validation exception', [
                    'error' => $e->getMessage(),
                    'exception' => get_class($e),
                    'trace' => $e->getTraceAsString()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Token validation error: ' . $e->getMessage()
                ], 401);
            }
        } else {
            // Try JWT authentication (fallback)
            try {
                $user = \Tymon\JWTAuth\Facades\JWTAuth::parseToken()->authenticate();
                auth()->setUser($user);
                return $next($request);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token: ' . $e->getMessage()
                ], 401);
            }
        }
    }
}
