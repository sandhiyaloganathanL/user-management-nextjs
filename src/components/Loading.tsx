import React from "react";

const Loading: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="inline-block">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#FFC107] rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-sm text-[#51545f]">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
