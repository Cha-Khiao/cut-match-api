// =================================================================
// ✨ 1. IMPORTS (การนำเข้าโมดูล)
// =================================================================

// Core Node/Express modules
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Third-party Middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Local Route modules
const userRoutes = require('./routes/userRoutes.js');
const hairstyleRoutes = require('./routes/hairstyleRoutes.js');
const postRoutes = require('./routes/postRoutes.js');
const commentRoutes = require('./routes/commentRoutes.js');
const salonRoutes = require('./routes/salonRoutes.js');
const notificationRoutes = require('./routes/notificationRoutes.js');

// Local Middleware
const { errorHandler } = require('./middleware/errorMiddleware.js');


// =================================================================
// ✨ 2. INITIALIZATION & CONFIGURATION (การตั้งค่าเริ่มต้น)
// =================================================================

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;


// =================================================================
// ✨ 3. DATABASE CONNECTION (การเชื่อมต่อฐานข้อมูล)
// =================================================================

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected!');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};
connectDB();


// =================================================================
// ✨ 4. MIDDLEWARES (มิดเดิลแวร์)
// =================================================================

// Trust proxy for rate limiting on services like Render/Vercel
app.set('trust proxy', 1);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// JSON body parser
app.use(express.json());

// Security headers with Helmet, configured for Swagger UI
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "https://cdnjs.cloudflare.com"],
        "style-src": ["'self'", "https://cdnjs.cloudflare.com", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https://validator.swagger.io"],
      },
    },
  })
);

// Rate limiting for all API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, 
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', apiLimiter);


// =================================================================
// ✨ 5. API DOCUMENTATION (Swagger/OpenAPI)
// =================================================================

const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Cut Match API (เอกสารประกอบ)',
        version: '1.0.0',
        description: 'เอกสาร API สำหรับแอปพลิเคชัน Cut Match',
      },
      servers: [
        { url: 'https://cut-match-api.onrender.com', description: 'Production Server' },
        { url: `http://localhost:${PORT}`, description: 'Development Server' }
      ],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
        }
      },
      security: [{ bearerAuth: [] }]
    },
    apis: ['./routes/*.js'],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCssUrl: "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css",
  customJs: [
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js",
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js"
  ],
  customfavIcon: "/images/favicon.png"
}));


// =================================================================
// ✨ 6. API ROUTES (เส้นทาง API)
// =================================================================

// Redirect root to API docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.use('/api/users', userRoutes);
app.use('/api/hairstyles', hairstyleRoutes); // Handles /reviews internally
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/salons', salonRoutes);
app.use('/api/notifications', notificationRoutes);


// =================================================================
// ✨ 7. ERROR HANDLING & SERVER START
// =================================================================

// Centralized Error Handler (must be after all routes)
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});