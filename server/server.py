# pylint: disable=missing-module-docstring
# pylint: disable=missing-class-docstring
# pylint: disable=missing-function-docstring
import uuid
import os
import logging
import scrapper
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, join_room

log = logging.getLogger("werkzeug")  # Wekzeug logger
log.setLevel(logging.ERROR)  # ! Only errors are logged

app = Flask(
    __name__, template_folder="../client/public"
)  # Flask wrapper - TODO: the template folder should be fixed
SECRET_KEY = os.urandom(32)  # secret key of 32 bytes
app.config["SECRET_KEY"] = SECRET_KEY
socketio = SocketIO(app)  # SocketIO wrapper
socketio.init_app(
    app, cors_allowed_origins="*"
)  # Accepts requests from clients when hosted on real server

# TODO: '' or "" ?
# class GameLobby:
#     def _init__(self, pin, players, players_ready):
#         self.pin = pin


# TODO gamePin is simply just handled as a string?
@app.route("/active_games/<string:gamePin>", methods=["GET"])
def get_active_games(gamePin):
    if gamePin in player_list:
        data = player_list[gamePin]
        return jsonify(data)
    else:
        return jsonify({"error": "Game not found"}), 404


# dict pairing room to admin socket id
rooms = {}
player_list = {}


def is_admin(idx, room):
    return rooms[room] == idx  # is socket admin of room?


@socketio.on("connect")
def on_connect():
    print("User connected", request.sid)


@socketio.on("disconnect")
def on_admin_disconnect():
    print("User disconnected")
    for _, room in rooms.items():
        if is_admin(request.sid, room):
            del rooms[room]
    emit("leave")  # handled by admin


@socketio.on("join")
def on_join(data):
    name = data["name"]
    pin = data["pin"]
    join_room(pin)
    player_list[pin]["players"].append((name, request.sid))
    player_list[pin]["num_players"] += 1
    print(f"{name} joined {pin}")
    emit("update_playerdata", player_list[pin], room=pin)


@socketio.on("exists")
def exsists(data):
    room = data["pin"]
    emit("exists", room in rooms)


@socketio.on("create")
def on_create(data):
    pin = str(uuid.uuid4())[:8]
    name = data["name"]
    if pin in rooms:
        emit("create", 0)
    else:
        join_room(pin)
        rooms[pin] = request.sid  # socket's unique id
        player_list[pin] = {
            "players": [(name, request.sid)],
            "players_ready": 0,
            "num_players": 1,
            "current_player_idx" : 0,
        }
        print(f"{name} created room: {pin}")
        emit("create", pin)
        # No need for broadcast, creating player is only current player
        emit("update_playerdata", player_list[pin])


@socketio.on("ready")
def on_ready(data):
    pin = data["pin"]
    player_list[pin]["players_ready"] += 1
    emit("update_playerdata", player_list[pin], room=pin)


@socketio.on("scrape")
def on_scrape(data):
    dba_url = data["url"]
    dba_scrapper = scrapper.DBAScrapper()
    data = dba_scrapper.scrape_article(dba_url)
    emit("scraped_data", data)


@socketio.on("game_starting")
def on_start(data):
    pin = data["pin"]
    current_player_idx = player_list[pin]["current_player_idx"]
    current_player_sid = player_list[pin]["players"][current_player_idx][1]
    player_list[pin]["players_ready"] = 0
    print("Current player sid ", current_player_sid)
    print("Player sid", request.sid)
    emit("set_client_sid", {"player_sid": request.sid})
    emit(
        "player_turn",
        {"current_player_sid": current_player_sid, "game_pin" : pin},
    room=pin)


@socketio.on("confirm_price")
def confirm_price(data):
    pin = data["pin"]
    player_list[pin]["players_ready"] += 1
    if player_list[pin]["players_ready"] == len(player_list[pin]["players"]):
        current_player_idx = player_list[pin]["current_player_idx"] + 1
        current_player_sid = player_list[pin]["players"][current_player_idx][1]
        # print("Current player sid ", current_player_sid)
        # print("Player sid", request.sid)
        emit(
            "player_turn",
            {
                "current_player_sid": current_player_sid, "game_pin": pin},
        room=pin)

if __name__ == "__main__":
    socketio.run(app)
