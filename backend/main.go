package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	_ "os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWT secret key (use a strong key in production)
var jwtKey = []byte("secretkey")

// AuthRequest Structs for JSON parsing
type AuthRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
}

type UpdateRequest struct {
	StreamKey string `json:"streamkey"`
}

// Map to simulate users and passwords
var users = map[string]string{
	"user1": "password1",
	"user2": "password2",
}

// Middleware for CORS
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*") // Or specify the frontend URL, such as "http://localhost:5173"
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Handler for authentication
func authHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var authReq AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&authReq); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	// Check username and password
	expectedPassword, ok := users[authReq.Username]
	if !ok || expectedPassword != authReq.Password {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Create JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": authReq.Username,
		"exp":      time.Now().Add(1 * time.Hour).Unix(),
	})

	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		http.Error(w, "Error creating token", http.StatusInternalServerError)
		return
	}

	response := AuthResponse{Token: tokenString}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		return
	}
}

// Handler for update
func updateHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Validate JWT token
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Authorization header missing", http.StatusUnauthorized)
		return
	}

	tokenString := authHeader[len("Bearer "):]
	claims := &jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	if err != nil || !token.Valid {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	username := (*claims)["username"].(string)

	// Parse the streamkey from the request body
	var updateReq UpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&updateReq); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	// Update the configuration file
	filename := fmt.Sprintf("%s.conf", username)
	content := fmt.Sprintf("streamkey=%s", updateReq.StreamKey)
	if err := os.WriteFile(filename, []byte(content), 0644); err != nil {
		http.Error(w, "Error writing file", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	_, err = w.Write([]byte("Configuration updated successfully"))
	if err != nil {
		http.Error(w, "Error writing response", http.StatusInternalServerError)
	}
}

func main() {
	mux := http.NewServeMux()

	// Routes
	mux.HandleFunc("/auth", authHandler)
	mux.HandleFunc("/update", updateHandler)

	// Wrap the mux with the CORS middleware
	handler := corsMiddleware(mux)

	fmt.Println("Server running on port 8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		fmt.Println("Error starting server:", err)
	}
}
