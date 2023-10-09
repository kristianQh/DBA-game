#pylint: disable=missing-module-docstring
#pylint: disable=missing-class-docstring
#pylint: disable=missing-function-docstring
import uuid
import os
import logging
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, join_room

log = logging.getLogger('werkzeug') # Level of the Wekzeug logger to error
log.setLevel(logging.ERROR) # ! Only errors are logged

app = Flask(__name__, template_folder="../client/public") # Flask wrapper - TODO: the template folder should be fixed
SECRET_KEY = os.urandom(32) # secret key of 32 bytes
app.config['SECRET_KEY'] = SECRET_KEY
socketio = SocketIO(app) #SocketIO wrapper
socketio.init_app(app, cors_allowed_origins="*") # Accepts requests from clients when hosted on real server

#TODO: '' or "" ?

# class GameLobby:
#     def _init__(self, pin, players, players_ready):
#         self.pin = pin

@app.route('/active_games/<string:gamePin>', methods=['GET'])
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
    return rooms[room] == idx #is socket admin of room?

@socketio.on('connect')
def handle_connect():
    print('User connected')

@socketio.on('disconnect')
def on_admin_disconnect():
    print("User disconnected")
    for _, room in rooms.items():
        if is_admin(request.sid, room):
            del rooms[room]
    emit('leave') #handled by admin

@socketio.on('join')
def on_join(data):
    name = data['name']
    room = data['room']
    join_room(room)
    emit('join', data, room=room)
    player_list[room]['players'].append(name)
    player_list[room]['num_players'] += 1
    print(f'{name} joined {room}')

@socketio.on('exists')
def exsists(data):
    room = data['room']
    emit('exists', room in rooms)

@socketio.on('create')
def on_create(data):
    pin = str(uuid.uuid4())[:8]
    name = data['name']
    if pin in rooms:
        emit('create', 0)
    else:
        join_room(pin)
        rooms[pin] = request.sid # socket's unique id
        player_list[pin] = {'players' : [name], 'players_ready' : 0, 'num_players' : 1}
        print(f'{name} created room: {pin}')
        emit('create', pin)

@socketio.on('ready')
def on_ready(data):
    pin = data['pin']
    player_list[pin]['players_ready'] += 1

if __name__ == '__main__':
    socketio.run(app, debug=True)
    