import type { ComponentType, FC } from 'react';
import { Component } from 'react';
// Updated for React Router v6 compatibility

type ErrorBoundaryProps = {
  FallbackComponent?: ComponentType<ErrorBoundaryFallbackProps>;
};

/** Needed for tests -- should not be imported by application logic */
export type ErrorBoundaryState = {
  hasError: boolean;
  error: { message: string; stack: string; name: string };
  errorInfo: { componentStack: string };
};

const DefaultFallback: FC = () => <div />;

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // eslint-disable-next-line
  unlisten: () => void = () => {};

  readonly defaultState: ErrorBoundaryState = {
    hasError: false,
    error: {
      message: '',
      stack: '',
      name: '',
    },
    errorInfo: {
      componentStack: '',
    },
  };

  constructor(props) {
    super(props);
    this.state = this.defaultState;
  }

  componentDidMount() {
    // Listen to popstate events instead of react-router history
    this.unlisten = () => {
      window.removeEventListener('popstate', this.handleLocationChange);
    };
    window.addEventListener('popstate', this.handleLocationChange);
  }

  handleLocationChange = () => {
    // reset state to default when location changes
    this.setState(this.defaultState);
  };

  componentWillUnmount() {
    this.unlisten();
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      hasError: true,
      error,
      errorInfo,
    });
    // Log the error so something shows up in the JS console when `DefaultFallback` is used.
    // eslint-disable-next-line no-console
    console.error('Caught error in a child component:', error, errorInfo);
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const FallbackComponent = this.props.FallbackComponent || DefaultFallback;
    return hasError ? (
      <FallbackComponent
        title={error.name}
        componentStack={errorInfo.componentStack}
        errorMessage={error.message}
        stack={error.stack}
      />
    ) : (
      <>{this.props.children}</>
    );
  }
}

export default ErrorBoundary;

type ErrorBoundaryFallbackProps = {
  errorMessage: string;
  componentStack: string;
  stack: string;
  title: string;
};
