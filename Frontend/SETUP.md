# AutoScribe Frontend Setup

## Environment Variables

Create a `.env` file in the Frontend directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables in `.env`

3. Start the development server:
```bash
npm run dev
```

## Features Implemented

- ✅ User Authentication (Login/Register)
- ✅ Protected Routes
- ✅ Modern UI with Tailwind CSS
- ✅ Supabase Integration
- ✅ React Router Navigation
- ✅ Responsive Design

## Authentication Flow

1. Users can register with email/password
2. Email verification required (handled by Supabase)
3. Users can sign in with verified accounts
4. Protected dashboard accessible only to authenticated users
5. Automatic redirect to login for unauthenticated users

## Next Steps

- Implement the main AutoScribe functionality
- Add audio recording capabilities
- Integrate with transcription services
- Build the diagram generation engine
