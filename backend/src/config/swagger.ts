export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Mini ERP + CRM Operations Portal API',
    version: '1.0.0',
    description: 'Production REST API for managing Wholesale Customers, Products, Inventory, Stock Movements, and Sales Challans with Role-Based Access Control.',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API Version 1',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/auth/login': {
      post: {
        summary: 'JWT Login',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'admin@minierp.com' },
                  password: { type: 'string', example: 'Password123!' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Successful login with JWT token & user profile' },
          401: { description: 'Invalid email or password' },
        },
      },
    },
    '/customers': {
      get: {
        summary: 'Get paginated customers list',
        tags: ['Customers'],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'customerType', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Paginated customer list' } },
      },
      post: {
        summary: 'Create new customer',
        tags: ['Customers'],
        responses: { 201: { description: 'Customer created successfully' } },
      },
    },
    '/products': {
      get: {
        summary: 'Get paginated products list',
        tags: ['Products'],
        responses: { 200: { description: 'Paginated product list' } },
      },
      post: {
        summary: 'Create new product',
        tags: ['Products'],
        responses: { 201: { description: 'Product created' } },
      },
    },
    '/challans': {
      get: {
        summary: 'Get sales challans',
        tags: ['Sales Challans'],
        responses: { 200: { description: 'Challan list' } },
      },
      post: {
        summary: 'Create sales challan (Draft or Confirmed)',
        tags: ['Sales Challans'],
        responses: { 201: { description: 'Challan created with inventory updates if confirmed' } },
      },
    },
  },
};
