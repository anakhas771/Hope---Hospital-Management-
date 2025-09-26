// src/components/ErrorBoundary.jsx
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Error caught in ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-900 text-white p-6">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p>{this.state.error?.message || "Unknown error"}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}