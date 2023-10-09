import { io } from "socket.io-client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const socket = io.connect('http://localhost:5000');

function Game() {

  const { gamePin } = useParams();

  return (
    <div>Game
      <form>
        <input type="text" name="link" />
        <input type="button" value="Submit" />
      </form>

    </div>

  )
}

export default Game