window.onload = () => {

  function redirectWithRoomId(element) {
    element.addEventListener('click', (event) => {
      event.preventDefault();

      const room = prompt('Room name');

      if (!room) {
        alert('Invalid room');

        return;
      }

      window.open('/pages/room/?room=' + room);
    });
  }

  const join = document.getElementById('join')
  const newMeeting = document.getElementById('new-meeting')

  redirectWithRoomId(join)
  redirectWithRoomId(newMeeting)
}
