import { useLocation, useNavigate } from "react-router-dom";

function ConfirmBooking() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // fallback safety
  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Booking details not found
      </div>
    );
  }

  const {
    playAreaName = "Sip and Score",
    address = "Cuttack, Odisha",
    court = "Court 1",
    date = "Fri, 06 Feb 2026",
    time = "7:00 PM - 8:00 PM",
    image,
    price = 800,
  } = state;

  const advanceAmount = 100;

  return (
    <div className="min-h-screen bg-slate-100 pb-28">

      {/* HEADER */}
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => navigate(-1)}>←</button>
        <span className="font-semibold">Confirm Booking</span>
        <button onClick={() => navigate("/")}>🏠</button>
      </div>

      {/* BOOKING CARD */}
      <div className="bg-white m-4 rounded-xl shadow p-4 flex gap-3">
        <div className="flex-1">
          <h2 className="font-semibold text-lg">{playAreaName}</h2>
          <p className="text-sm text-gray-500">{address}</p>

          <div className="flex gap-4 text-sm mt-2 text-gray-600">
            <span>🏟 {court}</span>
            <span>📅 {date}</span>
            <span>⏰ {time}</span>
          </div>
        </div>

        {image && (
          <img
            src={image}
            alt="court"
            className="w-20 h-20 rounded-lg object-cover"
          />
        )}
      </div>

      {/* APPLY VOUCHER */}
      <div
        className="bg-white mx-4 rounded-xl p-4 flex justify-between items-center cursor-pointer"
        onClick={() => alert("Voucher system coming soon")}
      >
        <span className="font-medium">Apply Voucher</span>
        <span>›</span>
      </div>

      {/* SLOT PRICE */}
      <div className="mx-4 mt-4 border-2 border-dashed border-gray-300 rounded-xl p-4 flex justify-between">
        <span className="text-gray-600">Slot Price</span>
        <span className="font-semibold">₹{price}</span>
      </div>

      {/* PAYMENT OPTIONS */}
      <div className="bg-white mx-4 mt-4 rounded-xl p-4 space-y-3">
        <label className="flex justify-between items-center">
          <div>
            <input type="radio" defaultChecked />
            <span className="ml-2">Pay advance</span>
            <p className="text-xs text-gray-500 ml-6">
              (₹{advanceAmount} now)
            </p>
          </div>
          <span className="font-semibold">₹{advanceAmount}</span>
        </label>

        <label className="flex justify-between items-center">
          <div>
            <input type="radio" />
            <span className="ml-2">Pay full amount</span>
          </div>
          <span className="font-semibold">₹{price}</span>
        </label>
      </div>

      {/* COINS INFO */}
      <p className="text-center text-xs text-orange-500 mt-3">
        You may avail 2 PlayCoins from this booking
      </p>

      {/* TOTAL */}
      <div className="bg-white mx-4 mt-4 rounded-xl p-4 text-center">
        <p className="text-green-600 font-semibold">
          Total payable amount ₹{price}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Payable at venue ₹{price - advanceAmount}
        </p>

        <p className="text-xs text-gray-400 mt-3">
          By continuing, you accept our{" "}
          <span className="underline cursor-pointer">Terms</span> &{" "}
          <span className="underline cursor-pointer">Refund Policy</span>
        </p>
      </div>

      {/* FIXED CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
        <button
          className="w-full bg-green-500 text-white py-4 rounded-xl text-lg font-semibold"
          onClick={() => alert("Payment gateway comes in Phase-3")}
        >
          Amount to pay ₹{advanceAmount} →
        </button>
      </div>
    </div>
  );
}

export default ConfirmBooking;
