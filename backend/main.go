package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"github.com/joho/godotenv"
	"log"
	"net/http"
	"os"
	_ "os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWT secret key (use a strong key in production)
var jwtKey []byte

// AuthRequest Structs for JSON parsing
type AuthRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
}

type UpdateKeysRequest struct {
	StreamKeyYouTube  string `json:"streamkey_youtube"`
	StreamKeyTwitch   string `json:"streamkey_twitch"`
	StreamKeyFacebook string `json:"streamkey_facebook"`
	EnableYouTube     bool   `json:"enable_youtube"`
	EnableTwitch      bool   `json:"enable_twitch"`
	EnableFacebook    bool   `json:"enable_facebook"`
}

type ConfigResponse struct {
	StreamKeyYouTube  string `json:"streamkey_youtube"`
	StreamKeyTwitch   string `json:"streamkey_twitch"`
	StreamKeyFacebook string `json:"streamkey_facebook"`
	EnableYouTube     bool   `json:"enable_youtube"`
	EnableTwitch      bool   `json:"enable_twitch"`
	EnableFacebook    bool   `json:"enable_facebook"`
}

// Users map
var users = map[string]string{}

// Load the secret key from the .env file
func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	secretKey := os.Getenv("SECRET_KEY")
	if secretKey == "" {
		log.Fatal("SECRET_KEY is not set in the .env file")
	}

	jwtKey = []byte(secretKey)
}

// Load users from file
func loadUsers(fileName string) error {
	file, err := os.Open(fileName)
	if err != nil {
		return fmt.Errorf("could not open user file: %v", err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		parts := strings.Split(line, ",")
		if len(parts) != 2 {
			continue
		}
		users[parts[0]] = parts[1] // user,password
	}

	if err := scanner.Err(); err != nil {
		return fmt.Errorf("error reading user file: %v", err)
	}
	return nil
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
	var updateReq UpdateKeysRequest
	if err := json.NewDecoder(r.Body).Decode(&updateReq); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	// Generate NGINX configuration file
	filename := fmt.Sprintf("nginx/%s.conf", username)
	content := fmt.Sprintf(`application %s {
    live on;
    record off;
    %spush rtmp://a.rtmp.youtube.com/live2/%s;
    %spush rtmp://localhost:19350/rtmp/%s;
    %spush rtmp://ams03.contribute.live-video.net/app/%s;
}
`, username,
		conditionalPrefix(updateReq.EnableYouTube), updateReq.StreamKeyYouTube,
		conditionalPrefix(updateReq.EnableFacebook), updateReq.StreamKeyFacebook,
		conditionalPrefix(updateReq.EnableTwitch), updateReq.StreamKeyTwitch,
	)

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

func conditionalPrefix(enabled bool) string {
	if enabled {
		return ""
	}
	return "#"
}

func getConfHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Validate JWT-token
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

	// Read the NGINX conf file
	filename := fmt.Sprintf("nginx/%s.conf", username)
	file, err := os.Open(filename)
	if err != nil {
		http.Error(w, "Configuration file not found", http.StatusNotFound)
		return
	}
	defer file.Close()

	// Parse the file
	var conf ConfigResponse
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if strings.Contains(line, "push rtmp://a.rtmp.youtube.com/live2/") {
			conf.EnableYouTube = !isCommented(line)
			conf.StreamKeyYouTube = extractKey(line)
		} else if strings.Contains(line, "push rtmp://localhost:19350/rtmp/") {
			conf.EnableFacebook = !isCommented(line)
			conf.StreamKeyFacebook = extractKey(line)
		} else if strings.Contains(line, "push rtmp://ams03.contribute.live-video.net/app/") {
			conf.EnableTwitch = !isCommented(line)
			conf.StreamKeyTwitch = extractKey(line)
		}
	}

	if err := scanner.Err(); err != nil {
		http.Error(w, "Error reading configuration file", http.StatusInternalServerError)
		return
	}

	// Send conf as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(conf)
}

// Helper function to check if a line is commented
func isCommented(line string) bool {
	// Check if the line starts with a "#"
	return strings.HasPrefix(line, "#")
}

// Helper function to extract the streamkey from a line
func extractKey(line string) string {
	line = strings.TrimPrefix(line, "#")
	line = strings.TrimSpace(line)
	parts := strings.Split(line, "/")
	if len(parts) > 1 {
		key := strings.TrimSpace(parts[len(parts)-1])
		return strings.TrimSuffix(key, ";")
	}
	return ""
}

func main() {
	mux := http.NewServeMux()

	// Load users from file
	err := loadUsers("streamie_users")
	if err != nil {
		fmt.Printf("Error loading users: %v\n", err)
		os.Exit(1)
	}

	// Routes
	mux.HandleFunc("/auth", authHandler)
	mux.HandleFunc("/update", updateHandler)
	mux.HandleFunc("/getconf", getConfHandler)
	// Serve static files for React build
	staticDir := "static" // Directory where your React build is located
	fs := http.FileServer(http.Dir(staticDir))
	mux.Handle("/", fs)

	// Wrap the mux with the CORS middleware
	handler := corsMiddleware(mux)

	fmt.Println("Server running on port 8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		fmt.Println("Error starting server:", err)
	}
}
