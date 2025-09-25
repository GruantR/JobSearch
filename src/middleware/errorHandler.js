const handleSequelizeErrors = (error) => {
    if (error.name === 'SequelizeValidationError') {
        return {
            status: 400,
            message: 'Validation failed',
            details: error.errors.map(e => e.message)
        };
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
        return {
            status: 400,
            message: 'Duplicate entry',
            details: error.errors.map(e => e.message)
        };
    }
    
    if (error.name === 'SequelizeDatabaseError') {
        return {
            status: 400,
            message: 'Database error',
            details: error.message
        };
    }
    

    
    return {
        status: 500,
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
};

module.exports = (error, req, res, next) => {
    console.error('Error:', error);
    
    const errorResponse = handleSequelizeErrors(error);
    res.status(errorResponse.status).json({
        success: false,
        error: errorResponse.message,
        details: errorResponse.details
    });
};