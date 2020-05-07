import TripEventComponent from '../components/page-main/trip-events/trip-event.js';
import TripEventFormComponent from '../components/page-main/trip-event-form/trip-event-form.js';
import {Keycode} from '../helpers/constants.js';
import {render, replace} from "../helpers/render.js";

export default class TripEventController {
  constructor(container, tripEvent, dataChangeHandler) {
    this._container = container;
    this._tripEvent = tripEvent;
    this._dataChangeHandler = dataChangeHandler;

    this._tripEventComponent = null;
    this._tripEventFormComponent = null;

    this._tripEventComponentClickHandler = this._tripEventComponentClickHandler.bind(this);
    this._tripEventFormComponentRollUpHandler = this._tripEventFormComponentRollUpHandler.bind(this);
    this._documentEscKeydownHandler = this._documentEscKeydownHandler.bind(this);
    this._tripEventFormComponentSubmitHandler = this._tripEventFormComponentSubmitHandler.bind(this);
    this._tripEventFormComponentFavoritesButtonClickHandler = this._tripEventFormComponentFavoritesButtonClickHandler.bind(this);
  }

  getParsedStartDate() {
    return this._tripEvent.parsedStartDate;
  }

  getStartDate() {
    return this._tripEvent.start;
  }

  render() {
    this._tripEventComponent = new TripEventComponent(this._tripEvent);
    this._tripEventFormComponent = new TripEventFormComponent(this._tripEvent, this._tripEvent.counter);

    this._tripEventComponent.setClickHandler(this._tripEventComponentClickHandler);
    this._tripEventFormComponent.setButtonRollUpHandler(this._tripEventFormComponentRollUpHandler);
    this._tripEventFormComponent.setSubmitHandler(this._tripEventFormComponentSubmitHandler);
    this._tripEventFormComponent.setFavoritesButtonClickHandler(this._tripEventFormComponentFavoritesButtonClickHandler);

    render(this._container, this._tripEventComponent);

    return this._container;
  }

  _replaceTripEventToEditForm() {
    replace(this._tripEventFormComponent, this._tripEventComponent);
  }

  _replaceEditFormToTripEvent() {
    replace(this._tripEventComponent, this._tripEventFormComponent);
  }

  _tripEventComponentClickHandler() {
    this._replaceTripEventToEditForm();
    document.addEventListener(`keydown`, this._documentEscKeydownHandler);
  }


  _documentEscKeydownHandler(evt) {
    if (evt.key === Keycode.ESCAPE) {
      this._tripEventFormComponentRollUpHandler();
    }
  }

  _tripEventFormComponentRollUpHandler() {
    this._replaceEditFormToTripEvent();
    document.removeEventListener(`keydown`, this._documentEscKeydownHandler);
  }

  _tripEventFormComponentSubmitHandler(evt) {
    evt.preventDefault();
    this._tripEventFormComponentRollUpHandler();
  }

  _tripEventFormComponentFavoritesButtonClickHandler() {
    const updatedTripEvent = Object.assign({}, this._tripEvent, {
      isFavorite: !this._tripEvent.isFavorite,
    });
    this._dataChangeHandler(this._tripEvent, updatedTripEvent);
  }
}
