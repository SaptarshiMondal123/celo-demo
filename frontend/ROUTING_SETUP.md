# Installation Instructions for React Router

To enable routing in the EchoDAO application, you need to install React Router DOM.

## Installation Command

Run this command in the `frontend` directory:

```bash
npm install react-router-dom
```

Or if you're using yarn:

```bash
yarn add react-router-dom
```

## What This Enables

After installation, the application will have:

1. **Separate Pages**: 
   - Home Page (/) - All main sections (Hero, About, Features, Proposals, Funding, etc.)
   - Fund Redistribution Page (/fund-redistribution) - Dedicated payment tracking page

2. **Navigation**:
   - Header "Funding" dropdown now has a link to the separate Fund Redistribution page
   - "Back to Home" button on the Fund Redistribution page

3. **Routing Structure**:
   - Browser URL changes when navigating between pages
   - Direct URL access to /fund-redistribution works
   - Browser back/forward buttons work correctly

## After Installation

1. Install the package: `npm install react-router-dom`
2. Restart your dev server: `npm run dev`
3. Navigate to the Funding dropdown in the header
4. Click "Fund Redistribution" to go to the dedicated payment page

## Files Modified

- `App.tsx` - Now uses React Router with Routes
- `Header.tsx` - Uses Link component for Fund Redistribution
- `FundRedistribution.tsx` - Added "Back to Home" button
- `pages/HomePage.tsx` - Created (contains all home page sections)
- `pages/FundRedistributionPage.tsx` - Created (dedicated fund redistribution page)
