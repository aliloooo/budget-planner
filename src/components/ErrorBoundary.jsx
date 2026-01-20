
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
                    <div className="max-w-md w-full bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
                        <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
                        <p className="mb-4 text-gray-300">
                            The application encountered a critical error and could not load.
                        </p>
                        <div className="bg-black p-4 rounded overflow-auto mb-4 text-sm font-mono text-red-400">
                            {this.state.error && this.state.error.toString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-4">
                            <p>Possible fix:</p>
                            <ul className="list-disc ml-4 mt-2">
                                <li>Check if VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Vercel.</li>
                                <li>Check browser console for more details.</li>
                            </ul>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
