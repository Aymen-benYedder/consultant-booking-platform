import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import PropTypes from 'prop-types';

const BookingCalendar = ({ 
  selectedDate = new Date(), 
  onDateChange = () => {}, 
  selectedTime, 
  onTimeChange = () => {} 
}) => {
  const timeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
  ];

  const handleDateChange = (date) => {
    // Reset time selection when date changes
    onTimeChange(null);
    onDateChange(date);
  };

  const isWeekday = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  return (
    <div>
      <div className="calendar-container mb-4">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          minDate={new Date()}
          className="rounded-lg border"
          tileDisabled={({ date }) => !isWeekday(date)}
          locale="en-US"
        />
      </div>

      <div className="mt-4">
        <h4 className="font-medium mb-2">Available Time Slots</h4>
        <div className="grid grid-cols-3 gap-2">
          {timeSlots.map((time) => (
            <button
              key={time}
              onClick={() => onTimeChange(time)}
              className={`p-2 text-sm rounded-lg border transition-colors ${
                selectedTime === time
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'hover:border-sky-600 hover:bg-sky-50'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

BookingCalendar.propTypes = {
  selectedDate: PropTypes.instanceOf(Date),
  onDateChange: PropTypes.func,
  selectedTime: PropTypes.string,
  onTimeChange: PropTypes.func
};

export default BookingCalendar;
