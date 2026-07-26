package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"backend/internal/handler"
	"backend/internal/middleware"
	"backend/internal/model"
	"backend/internal/repository"
	"backend/internal/service"
	"backend/pkg/hasher"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("Initializing E-Commerce Backend Service...")

	// 1. Initialize Repository & DB
	repo, err := repository.NewRepository()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// 2. Seed Initial Data
	seedInitialData(repo)

	// 3. Initialize Service & Handler
	svc := service.NewService(repo)
	h := handler.NewHandler(svc)

	// 4. Initialize Gin Router
	r := gin.Default()

	// CORS Configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Health Check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "timestamp": time.Now()})
	})

	// API v1 Group
	v1 := r.Group("/api/v1")
	{
		// Auth Public Routes
		v1.POST("/auth/register", h.Register)
		v1.POST("/auth/login", h.Login)

		// Catalog Public Routes
		v1.GET("/categories", h.GetCategories)
		v1.GET("/products", h.GetProducts)
		v1.GET("/products/:id", h.GetProductByID)

		// Authenticated Routes
		auth := v1.Group("")
		auth.Use(middleware.JWTMiddleware())
		{
			auth.GET("/auth/me", h.GetMe)

			// Cart Routes
			auth.GET("/cart", h.GetCart)
			auth.POST("/cart/items", h.AddToCart)
			auth.PUT("/cart/items/:itemId", h.UpdateCartItem)
			auth.DELETE("/cart/items/:itemId", h.RemoveCartItem)

			// Order Routes
			auth.POST("/orders/checkout", h.Checkout)
			auth.GET("/orders", h.GetUserOrders)
		}

		// Admin Routes
		admin := v1.Group("/admin")
		admin.Use(middleware.JWTMiddleware(), middleware.RequireAdmin())
		{
			admin.POST("/categories", h.CreateCategory)
			admin.POST("/products", h.CreateProduct)
			admin.PUT("/products/:id", h.UpdateProduct)
			admin.DELETE("/products/:id", h.DeleteProduct)
			admin.GET("/orders", h.GetAllOrders)
			admin.PUT("/orders/:id/status", h.UpdateOrderStatus)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("E-Commerce Backend Server running on http://localhost:%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server failed to run: %v", err)
	}
}

func seedInitialData(repo *repository.Repository) {
	log.Println("Checking database seed data...")

	// 1. Seed Admin User
	adminEmail := "admin@ecommerce.com"
	_, err := repo.GetUserByEmail(adminEmail)
	if err != nil {
		hash, _ := hasher.HashPassword("admin123")
		admin := &model.User{
			Name:         "System Admin",
			Email:        adminEmail,
			PasswordHash: hash,
			Role:         model.RoleAdmin,
			Phone:        "081234567890",
		}
		if err := repo.CreateUser(admin); err == nil {
			log.Println("Seeded Admin User: admin@ecommerce.com / admin123")
		}
	}

	// 2. Seed Categories
	categories, err := repo.GetAllCategories()
	if err != nil || len(categories) == 0 {
		cats := []model.Category{
			{Name: "Elektronik & Gadget", Slug: "elektronik-gadget", Description: "Perangkat elektronik dan gadget modern", ImageURL: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600"},
			{Name: "Pakaian & Fashion", Slug: "pakaian-fashion", Description: "Fashion pria dan wanita kekinian", ImageURL: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600"},
			{Name: "Komputer & Aksesori", Slug: "komputer-aksesori", Description: "Hardware PC, laptop, dan perlengkapan kerja", ImageURL: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600"},
			{Name: "Gaya Hidup & Rumah", Slug: "gaya-hidup-rumah", Description: "Peralatan rumah tangga dan dekorasi", ImageURL: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600"},
		}
		for i := range cats {
			_ = repo.CreateCategory(&cats[i])
		}
		log.Println("Seeded Categories")
		categories, _ = repo.GetAllCategories()
	}

	// 3. Seed Products
	products, err := repo.GetProducts("", "", "")
	if err != nil || len(products) == 0 {
		var elecID, fashID, compID model.Category
		for _, c := range categories {
			if c.Slug == "elektronik-gadget" {
				elecID = c
			} else if c.Slug == "pakaian-fashion" {
				fashID = c
			} else if c.Slug == "komputer-aksesori" {
				compID = c
			}
		}

		sampleProducts := []model.Product{
			{
				CategoryID:  compID.ID,
				Name:        "Mechanical Gaming Keyboard RGB",
				Slug:        "mechanical-gaming-keyboard-rgb",
				Description: "Keyboard mekanikal dengan switch tactile, RGB backlit, dan konektivitas wireless 2.4GHz.",
				Price:       850000,
				Stock:       25,
				WeightGrams: 900,
				ImageURL:    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600",
				IsActive:    true,
			},
			{
				CategoryID:  compID.ID,
				Name:        "Wireless Ergonomic Mouse 1600 DPI",
				Slug:        "wireless-ergonomic-mouse-1600-dpi",
				Description: "Mouse ergonomis nirkabel tahan lama dengan daya tahan baterai hingga 12 bulan.",
				Price:       275000,
				Stock:       40,
				WeightGrams: 150,
				ImageURL:    "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600",
				IsActive:    true,
			},
			{
				CategoryID:  elecID.ID,
				Name:        "Active Noise Cancelling Headphones",
				Slug:        "anc-wireless-headphones",
				Description: "Headphone nirkabel berkualita audio tinggi dengan peredam kebisingan aktif dan baterai 30 jam.",
				Price:       1450000,
				Stock:       15,
				WeightGrams: 320,
				ImageURL:    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
				IsActive:    true,
			},
			{
				CategoryID:  fashID.ID,
				Name:        "Jaket Hoodie Minimalist Dark Slate",
				Slug:        "jaket-hoodie-minimalist-dark-slate",
				Description: "Hoodie bahan fleece premium hangat, nyaman dipakai harian dengan warna slate modern.",
				Price:       350000,
				Stock:       50,
				WeightGrams: 500,
				ImageURL:    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600",
				IsActive:    true,
			},
			{
				CategoryID:  elecID.ID,
				Name:        "Smartwatch AMOLED Display Heart Rate",
				Slug:        "smartwatch-amoled-display",
				Description: "Jam tangan pintar dengan layar AMOLED 1.43 inci, pelacak detak jantung, dan 100+ mode olahraga.",
				Price:       990000,
				Stock:       20,
				WeightGrams: 60,
				ImageURL:    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
				IsActive:    true,
			},
		}

		for i := range sampleProducts {
			_ = repo.CreateProduct(&sampleProducts[i])
		}
		log.Println("Seeded Products")
	}
}
