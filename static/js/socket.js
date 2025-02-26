import state from "state"


export default function addSocket() {
  state.socket = new WebSocket(
      "ws://" + document.location.host + "/guest" + random
  );
  state.socket.addEventListener("message", (event) => {
      let msg = event.data.split(":");
      if (msg[0] == "p") {
          let player = players[msg[1]];
          if (!player) player = players[msg[1]] = new Player();
          let cmd = msg[2];
          if (cmd == "name") {
              player.name = msg[3]
              if ("guest" + random == msg[3])
                  client_player = player
          }
          else if (cmd == "pos") {
              [x, y] = msg[3].split(",");
              player.x = x;
              player.y = y;
          } else if (cmd == "vec") {
              [x, y] = msg[3].split(",");
              player.state = x != 0 || y != 0;
              if (x > 0) player.dir = 1;
              if (x < 0) player.dir = -1;
          } else if (cmd == "use") {
              player.use = new Animation(6);
          } else if (cmd == "hp") {
              player.hp = parseInt(msg[3]);
              if (!+player.hp) delete players[msg[1]];
          } else if (cmd == "new") {
              [x, y] = msg[3].split(",");
              player.x = x;
              player.y = y;
              player.emerge = new Animation(16);
          }
      } else if (msg[0] == "s") {
          if (msg[2] == "del")
              delete shells[msg[1]]
          else {
              let shell = shells[msg[1]]
              const [x, y] = msg[3].split(",");
              if (!shell) shell = shells[msg[1]] = {}
              shell.x = x
              shell.y = y
          }
      }
      console.log(event.data);
      // render();
  });
}
