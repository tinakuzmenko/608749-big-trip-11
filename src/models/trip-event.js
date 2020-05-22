import moment from 'moment';
import {eventActionsMap} from '../helpers/constants.js';
import {getTimeDifference} from "../helpers/utils.js";

const getCapitalizedString = (string) => {
  if (!string) {
    return string;
  }

  return string[0].toUpperCase() + string.slice(1);
};

export default class TripEventAdapter {
  constructor(data) {
    this.id = data[`id`];
    this.type = getCapitalizedString(data[`type`]);
    this.start = new Date(data[`date_from`]);
    this.end = new Date(data[`date_to`]);
    this.isFavorite = Boolean(data[`is_favorite`]);
    this.basePrice = data[`base_price`];
    this.activeOffers = data[`offers`];

    this.destination = data[`destination`];
    this.destination.photos = data[`destination`].pictures;

    this.timeDiff = getTimeDifference(this.start, this.end);
    this.parsedStartDate = Date.parse(moment(this.start).startOf(`date`));
    this.action = eventActionsMap[this.type];
  }

  static parseTripEvent(data) {
    return new TripEventAdapter(data);
  }

  static parseTripEvents(data) {
    return data.map(TripEventAdapter.parseTripEvent);
  }
}
