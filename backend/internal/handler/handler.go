package handler

import (
	"net/http"

	"backend/internal/model"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	svc *service.Service
}

func NewHandler(svc *service.Service) *Handler {
	return &Handler{svc: svc}
}

// Auth Handlers
func (h *Handler) Register(c *gin.Context) {
	var req model.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: "Invalid input request payload",
			Error:   err.Error(),
		})
		return
	}

	res, err := h.svc.Register(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: err.Error(),
			Error:   "REGISTER_FAILED",
		})
		return
	}

	c.JSON(http.StatusCreated, model.APIResponse{
		Success: true,
		Message: "User registered successfully",
		Data:    res,
	})
}

func (h *Handler) Login(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: "Invalid email or password input",
			Error:   err.Error(),
		})
		return
	}

	res, err := h.svc.Login(req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, model.APIResponse{
			Success: false,
			Message: err.Error(),
			Error:   "LOGIN_FAILED",
		})
		return
	}

	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Message: "Login successful",
		Data:    res,
	})
}

func (h *Handler) GetMe(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, model.APIResponse{
			Success: false,
			Message: "Unauthorized",
			Error:   "UNAUTHORIZED",
		})
		return
	}

	userID := userIDVal.(uuid.UUID)
	user, err := h.svc.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, model.APIResponse{
			Success: false,
			Message: "User not found",
			Error:   "USER_NOT_FOUND",
		})
		return
	}

	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Message: "User profile retrieved successfully",
		Data:    user,
	})
}

// Category Handlers
func (h *Handler) GetCategories(c *gin.Context) {
	categories, err := h.svc.GetAllCategories()
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.APIResponse{
			Success: false,
			Message: "Failed to fetch categories",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Message: "Categories retrieved successfully",
		Data:    categories,
	})
}

func (h *Handler) CreateCategory(c *gin.Context) {
	var req model.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: "Invalid input payload",
			Error:   err.Error(),
		})
		return
	}

	category, err := h.svc.CreateCategory(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.APIResponse{
			Success: false,
			Message: "Failed to create category",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, model.APIResponse{
		Success: true,
		Message: "Category created successfully",
		Data:    category,
	})
}

// Product Handlers
func (h *Handler) GetProducts(c *gin.Context) {
	categoryID := c.Query("category_id")
	search := c.Query("search")
	sortBy := c.Query("sort_by")

	products, err := h.svc.GetProducts(categoryID, search, sortBy)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.APIResponse{
			Success: false,
			Message: "Failed to fetch products",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Message: "Products retrieved successfully",
		Data:    products,
	})
}

func (h *Handler) GetProductByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: "Invalid product ID format",
			Error:   "INVALID_ID",
		})
		return
	}

	product, err := h.svc.GetProductByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, model.APIResponse{
			Success: false,
			Message: "Product not found",
			Error:   "PRODUCT_NOT_FOUND",
		})
		return
	}

	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Message: "Product retrieved successfully",
		Data:    product,
	})
}

func (h *Handler) CreateProduct(c *gin.Context) {
	var req model.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: "Invalid input payload",
			Error:   err.Error(),
		})
		return
	}

	product, err := h.svc.CreateProduct(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: err.Error(),
			Error:   "CREATE_PRODUCT_FAILED",
		})
		return
	}

	c.JSON(http.StatusCreated, model.APIResponse{
		Success: true,
		Message: "Product created successfully",
		Data:    product,
	})
}

func (h *Handler) UpdateProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: "Invalid product ID format",
			Error:   "INVALID_ID",
		})
		return
	}

	var req model.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: "Invalid input payload",
			Error:   err.Error(),
		})
		return
	}

	product, err := h.svc.UpdateProduct(id, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: err.Error(),
			Error:   "UPDATE_PRODUCT_FAILED",
		})
		return
	}

	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Message: "Product updated successfully",
		Data:    product,
	})
}

func (h *Handler) DeleteProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: "Invalid product ID format",
			Error:   "INVALID_ID",
		})
		return
	}

	if err := h.svc.DeleteProduct(id); err != nil {
		c.JSON(http.StatusInternalServerError, model.APIResponse{
			Success: false,
			Message: "Failed to delete product",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Message: "Product deleted successfully",
	})
}

// Cart Handlers
func (h *Handler) GetCart(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	cart, err := h.svc.GetCart(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.APIResponse{
			Success: false,
			Message: "Failed to fetch cart",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Message: "Cart retrieved successfully",
		Data:    cart,
	})
}

func (h *Handler) AddToCart(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	var req model.AddToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: "Invalid payload",
			Error:   err.Error(),
		})
		return
	}

	cart, err := h.svc.AddToCart(userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: err.Error(),
			Error:   "ADD_TO_CART_FAILED",
		})
		return
	}

	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Message: "Item added to cart",
		Data:    cart,
	})
}

func (h *Handler) UpdateCartItem(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	itemIDStr := c.Param("itemId")
	itemID, err := uuid.Parse(itemIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: "Invalid item ID",
			Error:   "INVALID_ID",
		})
		return
	}

	var req model.UpdateCartItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: "Invalid payload",
			Error:   err.Error(),
		})
		return
	}

	cart, err := h.svc.UpdateCartItem(userID, itemID, req.Quantity)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: err.Error(),
			Error:   "UPDATE_CART_FAILED",
		})
		return
	}

	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Message: "Cart item updated",
		Data:    cart,
	})
}

func (h *Handler) RemoveCartItem(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	itemIDStr := c.Param("itemId")
	itemID, err := uuid.Parse(itemIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: "Invalid item ID",
			Error:   "INVALID_ID",
		})
		return
	}

	cart, err := h.svc.RemoveCartItem(userID, itemID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.APIResponse{
			Success: false,
			Message: "Failed to remove item",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Message: "Item removed from cart",
		Data:    cart,
	})
}

// Order Handlers
func (h *Handler) Checkout(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	var req model.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: "Invalid shipping address or payment method",
			Error:   err.Error(),
		})
		return
	}

	order, err := h.svc.Checkout(userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: err.Error(),
			Error:   "CHECKOUT_FAILED",
		})
		return
	}

	c.JSON(http.StatusCreated, model.APIResponse{
		Success: true,
		Message: "Order placed successfully",
		Data:    order,
	})
}

func (h *Handler) GetUserOrders(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	orders, err := h.svc.GetUserOrders(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.APIResponse{
			Success: false,
			Message: "Failed to fetch orders",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Message: "Orders retrieved successfully",
		Data:    orders,
	})
}

func (h *Handler) GetAllOrders(c *gin.Context) {
	orders, err := h.svc.GetAllOrders()
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.APIResponse{
			Success: false,
			Message: "Failed to fetch all orders",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Message: "All orders retrieved successfully",
		Data:    orders,
	})
}

func (h *Handler) UpdateOrderStatus(c *gin.Context) {
	orderIDStr := c.Param("id")
	orderID, err := uuid.Parse(orderIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: "Invalid order ID",
			Error:   "INVALID_ID",
		})
		return
	}

	var req model.UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: "Invalid status payload",
			Error:   err.Error(),
		})
		return
	}

	order, err := h.svc.UpdateOrderStatus(orderID, req.Status)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: err.Error(),
			Error:   "UPDATE_ORDER_FAILED",
		})
		return
	}

	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Message: "Order status updated successfully",
		Data:    order,
	})
}
