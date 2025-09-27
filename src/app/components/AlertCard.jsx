// components/AlertCard.jsx
"use client";

const AlertCard = ({ title, message, time, bgcolor, border, borderc }) => {
  return (
    <div
      className={`flex items-start gap-4 p-4 border rounded-lg ${border} ${borderc} shadow-xl`}
    >
      <div className="flex-shrink-0">
        <span
          className={`inline-block w-6 h-6 ${bgcolor} text-white rounded-full text-center justify-center align-middle text-sm font-bold`}
        >
          1
        </span>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{title}</p>
        <p className="text-gray-600 text-sm">{message}</p>
        <p className="text-gray-400 text-xs mt-1">{time}</p>
      </div>
      <div>
        <span className={`w-2 h-2 ${bgcolor} rounded-full mt-1 block`}></span>
      </div>
    </div>
  );
};

export default AlertCard;
