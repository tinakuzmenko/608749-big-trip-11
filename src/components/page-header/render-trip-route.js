import {MONTHS} from '../../helpers/constants.js';
import {getTripEvensDates} from '../trip-events/get-trip-events-dates.js';

const MAXIMUM_CITIES_SHOWN = 3;

const getTripRoute = (tripEvents) => {
  const tripEventsCities = tripEvents.map((tripEvent) => tripEvent.city);
  const uniqueCities = [...new Set(tripEventsCities)].sort();
  const fullRoute = uniqueCities.join(` — `);
  const shortRoute = uniqueCities.slice(0, 1) + ` — … — ` + uniqueCities.slice(uniqueCities.length - 1);

  return tripEventsCities.length <= MAXIMUM_CITIES_SHOWN ? fullRoute : shortRoute;
};

const getTripDates = (startDate, endDate) => {
  const startMonth = startDate.getMonth();
  const startDay = startDate.getDate();

  const endMonth = endDate.getMonth();
  const endDay = endDate.getDate();

  const sameMonthString = `${MONTHS[startMonth]} ${startDay} &nbsp;&mdash;&nbsp; ${endDay}`;
  const differentMonthesString = `${MONTHS[startMonth]} ${startDay} &nbsp;&mdash;&nbsp; ${endMonth} ${endDay}`;

  return startMonth === endMonth ? sameMonthString : differentMonthesString;
};

const renderTripRoute = (tripEventsList) => {
  const title = getTripRoute(tripEventsList);
  const tripDates = getTripEvensDates(tripEventsList).sort((a, b) => a - b);
  const tripDatesString = getTripDates(tripDates[0], tripDates[tripDates.length - 1]);

  return `<div class="trip-info__main">
            <h1 class="trip-info__title">${title}</h1>

            <p class="trip-info__dates">${tripDatesString}</p>
          </div>`;
};

export {renderTripRoute};
