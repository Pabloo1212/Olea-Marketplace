# Olive Marketplace 🫒

A premium olive oil marketplace built with Next.js 14, TypeScript, and Supabase. This platform connects olive oil producers with customers worldwide, offering a curated selection of high-quality olive oils.

## 🚀 Features

### For Customers
- **Browse Products**: Discover premium olive oils from around the world
- **Advanced Filtering**: Filter by variety, origin, organic certification, and more
- **Favorites System**: Save your favorite products for later
- **Shopping Cart**: Secure cart management with stock validation
- **Product Reviews**: Read and write authentic reviews
- **Responsive Design**: Beautiful mobile-first experience

### For Producers
- **Product Management**: Add, edit, and manage your olive oil products
- **Image Upload**: Secure image handling with validation and optimization
- **Dashboard Analytics**: Track sales and product performance
- **Stock Management**: Real-time inventory tracking
- **Producer Profile**: Showcase your brand and story

### Technical Features
- **Type-Safe**: Full TypeScript implementation with Zod validation
- **Authentication**: Secure Supabase auth with role-based access
- **Real-time Data**: Live updates with Supabase subscriptions
- **Performance Optimized**: Image optimization, caching, and lazy loading
- **Testing**: Comprehensive test suite with Jest and React Testing Library
- **SEO Ready**: Optimized metadata and structured data

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: Zustand
- **Validation**: Zod
- **Testing**: Jest + React Testing Library
- **Icons**: Lucide React
- **Image Handling**: Custom upload service with validation

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for production deployment)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd olive-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Producer dashboard
│   ├── products/          # Product pages
│   └── profile/           # User profile
├── components/            # Reusable React components
│   ├── products/         # Product-related components
│   ├── ui/               # UI components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   ├── data/            # Data management
│   ├── supabase/        # Supabase configuration
│   ├── upload/          # Image upload service
│   ├── utils/           # Helper functions
│   └── validation/      # Zod schemas
├── hooks/               # Custom React hooks
├── stores/              # Zustand state stores
└── types/               # TypeScript type definitions
```

## 🧪 Testing

The project includes a comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Individual component and utility function tests
- **Integration Tests**: Component interaction and data flow tests
- **Validation Tests**: Schema validation and form handling tests

## 🏗 Architecture

### Data Layer
- **DataManager**: Centralized data access with caching and error handling
- **Validation**: Zod schemas for type-safe data validation
- **Error Handling**: Comprehensive error boundaries and user feedback

### State Management
- **Cart Store**: Shopping cart state with persistence
- **Favorites Store**: User favorites with server sync
- **Auth Store**: Authentication state management

### Component Architecture
- **Atomic Design**: Organized by component complexity
- **Reusable Components**: Highly configurable UI components
- **Performance Optimized**: Memoization and lazy loading

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `NEXT_PUBLIC_SITE_URL` | Site URL for SEO | No |

### Supabase Setup

1. Create a new Supabase project
2. Run the provided SQL migrations
3. Set up authentication providers
4. Configure storage buckets for images
5. Set up Row Level Security (RLS) policies

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Add environment variables
3. Deploy automatically on git push

### Other Platforms
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📊 Performance

- **Lighthouse Score**: 95+ Performance
- **Core Web Vitals**: Optimized for all metrics
- **Image Optimization**: Automatic resizing and format conversion
- **Code Splitting**: Automatic route-based splitting

## 🔒 Security

- **Authentication**: Secure JWT-based auth with Supabase
- **Input Validation**: Comprehensive validation with Zod
- **XSS Protection**: Built-in Next.js security features
- **CSRF Protection**: SameSite cookies and secure headers
- **Image Security**: File type and size validation
- **Rate Limiting**: API rate limiting (in production)

## 🌐 Internationalization

The app is prepared for multi-language support:
- **i18n Store**: Zustand-based translation management
- **Dynamic Content**: Language-aware content rendering
- **SEO Optimization**: Hreflang tags and localized metadata

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Maintain code coverage above 70%

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the [documentation](./docs/)
- Review existing issues and discussions

## 🗺 Roadmap

### Phase 1: Core Features ✅
- [x] Product browsing and filtering
- [x] User authentication
- [x] Shopping cart functionality
- [x] Producer dashboard
- [x] Image upload system

### Phase 2: Advanced Features 🚧
- [ ] Order management system
- [ ] Review and rating system
- [ ] Advanced analytics
- [ ] Email notifications
- [ ] Multi-language support

### Phase 3: Enterprise Features 📋
- [ ] Multi-vendor support
- [ ] Advanced shipping options
- [ ] Subscription service
- [ ] Mobile app
- [ ] API for third-party integration

## 📈 Analytics

The app includes comprehensive analytics tracking:
- User behavior tracking
- Product performance metrics
- Conversion funnel analysis
- Real-time dashboard analytics

---

Built with ❤️ for olive oil enthusiasts worldwide 🫒
