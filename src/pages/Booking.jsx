import { useState } from "react";
import { useNavigate } from "react-router-dom";

const slots = [
  "6 AM","7 AM","8 AM","9 AM","10 AM","11 AM",
  "12 PM","1 PM","2 PM","3 PM","4 PM","5 PM",
  "6 PM","7 PM","8 PM","9 PM","10 PM"
];

const sports = ["Cricket", "Football", "Pickleball"];

function Booking() {
  const navigate = useNavigate();

  /* DATE SETUP */
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (date) =>
    date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

  const [selectedDate, setSelectedDate] = useState(formatDate(today));
  const [selectedSport, setSelectedSport] = useState(sports[0]);
  const [selectedCourt, setSelectedCourt] = useState("Court 1");

  const [startIndex, setStartIndex] = useState(null);
  const [endIndex, setEndIndex] = useState(null);

  /* SLOT CLICK LOGIC (FIXED) */
  function handleSlotClick(index) {
    if (startIndex === null) {
      setStartIndex(index);
      setEndIndex(index);
      return;
    }

    if (index < startIndex) {
      setStartIndex(index);
      setEndIndex(index);
      return;
    }

    setEndIndex(index);
  }

  function resetSlots() {
    setStartIndex(null);
    setEndIndex(null);
  }

  const duration =
    startIndex !== null && endIndex !== null
      ? endIndex - startIndex + 1
      : 0;

  function getPrice() {
    if (!duration) return 0;
    return selectedSport === "Pickleball"
      ? duration * 500
      : duration * 800;
  }

  const price = getPrice();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">

      <h1 className="text-2xl font-bold mb-4">Book Your Slot</h1>

      {/* DATE SELECTOR */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setSelectedDate(formatDate(today))}
          className={`px-4 py-2 rounded ${
            selectedDate === formatDate(today)
              ? "bg-green-500"
              : "bg-slate-800"
          }`}
        >
          Today
        </button>

        <button
          onClick={() => setSelectedDate(formatDate(tomorrow))}
          className={`px-4 py-2 rounded ${
            selectedDate === formatDate(tomorrow)
              ? "bg-green-500"
              : "bg-slate-800"
          }`}
        >
          Tomorrow
        </button>

        <input
          type="date"
          onChange={(e) =>
            setSelectedDate(formatDate(new Date(e.target.value)))
          }
          className="bg-slate-800 px-3 py-2 rounded"
        />
      </div>

      {/* SPORTS */}
      <div className="flex gap-3 mb-4 flex-wrap">
        {sports.map((sport) => (
          <button
            key={sport}
            onClick={() => {
              setSelectedSport(sport);
              resetSlots();
            }}
            className={`px-4 py-2 rounded ${
              selectedSport === sport
                ? "bg-blue-500"
                : "bg-slate-800"
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* COURTS */}
      <div className="flex gap-3 mb-6">
        {["Court 1", "Court 2"].map((court) => (
          <button
            key={court}
            onClick={() => {
              setSelectedCourt(court);
              resetSlots();
            }}
            className={`px-4 py-2 rounded ${
              selectedCourt === court
                ? "bg-purple-500"
                : "bg-slate-800"
            }`}
          >
            {court}
          </button>
        ))}
      </div>

      {/* TIME SLOTS */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-6">
        {slots.map((slot, index) => {
          const isActive =
            startIndex !== null &&
            index >= startIndex &&
            index <= endIndex;

          return (
            <div
              key={slot}
              onClick={() => handleSlotClick(index)}
              className={`py-3 text-center rounded cursor-pointer select-none
                ${
                  isActive
                    ? "bg-green-500"
                    : "bg-slate-800 hover:bg-slate-700"
                }
              `}
            >
              {slot}
            </div>
          );
        })}
      </div>

      {/* SUMMARY */}
      {duration > 0 && (
        <div className="bg-slate-900 p-4 rounded-xl mb-4 space-y-1">
          <p><b>Sport:</b> {selectedSport}</p>
          <p><b>Court:</b> {selectedCourt}</p>
          <p><b>Date:</b> {selectedDate}</p>
          <p>
            <b>Time:</b>{" "}
            {slots[startIndex]} – {slots[endIndex]}
          </p>
          <p><b>Duration:</b> {duration} hour(s)</p>
          <p className="text-xl font-bold text-green-400">
            ₹{price}
          </p>
        </div>
      )}

      {/* PROCEED */}
      {duration > 0 && (
        <button
          onClick={() =>
            navigate("/confirm", {
              state: {
                sport: selectedSport,
                court: selectedCourt,
                date: selectedDate,
                startTime: slots[startIndex],
                endTime: slots[endIndex],
                duration,
                price
              }
            })
          }
          className="w-full bg-green-500 py-3 rounded-xl text-lg"
        >
          Proceed to Book
        </button>
      )}
    </div>
  );
}

export default Booking;
