const renderTypesList = (types) => {
  return types.map((type) => {
    return (
      `<div class="event__type-item">
        <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}">
        <label class="event__type-label  event__type-label--${type.toLowerCase()}" for="event-type-${type}-1">${type}</label>
      </div>`
    );
  })
  .join(`\n`);
};

export {renderTypesList};
