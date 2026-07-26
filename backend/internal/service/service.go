package service

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"backend/internal/model"
	"backend/internal/repository"
	"backend/pkg/hasher"
	"backend/pkg/jwt"

	"github.com/google/uuid"
)

var (
	ErrEmailExists     = errors.New("email address is already registered")
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrInsufficientStock  = errors.New("insufficient stock for requested product")
	ErrEmptyCart          = errors.New("cart is empty")
)

type Service struct {
	repo *repository.Repository
}

func NewService(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

// Auth Services
func (s *Service) Register(req model.RegisterRequest) (*model.AuthResponse, error) {
	existingUser, err := s.repo.GetUserByEmail(req.Email)
	if err == nil && existingUser != nil {
		return nil, ErrEmailExists
	}

	hash, err := hasher.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	user := &model.User{
		Name:         req.Name,
		Email:        strings.ToLower(req.Email),
		PasswordHash: hash,
		Phone:        req.Phone,
		Role:         model.RoleCustomer,
	}

	if err := s.repo.CreateUser(user); err != nil {
		return nil, err
	}

	token, err := jwt.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, err
	}

	return &model.AuthResponse{
		Token: token,
		User:  *user,
	}, nil
}

func (s *Service) Login(req model.LoginRequest) (*model.AuthResponse, error) {
	user, err := s.repo.GetUserByEmail(req.Email)
	if err != nil || user == nil {
		return nil, ErrInvalidCredentials
	}

	if !hasher.CheckPassword(req.Password, user.PasswordHash) {
		return nil, ErrInvalidCredentials
	}

	token, err := jwt.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, err
	}

	return &model.AuthResponse{
		Token: token,
		User:  *user,
	}, nil
}

func (s *Service) GetUserByID(userID uuid.UUID) (*model.User, error) {
	return s.repo.GetUserByID(userID)
}

// Category Services
func (s *Service) CreateCategory(req model.CreateCategoryRequest) (*model.Category, error) {
	slug := strings.ToLower(strings.ReplaceAll(req.Name, " ", "-"))
	category := &model.Category{
		Name:        req.Name,
		Slug:        slug,
		Description: req.Description,
		ImageURL:    req.ImageURL,
	}
	if err := s.repo.CreateCategory(category); err != nil {
		return nil, err
	}
	return category, nil
}

func (s *Service) GetAllCategories() ([]model.Category, error) {
	return s.repo.GetAllCategories()
}

// Product Services
func (s *Service) CreateProduct(req model.CreateProductRequest) (*model.Product, error) {
	catID, err := uuid.Parse(req.CategoryID)
	if err != nil {
		return nil, errors.New("invalid category_id format")
	}

	slug := fmt.Sprintf("%s-%d", strings.ToLower(strings.ReplaceAll(req.Name, " ", "-")), time.Now().Unix())
	product := &model.Product{
		CategoryID:  catID,
		Name:        req.Name,
		Slug:        slug,
		Description: req.Description,
		Price:       req.Price,
		Stock:       req.Stock,
		WeightGrams: req.WeightGrams,
		ImageURL:    req.ImageURL,
		IsActive:    true,
	}

	if err := s.repo.CreateProduct(product); err != nil {
		return nil, err
	}
	return s.repo.GetProductByID(product.ID)
}

func (s *Service) GetProducts(categoryID, search, sortBy string) ([]model.Product, error) {
	return s.repo.GetProducts(categoryID, search, sortBy)
}

func (s *Service) GetProductByID(id uuid.UUID) (*model.Product, error) {
	return s.repo.GetProductByID(id)
}

func (s *Service) UpdateProduct(id uuid.UUID, req model.UpdateProductRequest) (*model.Product, error) {
	product, err := s.repo.GetProductByID(id)
	if err != nil {
		return nil, err
	}

	if req.Name != "" {
		product.Name = req.Name
	}
	if req.Description != "" {
		product.Description = req.Description
	}
	if req.Price > 0 {
		product.Price = req.Price
	}
	if req.Stock != nil {
		product.Stock = *req.Stock
	}
	if req.ImageURL != "" {
		product.ImageURL = req.ImageURL
	}
	if req.CategoryID != "" {
		if catID, err := uuid.Parse(req.CategoryID); err == nil {
			product.CategoryID = catID
		}
	}
	if req.IsActive != nil {
		product.IsActive = *req.IsActive
	}

	if err := s.repo.UpdateProduct(product); err != nil {
		return nil, err
	}
	return s.repo.GetProductByID(id)
}

