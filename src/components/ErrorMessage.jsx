import React from 'react';

function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg relative max-w-2xl mx-auto my-4" role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
}

export default ErrorMessage; 