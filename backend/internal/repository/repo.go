package repository

import (
	"errors"
	"fmt"
	"os"
	"strings"

	"backend/internal/model"

	"github.com/google/uuid"
	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	ErrNotFound = errors.New("record not found")
)

type Repository struct {
	DB *gorm.DB
}

func NewRepository() (*Repository, error) {
	var db *gorm.DB
	var err error

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		host := os.Getenv("DB_HOST")
		if host == "" {
			host = "localhost"
		}
		port := os.Getenv("DB_PORT")
		if port == "" {
			port = "5432"
		}
		user := os.Getenv("DB_USER")
		if user == "" {
			user = "postgres"
		}
		pass := os.Getenv("DB_PASSWORD")
		if pass == "" {
			pass = "postgres"
		}
		name := os.Getenv("DB_NAME")
		if name == "" {
			name = "ecommerce"
		}
		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable", host, user, pass, name, port)
	}

	// Try connecting to Postgres first
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Printf("PostgreSQL connection skipped/failed: %v. Falling back to SQLite for seamless local dev.\n", err)
		// Fallback to SQLite
		db, err = gorm.Open(sqlite.Open("ecommerce.db"), &gorm.Config{})
		if err != nil {
			return nil, fmt.Errorf("failed to initialize SQLite database: %w", err)
		}
	}

	// Auto Migrate Entities
	err = db.AutoMigrate(
		&model.User{},
		&model.Address{},
		&model.Category{},
		&model.Product{},
		&model.Cart{},
		&model.CartItem{},
		&model.Order{},
		&model.OrderItem{},
	)
	if err != nil {
		return nil, fmt.Errorf("auto migration failed: %w", err)
	}

	return &Repository{DB: db}, nil
}

// User Repository
func (r *Repository) CreateUser(user *model.User) error {
	return r.DB.Create(user).Error
}

func (r *Repository) GetUserByEmail(email string) (*model.User, error) {
	var user model.User
	err := r.DB.Where("email = ?", strings.ToLower(email)).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (r *Repository) GetUserByID(id uuid.UUID) (*model.User, error) {
	var user model.User
	err := r.DB.First(&user, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &user, nil
}

// Category Repository
func (r *Repository) CreateCategory(category *model.Category) error {
	return r.DB.Create(category).Error
}

func (r *Repository) GetAllCategories() ([]model.Category, error) {
	var categories []model.Category
	err := r.DB.Order("name ASC").Find(&categories).Error
	return categories, err
}

func (r *Repository) GetCategoryByID(id uuid.UUID) (*model.Category, error) {
	var category model.Category
	err := r.DB.First(&category, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &category, nil
}

// Product Repository
func (r *Repository) CreateProduct(product *model.Product) error {
	return r.DB.Create(product).Error
}

func (r *Repository) UpdateProduct(product *model.Product) error {
	return r.DB.Save(product).Error
}

func (r *Repository) DeleteProduct(id uuid.UUID) error {
	return r.DB.Delete(&model.Product{}, "id = ?", id).Error
}

func (r *Repository) GetProductByID(id uuid.UUID) (*model.Product, error) {
	var product model.Product
	err := r.DB.Preload("Category").First(&product, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &product, nil
}

func (r *Repository) GetProducts(categoryID string, search string, sortBy string) ([]model.Product, error) {
	var products []model.Product
	query := r.DB.Preload("Category").Where("is_active = ?", true)

	if categoryID != "" {
		if catID, err := uuid.Parse(categoryID); err == nil {
			query = query.Where("category_id = ?", catID)
		}
	}

	if search != "" {
		searchTerm := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(name) LIKE ? OR LOWER(description) LIKE ?", searchTerm, searchTerm)
	}

	switch sortBy {
	case "price_asc":
		query = query.Order("price ASC")
	case "price_desc":
		query = query.Order("price DESC")
	default:
		query = query.Order("created_at DESC")
	}

	err := query.Find(&products).Error
	return products, err
}

// Cart Repository
func (r *Repository) GetOrCreateCart(userID uuid.UUID) (*model.Cart, error) {
	var cart model.Cart
	err := r.DB.Preload("Items.Product").Where("user_id = ?", userID).First(&cart).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		cart = model.Cart{UserID: userID}
		if createErr := r.DB.Create(&cart).Error; createErr != nil {
			return nil, createErr
		}
	} else if err != nil {
		return nil, err
	}
	return &cart, nil
}

func (r *Repository) AddToCart(cartID uuid.UUID, productID uuid.UUID, quantity int) error {
	var item model.CartItem
	err := r.DB.Where("cart_id = ? AND product_id = ?", cartID, productID).First(&item).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		newItem := model.CartItem{
			CartID:    cartID,
			ProductID: productID,
			Quantity:  quantity,
		}
		return r.DB.Create(&newItem).Error
	} else if err != nil {
		return err
	}

	item.Quantity += quantity
	return r.DB.Save(&item).Error
}

func (r *Repository) UpdateCartItemQuantity(itemID uuid.UUID, quantity int) error {
	return r.DB.Model(&model.CartItem{}).Where("id = ?", itemID).Update("quantity", quantity).Error
}

func (r *Repository) RemoveCartItem(itemID uuid.UUID) error {
	return r.DB.Delete(&model.CartItem{}, "id = ?", itemID).Error
}

func (r *Repository) ClearCart(cartID uuid.UUID) error {
	return r.DB.Where("cart_id = ?", cartID).Delete(&model.CartItem{}).Error
}

// Order Repository
func (r *Repository) CreateOrder(order *model.Order) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(order).Error; err != nil {
			return err
		}

		// Deduct stock for each product
		for _, item := range order.Items {
			if err := tx.Model(&model.Product{}).Where("id = ? AND stock >= ?", item.ProductID, item.Quantity).
				UpdateColumn("stock", gorm.Expr("stock - ?", item.Quantity)).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *Repository) GetOrdersByUserID(userID uuid.UUID) ([]model.Order, error) {
	var orders []model.Order
	err := r.DB.Preload("Items.Product").Where("user_id = ?", userID).Order("created_at DESC").Find(&orders).Error
	return orders, err
}

func (r *Repository) GetAllOrders() ([]model.Order, error) {
	var orders []model.Order
	err := r.DB.Preload("User").Preload("Items.Product").Order("created_at DESC").Find(&orders).Error
	return orders, err
}

func (r *Repository) GetOrderByID(orderID uuid.UUID) (*model.Order, error) {
	var order model.Order
	err := r.DB.Preload("User").Preload("Items.Product").Where("id = ?", orderID).First(&order).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &order, nil
}

func (r *Repository) UpdateOrderStatus(orderID uuid.UUID, status string) error {
	return r.DB.Model(&model.Order{}).Where("id = ?", orderID).Updates(map[string]interface{}{
		"status": status,
		"payment_status": func() string {
			if status == model.OrderStatusPaid || status == model.OrderStatusCompleted {
				return model.PaymentStatusPaid
			}
			return model.PaymentStatusUnpaid
		}(),
	}).Error
}
