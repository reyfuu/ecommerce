package middleware

import (
	"net/http"
	"strings"

	"backend/internal/model"
	"backend/pkg/jwt"

	"github.com/gin-gonic/gin"
)

func JWTMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, model.APIResponse{
				Success: false,
				Message: "Authorization header is required",
				Error:   "UNAUTHORIZED",
			})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, model.APIResponse{
				Success: false,
				Message: "Invalid authorization header format",
				Error:   "INVALID_TOKEN_FORMAT",
			})
			c.Abort()
			return
		}

		claims, err := jwt.ValidateToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, model.APIResponse{
				Success: false,
				Message: "Invalid or expired token",
				Error:   "INVALID_TOKEN",
			})
			c.Abort()
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("userEmail", claims.Email)
		c.Set("userRole", claims.Role)

		c.Next()
	}
}

func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("userRole")
		if !exists || role != model.RoleAdmin {
			c.JSON(http.StatusForbidden, model.APIResponse{
				Success: false,
				Message: "Admin access required",
				Error:   "FORBIDDEN",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}
