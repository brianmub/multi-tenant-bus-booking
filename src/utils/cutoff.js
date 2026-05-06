/**
 * Cutoff Logic for Bus Bookings
 * 
 * Statuses:
 * - OPEN: Booking is available (> closingSoonMins)
 * - CLOSING_SOON: Booking closes soon (< closingSoonMins and > bookingCutoffMins)
 * - CLOSED: Booking is closed (< bookingCutoffMins)
 */

export function getCutoffStatus(departureTimeStr, config = {}) {
  const {
    bookingCutoffMins = 30,
    closingSoonMins = 60,
  } = config;

  // departureTimeStr is e.g. "08:30 AM"
  // We assume today for the purpose of the mock
  const now = new Date();
  const [time, modifier] = departureTimeStr.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
  
  const departureDate = new Date(now);
  departureDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

  const diffMs = departureDate - now;
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins <= bookingCutoffMins) {
    return { 
      status: "CLOSED", 
      label: "CLOSED", 
      color: "#ef4444", 
      bg: "#fee2e2",
      minsLeft: diffMins 
    };
  }

  if (diffMins <= closingSoonMins) {
    return { 
      status: "CLOSING_SOON", 
      label: `CLOSING IN ${diffMins} MINS`, 
      color: "#f59e0b", 
      bg: "#fef3c7",
      minsLeft: diffMins 
    };
  }

  return { 
    status: "OPEN", 
    label: "OPEN", 
    color: "#10b981", 
    bg: "#dcfce7",
    minsLeft: diffMins 
  };
}
