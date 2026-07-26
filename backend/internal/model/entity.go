package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User Roles
const (
	RoleCustomer = "customer"
	RoleAdmin    = "admin"
)

// Order Statuses
const (
	OrderStatusPending   = "pending"
	OrderStatusPaid      = "paid"
	OrderStatusProcessing = "processing"
	OrderStatusShipped    = "shipped"
	OrderStatusCompleted  = "completed"
	OrderStatusCancelled  = "cancelled"
)

// Payment Statuses
const (
	PaymentStatusUnpaid = "unpaid"
	PaymentStatusPaid   = "paid"
	PaymentStatusFailed = "failed"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name         string    `gorm:"size:100;not null" json:"name"`
	Email        string    `gorm:"size:150;uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"size:255;not null" json:"-"`
	Phone        string    `gorm:"size:20" json:"phone"`
	Role         string    `gorm:"size:20;not null;default:'customer'" json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return
}

type Address struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID        uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	Label         string    `gorm:"size:50;not null" json:"label"`
	RecipientName string    `gorm:"size:100;not null" json:"recipient_name"`
	Phone         string    `gorm:"size:20;not null" json:"phone"`
	FullAddress   string    `gorm:"type:text;not null" json:"full_address"`
	City          string    `gorm:"size:100;not null" json:"city"`
	PostalCode    string    `gorm:"size:10;not null" json:"postal_code"`
	IsPrimary     bool      `gorm:"default:false" json:"is_primary"`
}

func (a *Address) BeforeCreate(tx *gorm.DB) (err error) {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return
}

type Category struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name        string    `gorm:"size:100;not null" json:"name"`
	Slug        string    `gorm:"size:120;uniqueIndex;not null" json:"slug"`
	ImageURL    string    `gorm:"type:text" json:"image_url"`
	Description string    `gorm:"type:text" json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

func (c *Category) BeforeCreate(tx *gorm.DB) (err error) {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return
}

type Product struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	CategoryID  uuid.UUID `gorm:"type:uuid;not null;index" json:"category_id"`
	Category    *Category `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Name        string    `gorm:"size:200;not null" json:"name"`
	Slug        string    `gorm:"size:220;uniqueIndex;not null" json:"slug"`
	Description string    `gorm:"type:text" json:"description"`
	Price       float64   `gorm:"type:numeric(12,2);not null" json:"price"`
	Stock       int       `gorm:"not null;default:0" json:"stock"`
	WeightGrams int       `gorm:"default:0" json:"weight_grams"`
	ImageURL    string    `gorm:"type:text" json:"image_url"`
	IsActive    bool      `gorm:"default:true;index" json:"is_active"`
	CreatedAt   time.Time `gorm:"index" json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (p *Product) BeforeCreate(tx *gorm.DB) (err error) {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return
}

type Cart struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	UserID    uuid.UUID  `gorm:"type:uuid;uniqueIndex;not null" json:"user_id"`
	Items     []CartItem `gorm:"foreignKey:CartID" json:"items"`
	UpdatedAt time.Time  `json:"updated_at"`
}

func (c *Cart) BeforeCreate(tx *gorm.DB) (err error) {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return
}

type CartItem struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	CartID    uuid.UUID `gorm:"type:uuid;not null;index" json:"cart_id"`
	ProductID uuid.UUID `gorm:"type:uuid;not null;index" json:"product_id"`
	Product   *Product  `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Quantity  int       `gorm:"not null;default:1" json:"quantity"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (ci *CartItem) BeforeCreate(tx *gorm.DB) (err error) {
	if ci.ID == uuid.Nil {
		ci.ID = uuid.New()
	}
	return
}

type Order struct {
	ID              uuid.UUID   `gorm:"type:uuid;primaryKey" json:"id"`
	OrderNumber     string      `gorm:"size:50;uniqueIndex;not null" json:"order_number"`
	UserID          uuid.UUID   `gorm:"type:uuid;not null;index" json:"user_id"`
	User            *User       `gorm:"foreignKey:UserID" json:"user,omitempty"`
	TotalAmount     float64     `gorm:"type:numeric(12,2);not null" json:"total_amount"`
	ShippingFee     float64     `gorm:"type:numeric(12,2);not null;default:0" json:"shipping_fee"`
	Status          string      `gorm:"size:30;not null;default:'pending';index" json:"status"`
	ShippingAddress string      `gorm:"type:text;not null" json:"shipping_address"`
	PaymentMethod   string      `gorm:"size:50" json:"payment_method"`
	PaymentStatus   string      `gorm:"size:30;default:'unpaid'" json:"payment_status"`
	Items           []OrderItem `gorm:"foreignKey:OrderID" json:"items"`
	CreatedAt       time.Time   `gorm:"index" json:"created_at"`
	UpdatedAt       time.Time   `json:"updated_at"`
}

func (o *Order) BeforeCreate(tx *gorm.DB) (err error) {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	return
}

type OrderItem struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	OrderID     uuid.UUID `gorm:"type:uuid;not null;index" json:"order_id"`
	ProductID   uuid.UUID `gorm:"type:uuid;not null" json:"product_id"`
	Product     *Product  `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	ProductName string    `gorm:"size:200;not null" json:"product_name"`
	Price       float64   `gorm:"type:numeric(12,2);not null" json:"price"`
	Quantity    int       `gorm:"not null" json:"quantity"`
	Subtotal    float64   `gorm:"type:numeric(12,2);not null" json:"subtotal"`
}

func (oi *OrderItem) BeforeCreate(tx *gorm.DB) (err error) {
	if oi.ID == uuid.Nil {
		oi.ID = uuid.New()
	}
	return
}

// Request & Response DTOs

type RegisterRequest struct {
	Name     string `json:"name" binding:"required,min=2"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Phone    string `json:"phone"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type CreateProductRequest struct {
	CategoryID  string  `json:"category_id" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price" binding:"required,gt=0"`
	Stock       int     `json:"stock" binding:"required,gte=0"`
	WeightGrams int     `json:"weight_grams"`
	ImageURL    string  `json:"image_url"`
}

type UpdateProductRequest struct {
	CategoryID  string  `json:"category_id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Stock       *int    `json:"stock"`
	WeightGrams int     `json:"weight_grams"`
	ImageURL    string  `json:"image_url"`
	IsActive    *bool   `json:"is_active"`
}

type CreateCategoryRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	ImageURL    string `json:"image_url"`
}

type AddToCartRequest struct {
	ProductID string `json:"product_id" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required,min=1"`
}

type UpdateCartItemRequest struct {
	Quantity int `json:"quantity" binding:"required,min=1"`
}

type CreateOrderRequest struct {
	ShippingAddress string `json:"shipping_address" binding:"required"`
	PaymentMethod   string `json:"payment_method" binding:"required"`
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}
