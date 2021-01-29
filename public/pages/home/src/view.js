/// <reference path="date-time.js" />

class View {
  constructor() {
    this.recentMeetingsElement = document.getElementById('recent-meetings');
    this.meetingsListElement = undefined;

    this.clockElements = {
      hours: document.getElementById('title-clock-hour'),
      minutes: document.getElementById('title-clock-minute'),
      date: document.getElementById('title-clock-date'),
    };
  }

  /**
   * @param {string} room
   */
  addRecentMeeting(room) {
    if (!this.meetingsListElement) {
      this._createMeetingsList();
    }

    this._addMeetingItem(room);
  }

  startClock() {
    this._updateClock();

    setInterval(this._updateClock.bind(this), 60000);
  }

  _createMeetingsList() {
    const listElement = document.createElement('ul');
    listElement.classList.add('box-time-list');

    this.meetingsListElement = listElement;

    this.recentMeetingsElement.innerHTML = '';
    this.recentMeetingsElement.appendChild(listElement);
  }

  _addMeetingItem(room) {
    const itemElement = document.createElement('li');
    itemElement.innerHTML = room;

    this.meetingsListElement.appendChild(itemElement);
  }

  _updateClock() {
    const date = new Date();

    this.clockElements.hours.innerHTML = DateTime.getFormatedHours(date);
    this.clockElements.minutes.innerHTML = DateTime.getFormatedMinutes(date);
    this.clockElements.date.innerHTML = DateTime.getFormatedDate(date);
  }
}
