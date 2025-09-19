# URL Shortener Microservice - System Design Document

## Architecture Overview

### High-Level Architecture
The system follows a **microservice architecture** with clear separation between frontend and backend services:

- **Frontend**: Next.js 14 with TypeScript (Client-side rendering + SSR)
- **Backend**: Express.js REST API with MongoDB
- **Communication**: RESTful APIs with JSON payloads
- **Logging**: Centralized logging service integration

### Technology Stack Justification

#### Backend Technologies
- **Express.js**: Lightweight, fast, and excellent for REST APIs with minimal overhead
- **MongoDB**: Document-based storage ideal for flexible URL metadata and analytics
- **Mongoose**: Provides schema validation and query optimization
- **Axios**: Reliable HTTP client for external API integration

#### Frontend Technologies  
- **Next.js 14**: Server-side rendering capabilities, excellent performance, and built-in optimization
- **TypeScript**: Type safety reduces runtime errors and improves maintainability
- **shadcn/ui**: Consistent, accessible component library with Tailwind CSS
- **Recharts**: Lightweight charting library for analytics visualization
- **SWR**: Client-side caching and data synchronization

## Data Modeling

### URL Schema Design
\`\`\`javascript
{
  _id: ObjectId,
  originalUrl: String (required, validated),
  shortCode: String (unique, indexed),
  customCode: String (optional, unique),
  clicks: Number (default: 0),
  createdAt: Date,
  expiresAt: Date,
  isActive: Boolean,
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String
  }
}
\`\`\`

### Design Rationale
- **Compound Indexing**: `shortCode` and `customCode` indexed for O(1) lookup performance
- **TTL Index**: `expiresAt` field enables automatic document expiration
- **Embedded Metadata**: Denormalized design for faster analytics queries
- **Flexible Expiration**: Supports both default (30 min) and custom validity periods

## Key Architectural Decisions

### 1. Stateless API Design
- **Decision**: RESTful stateless endpoints
- **Rationale**: Enables horizontal scaling and load balancing
- **Implementation**: JWT-free design with session-based rate limiting

### 2. Client-Side Rate Limiting
- **Decision**: 5 URLs per session limit enforced on frontend
- **Rationale**: Reduces server load while maintaining user experience
- **Fallback**: Server-side validation prevents abuse

### 3. Centralized Logging Architecture
- **Decision**: External logging service integration
- **Rationale**: Compliance with evaluation requirements and production monitoring
- **Implementation**: Structured logging with fallback to console

### 4. Hybrid Rendering Strategy
- **Decision**: Next.js with both SSR and CSR
- **Rationale**: SEO benefits for landing pages, dynamic interactivity for dashboard
- **Implementation**: Server components for static content, client components for interactions

## Scalability Considerations

### Database Optimization
- **Indexing Strategy**: Compound indexes on frequently queried fields
- **Connection Pooling**: Mongoose connection pooling for concurrent requests
- **Query Optimization**: Aggregation pipelines for analytics

### Caching Strategy
- **Client-Side**: SWR for API response caching and revalidation
- **Future Enhancement**: Redis for server-side caching of popular URLs

### Load Balancing Readiness
- **Stateless Design**: No server-side session storage
- **Environment Configuration**: Externalized configuration for multi-instance deployment
- **Health Checks**: Built-in endpoints for load balancer health monitoring

## Security Considerations

### Input Validation
- **URL Validation**: Comprehensive regex and protocol validation
- **XSS Prevention**: Input sanitization and CSP headers
- **Rate Limiting**: Client and server-side request throttling

### Data Protection
- **No PII Storage**: Minimal user data collection
- **Secure Headers**: CORS configuration and security headers
- **Environment Variables**: Sensitive data externalized

## Monitoring and Observability

### Logging Strategy
- **Structured Logging**: JSON format with consistent fields
- **Log Levels**: Debug, Info, Warn, Error, Fatal hierarchy
- **External Integration**: Test server API compliance
- **Fallback Mechanism**: Console logging when external service unavailable

### Analytics Implementation
- **Real-time Metrics**: Click tracking and URL performance
- **Dashboard Visualization**: Interactive charts with Recharts
- **Data Aggregation**: MongoDB aggregation for statistical analysis

## Assumptions and Constraints

### Business Assumptions
- **Session-based Usage**: Users don't require persistent accounts
- **Short-term Storage**: 30-minute default validity sufficient for most use cases
- **Limited Scale**: 5 URLs per session adequate for evaluation purposes

### Technical Constraints
- **3-Hour Development Window**: Influenced technology choices toward familiar stack
- **Evaluation Environment**: External logging service integration mandatory
- **No Authentication**: Simplified user model for rapid development

### Future Enhancements
- **User Authentication**: JWT-based auth for persistent URL management
- **Custom Domains**: Support for branded short URLs
- **Analytics API**: RESTful endpoints for programmatic access
- **Bulk Operations**: CSV import/export functionality
- **A/B Testing**: URL variant testing capabilities

## Performance Characteristics

### Expected Load Handling
- **Concurrent Users**: 100+ simultaneous users
- **Request Throughput**: 1000+ requests/minute
- **Database Performance**: Sub-100ms query response times
- **Frontend Rendering**: <2s initial page load

### Optimization Strategies
- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js built-in image optimization
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Database Queries**: Optimized aggregation pipelines

## Deployment Architecture

### Development Environment
- **Local Development**: Docker Compose for service orchestration
- **Hot Reloading**: Next.js and Nodemon for rapid iteration
- **Environment Parity**: Consistent configuration across environments

### Production Readiness
- **Container Support**: Dockerfile for both frontend and backend
- **Environment Configuration**: 12-factor app compliance
- **Health Monitoring**: Application health endpoints
- **Graceful Shutdown**: Proper cleanup on service termination

This architecture provides a solid foundation for a production-ready URL shortener service while maintaining simplicity and development velocity within the evaluation constraints.
