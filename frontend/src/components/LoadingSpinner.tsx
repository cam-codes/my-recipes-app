const LoadingSpinner = () => {
  return (
    <div role="status" aria-label="Loading">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
    </div>
  );
};

export default LoadingSpinner;