func (s *Service) DeleteProduct(id uuid.UUID) error {
	return s.repo.DeleteProduct(id)
}

// Cart Services
func (s *Service) GetCart(userID uuid.UUID) (*model.Cart, error) {
	return s.repo.GetOrCreateCart(userID)
}

func (s *Service) AddToCart(userID uuid.UUID, req model.AddToCartRequest) (*model.Cart, error) {
	productID, err := uuid.Parse(req.ProductID)
	if err != nil {
		return nil, errors.New("invalid product_id")
	}

	product, err := s.repo.GetProductByID(productID)
	if err != nil {
		return nil, errors.New("product not found")
	}

	if product.Stock < req.Quantity {
		return nil, ErrInsufficientStock
	}

	cart, err := s.repo.GetOrCreateCart(userID)
	if err != nil {
		return nil, err
	}

	if err := s.repo.AddToCart(cart.ID, productID, req.Quantity); err != nil {
		return nil, err
	}

	return s.repo.GetOrCreateCart(userID)
}

func (s *Service) UpdateCartItem(userID uuid.UUID, itemID uuid.UUID, quantity int) (*model.Cart, error) {
	if err := s.repo.UpdateCartItemQuantity(itemID, quantity); err != nil {
		return nil, err
	}
	return s.repo.GetOrCreateCart(userID)
}

func (s *Service) RemoveCartItem(userID uuid.UUID, itemID uuid.UUID) (*model.Cart, error) {
	if err := s.repo.RemoveCartItem(itemID); err != nil {
		return nil, err
	}
	return s.repo.GetOrCreateCart(userID)
}

// Order Services
func (s *Service) Checkout(userID uuid.UUID, req model.CreateOrderRequest) (*model.Order, error) {
	cart, err := s.repo.GetOrCreateCart(userID)
	if err != nil {
		return nil, err
	}

	if len(cart.Items) == 0 {
		return nil, ErrEmptyCart
	}

	var totalAmount float64
	var orderItems []model.OrderItem

	for _, item := range cart.Items {
		if item.Product == nil {
			p, err := s.repo.GetProductByID(item.ProductID)
			if err != nil {
				return nil, fmt.Errorf("product not found for item %s", item.ProductID)
			}
			item.Product = p
		}

		if item.Product.Stock < item.Quantity {
			return nil, fmt.Errorf("insufficient stock for product %s (available: %d)", item.Product.Name, item.Product.Stock)
		}

		subtotal := item.Product.Price * float64(item.Quantity)
		totalAmount += subtotal

		orderItems = append(orderItems, model.OrderItem{
			ProductID:   item.ProductID,
			ProductName: item.Product.Name,
			Price:       item.Product.Price,
			Quantity:    item.Quantity,
			Subtotal:    subtotal,
		})
	}

	orderNumber := fmt.Sprintf("INV/%s/%d", time.Now().Format("20060102"), time.Now().UnixNano()%10000)

	order := &model.Order{
		OrderNumber:     orderNumber,
		UserID:          userID,
		TotalAmount:     totalAmount,
		ShippingFee:     15000, // Fixed shipping fee Rp 15,000 for MVP
		Status:          model.OrderStatusPaid, // Auto-mark paid for MVP checkout demo
		ShippingAddress: req.ShippingAddress,
		PaymentMethod:   req.PaymentMethod,
		PaymentStatus:   model.PaymentStatusPaid,
		Items:           orderItems,
	}

	if err := s.repo.CreateOrder(order); err != nil {
		return nil, fmt.Errorf("failed to create order: %w", err)
	}

	// Clear cart after checkout
	_ = s.repo.ClearCart(cart.ID)

	return s.repo.GetOrderByID(order.ID)
}

func (s *Service) GetUserOrders(userID uuid.UUID) ([]model.Order, error) {
	return s.repo.GetOrdersByUserID(userID)
}

func (s *Service) GetAllOrders() ([]model.Order, error) {
	return s.repo.GetAllOrders()
}

func (s *Service) GetOrderByID(orderID uuid.UUID) (*model.Order, error) {
	return s.repo.GetOrderByID(orderID)
}

func (s *Service) UpdateOrderStatus(orderID uuid.UUID, status string) (*model.Order, error) {
	if err := s.repo.UpdateOrderStatus(orderID, status); err != nil {
		return nil, err
	}
	return s.repo.GetOrderByID(orderID)
}
