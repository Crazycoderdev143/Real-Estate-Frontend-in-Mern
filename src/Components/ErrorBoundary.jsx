import React from "react";
import NotFound from "./NotFound";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error) {
    console.error("Error:", error);
    return {hasError: true};
  }

  componentDidCatch(error, info) {
    console.error("Error details:", info);
  }

  render() {
    if (this.state.hasError) {
      return <NotFound message="Something went wrong" />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
