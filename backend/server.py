from flask import Flask, render_template, request, url_for
from flask_socketio import SocketIO, emit, join_room
import os

app = Flask(__name__) # Flask wrapper
SECRET_KEY = os.urandom(32) # secret key of 32 bytes
app.config['SECRET_KEY'] = SECRET_KEY
socketio = SocketIO(app) #SocketIO wrapper
socketio.init_app(app, cors_allowed_origins="*") # Accepts requests from clients when hosted on real server

#TODO '' or "" ?

@app.route('/') #landing page

def index():
    return render_template('index_html')

@app.route('/admin') #admin page
def admin():
    return render_template('admin.html')

@app.route('/<room>') # page for domain.com/room string
def play(room):
    return render_template('play.html')

# dict pairing room to admin socket id
rooms = {}
def is_admin(id, room):
    return rooms[room] = id #is socket admin of room?

# TODO popup alert?
@socketio.on('connection')
def on_connect(socket):
    print("user connected")

@socketio.on('disconnect')
def on_admin_disconnect():
    print("user disconnected")
    for room in rooms:
        if is_admin(request.sid, room):
            del rooms[room]
    emit('leave') #handled by admin    

@socketio.on('join')
def on_join(data):
    name = data['name']
    room = data['room']
    join_room(room)
    emit('join', data, room=room)
    print(f'{name} joined {room}')

@socketio.on('buzz')
def on_buz(data):
    name = data['name']
    room = data['room']
    emit('buzz', { 'name' : name }, room=room)   
