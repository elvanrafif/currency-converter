import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <p className="text-5xl">💱</p>
        <h1 className="text-2xl font-bold text-gray-900">Currency pair not found</h1>
        <p className="text-gray-500">
          This currency pair doesn&apos;t exist or isn&apos;t supported.
          Make sure the format is correct, e.g.{' '}
          <code className="bg-gray-100 px-1 rounded text-sm">/convert/usd-to-idr</code>
        </p>
        <Link
          href="/"
          className="inline-block mt-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}
