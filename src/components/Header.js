'use client';

export default function Header({ cartItemCount, onCartClick }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Santa Di Hatti</h1>
              <p className="text-xs text-gray-500">Fresh Food Outlet</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-3">
            <a
              href="/admin"
              className="text-gray-600 hover:text-blue-500 text-sm font-medium transition-colors duration-200"
            >
              Admin
            </a>
            <button
              onClick={onCartClick}
              className="relative bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-3 transition-colors duration-200"
            >
              <span className="text-xl">🛒</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
