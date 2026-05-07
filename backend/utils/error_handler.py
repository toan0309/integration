from flask import jsonify
from typing import Dict, Any, Optional

def error_response(message: str, status_code: int = 400, error_code: str = None, 
                  details: Dict = None) -> tuple:
    """
    Create a standardized error response
    
    Args:
        message: Error message
        status_code: HTTP status code
        error_code: Optional error code for categorization
        details: Optional additional error details
        
    Returns:
        Tuple of (response_dict, status_code)
    """
    response = {
        'success': False,
        'error': message,
        'status_code': status_code
    }
    
    if error_code:
        response['error_code'] = error_code
    
    if details:
        response['details'] = details
    
    return jsonify(response), status_code

def success_response(data: Any = None, status_code: int = 200, 
                    message: str = "Success") -> tuple:
    """
    Create a standardized success response
    
    Args:
        data: Response data
        status_code: HTTP status code
        message: Optional success message
        
    Returns:
        Tuple of (response_dict, status_code)
    """
    response = {
        'success': True,
        'message': message,
        'status_code': status_code
    }
    
    if data:
        response['data'] = data
    
    return jsonify(response), status_code

def validation_error_response(errors: Dict[str, str], status_code: int = 400) -> tuple:
    """
    Create a validation error response
    
    Args:
        errors: Dictionary mapping field names to error messages
        status_code: HTTP status code
        
    Returns:
        Tuple of (response_dict, status_code)
    """
    response = {
        'success': False,
        'error': 'Validation failed',
        'validation_errors': errors,
        'status_code': status_code
    }
    
    return jsonify(response), status_code

def paginated_response(items: list, total: int, page: int, per_page: int, 
                      status_code: int = 200) -> tuple:
    """
    Create a paginated response
    
    Args:
        items: List of items
        total: Total number of items
        page: Current page number
        per_page: Items per page
        status_code: HTTP status code
        
    Returns:
        Tuple of (response_dict, status_code)
    """
    total_pages = (total + per_page - 1) // per_page
    
    response = {
        'success': True,
        'data': items,
        'pagination': {
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': total_pages,
            'has_next': page < total_pages,
            'has_prev': page > 1
        },
        'status_code': status_code
    }
    
    return jsonify(response), status_code

class ErrorHandler:
    """Error handling utility class"""
    
    # Error codes
    UNAUTHORIZED = 'UNAUTHORIZED'
    FORBIDDEN = 'FORBIDDEN'
    NOT_FOUND = 'NOT_FOUND'
    BAD_REQUEST = 'BAD_REQUEST'
    CONFLICT = 'CONFLICT'
    INTERNAL_ERROR = 'INTERNAL_ERROR'
    VALIDATION_ERROR = 'VALIDATION_ERROR'
    
    @staticmethod
    def unauthorized(message: str = "Unauthorized") -> tuple:
        """Return 401 Unauthorized error"""
        return error_response(message, 401, ErrorHandler.UNAUTHORIZED)
    
    @staticmethod
    def forbidden(message: str = "Forbidden") -> tuple:
        """Return 403 Forbidden error"""
        return error_response(message, 403, ErrorHandler.FORBIDDEN)
    
    @staticmethod
    def not_found(message: str = "Not found") -> tuple:
        """Return 404 Not Found error"""
        return error_response(message, 404, ErrorHandler.NOT_FOUND)
    
    @staticmethod
    def bad_request(message: str = "Bad request") -> tuple:
        """Return 400 Bad Request error"""
        return error_response(message, 400, ErrorHandler.BAD_REQUEST)
    
    @staticmethod
    def conflict(message: str = "Conflict") -> tuple:
        """Return 409 Conflict error"""
        return error_response(message, 409, ErrorHandler.CONFLICT)
    
    @staticmethod
    def internal_error(message: str = "Internal server error") -> tuple:
        """Return 500 Internal Server Error"""
        return error_response(message, 500, ErrorHandler.INTERNAL_ERROR)
    
    @staticmethod
    def validation_error(errors: Dict[str, str]) -> tuple:
        """Return validation error response"""
        return validation_error_response(errors, 400)

error_handler = ErrorHandler()
