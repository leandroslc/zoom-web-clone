/// <reference path="view.js" />

function main() {

  const view = new View();

  function redirectWithRoomId(element) {
    element.addEventListener('click', (event) => {
      event.preventDefault();

      const room = prompt('Room name');

      if (!room) {
        alert('Invalid room');

        return;
      }

      view.addRecentMeeting(room);

      window.open('/pages/room/?room=' + room);
    });
  }

  const join = document.getElementById('join');
  const newMeeting = document.getElementById('new-meeting');

  redirectWithRoomId(join);
  redirectWithRoomId(newMeeting);

  view.startClock();
}

window.onload = main;
