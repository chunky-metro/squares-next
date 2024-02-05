// BoxScoreHeader.tsx
import React from 'react';

const BoxScoreHeader: React.FC = () => {
  return (
    <div className="bg-base-700 text-white p-4">
      <div className="flex flex-col items-center">
        <div className="text-4xl font-bold mb-4">NFC vs AFC</div>
        <div className="text-lg font-medium">
          <span className="mx-2">1st</span>
          <span className="mx-2">2nd</span>
          <span className="mx-2">3rd</span>
          <span className="mx-2">4th</span>
        </div>
        <div className="text-2xl font-semibold mt-2">
          <span className="mx-2">-</span>
          <span className="mx-2">-</span>
          <span className="mx-2">-</span>
          <span className="mx-2">-</span>
        </div>
      </div>
    </div>
  );
};

export default BoxScoreHeader;
