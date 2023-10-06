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

app = Flask(__name__, template_folder="../client/public") # Flask wrapper - the template folder should be fixed
SECRET_KEY = os.urandom(32) # secret key of 32 bytes
app.config['SECRET_KEY'] = SECRET_KEY
socketio = SocketIO(app) #SocketIO wrapper
socketio.init_app(app, cors_allowed_origins="*") # Accepts requests from clients when hosted on real server

#TODO: '' or "" ?

# @app.route('/') #landing page
# def index():
#     return render_template('index.html')

@app.route('/admin') #admin page
def admin():
    """return JSON with string data as the value"""
    data = {'data':'This text was fetched using an HTTP call to server on render'}
    return jsonify(data)

@app.route('/active_games/<string:gamePin>', methods=['GET'])
def get_active_games(gamePin):
    if gamePin in player_list:
        data = player_list[gamePin]
        return jsonify(data)
    else:
        return jsonify({"error": "Game not found"}), 404

# @app.route('/<room>') # page for domain.com/room string
# def play(room):
#     return render_template('play.html')

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
    print(player_list)
    print("ROOOM:", room)
    player_list[room].append(name)
    print(f'{name} joined {room}') # log the event on the server

# @socketio.on('buzz')
# def on_buz(data):
#     name = data['name']
#     room = data['room']
#     emit('buzz', { 'name' : name }, room=room)

@socketio.on('exists')
def exsists(data):
    room = data['room']
    print(rooms)
    emit('exists', room in rooms)

@socketio.on('create')
def on_create(data):
    pin = str(uuid.uuid4())[:8]
    name = data['name']
    if pin in rooms:
        emit('create', False)
    else:
        join_room(pin)
        rooms[pin] = request.sid # socket's unique id
        print("he")
        player_list[pin] = [name]
        emit('create', True)
        print(f'{name} created room: {pin}')

# @socketio.on('reset')
# def on_reset(data):
#     room = data['room']
#     res = data['res']
#     if is_admin(request.sid, room):
#         emit('reset', { 'res': res }, room=room)

# @socketio.on('begin')
# def on_begin(data):
#     room = data['room']
#     if is_admin(request.sid, room):
#         emit('begin', room)

# @socketio.on('score')
# def on_score(data):
#     leaderboard = data['leaderboard']
#     room = data['room']
#     if is_admin(request.sid, room):
#         emit('score', { 'leaderboard' : leaderboard }, room=room)

if __name__ == '__main__':
    socketio.run(app, debug=True)