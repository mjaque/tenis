/**
 *   Clases y métodos para jugar al tenis.
 *   @author Miguel Jaque <mjaque@migueljaque.com>
 *   @license GPL-3.0-or-later
 */

'use strict'

/**
	Clase controladora del juego.
**/
class Tenis {
  /**
  	Constructor de la clase Tenis.
  	Inicializa la vista y el modelo y llama al método iniciar al cargar la página.
  **/
  constructor() {
    //Constantes
		this.HUMANO = 0
		this.IA = 1
    this.ARRIBA = Symbol()
    this.ABAJO = Symbol()

    //Inicialización de atributos
    this.modelo = new Modelo()
    this.vista = null //La creamos cuando la página esté cargada
    this.animador = null

    //Control de Eventos
    window.onkeydown = this.pulsarTecla.bind(this)
    window.onkeyup = this.soltarTecla.bind(this)
    window.onkeypress = this.teclear.bind(this)
    window.onload = this.iniciar.bind(this)
  }
  /**
  	Inicia el juego.
  **/
  iniciar() {
    let canvas = document.getElementById('canvas')
    this.vista = new Vista(canvas, this.modelo.getCampo())
    this.redibujar()
    this.vista.dibujarInicio()
  }
	/**
		Dibuja todos los elementos en su estado actual.
	**/
  redibujar() {
    this.vista.dibujar(
      this.modelo.getCampo(),
      this.modelo.getPelota(),
      this.modelo.getJugadores())
  }
  /**
  	Inicia el animador
  **/
  empezarJuego() {
    this.animador = setInterval(this.actualizar.bind(this), 1000 / 60)
  }
	/**
		Gestiona la pulsación de teclas para establecer la dirección de movimiento del jugador.
		@param {Event} Evento de pulsación.
	**/
  pulsarTecla(evento) {
    let humano = this.modelo.getJugadores()[this.HUMANO]

    if (evento.keyCode == 87) // Tecla W
      humano.direccion = this.ARRIBA
    if (evento.keyCode == 83) // Tecla S
      humano.direccion = this.ABAJO

    this.modelo.setJugador(humano, 0)
  }
	/**
		Gestiona la liberación de teclas para detener el movimiento del jugador.
		@param {Event} Evento de pulsación.
	**/
  soltarTecla(evento) {
    if (evento.keyCode == 87 || evento.keyCode == 83) { // Tecla W o S
      let humano = this.modelo.getJugadores()[this.HUMANO]
      humano.direccion = null
      this.modelo.setJugador(humano, 0)
    }
  }
  /**
  	Detecta la pulsación completa de una tecla.
  	Si es el espacio, inicia el juego y quita la atención al evento.
  	@param {Event} Evento de pulsación de tecla.
  **/
  teclear(evento) {
    if (evento.which == 32) { //Espacio
      this.empezarJuego()
      window.onkeypress = null
      evento.preventDefault()
    }
  }
	/**
		Método que utiliza el animador (intervalo) para actualizar las posiciones.
		Se detectan las colisiones y se actualiza la posición de la pelota.
	**/
  actualizar() {
    this.detectarColisiones()

    this.actualizarJugadores()

    //Actualizamos la posición de la pelota
    let pelota = this.modelo.getPelota()
    pelota.posicion[0] += pelota.velocidad * Math.cos(pelota.direccion)
    pelota.posicion[1] += pelota.velocidad * Math.sin(pelota.direccion)
    this.modelo.setPelota(pelota)

    this.redibujar()
  }
	/**
	Se detectan las colisiones de los jugadores con la pelota, las colisiones
	de la pelota con los bordes y si es el caso, se detecta el punto.
	*/
  detectarColisiones() {
    let pelota = this.modelo.getPelota()
    let campo = this.modelo.getCampo()
    let humano = Object.assign({}, this.modelo.getJugadores()[this.HUMANO], this.vista.getJugadores()[this.HUMANO])
    let ia = Object.assign({}, this.modelo.getJugadores()[this.IA], this.vista.getJugadores()[this.IA])

    //Comprobamos si la pelota choca con el humano.
    if (pelota.posicion[0] > campo.margen && pelota.posicion[0] < campo.margen + humano.anchura)
      if (pelota.posicion[1] > humano.posicion[1] - humano.altura / 2 && pelota.posicion[1] < humano.posicion[1] + humano.altura) {
        var angulo = (humano.posicion[1] - pelota.posicion[1]) / (humano.altura / 2)
        pelota.direccion += Math.PI - Math.PI / 2 * 0.8 * angulo
        pelota.posicion[0] = humano.posicion[0] + humano.anchura
      }

    //Comprobamos si choca con la ia
    if (pelota.posicion[0] > campo.anchura - campo.margen && pelota.posicion[0] < campo.anchura + ia.anchura)
      if (pelota.posicion[1] > ia.posicion[1] - ia.altura / 2 && pelota.posicion[1] < ia.posicion[1] + ia.altura) {
        var angulo = ((ia.posicion[1] + ia.altura / 2) - pelota.posicion[1]) / (ia.anchura / 2)
        pelota.direccion += Math.PI - Math.PI / 2 * 0.8 * angulo
        pelota.posicion[0] = ia.posicion[0]
      }

    //Comprobamos las colisiones con los bordes
    if (pelota.posicion[1] <= 0) {
      pelota.posicion[1] = 0
      pelota.direccion *= -1
    }

    if (pelota.posicion[1] >= campo.altura) {
      pelota.posicion[1] = campo.altura
      pelota.direccion *= -1
    }

  }
	/**
		Método utilizado por el animador para actualizar la posición de los jugadores.
	**/
  actualizarJugadores() {
    let humano = this.modelo.getJugadores()[this.HUMANO]
    let ia = this.modelo.getJugadores()[this.IA]
    let pelota = this.modelo.getPelota()

    switch (humano.direccion) {
      case this.ARRIBA:
        humano.posicion[1] -= humano.velocidad
        break
      case this.ABAJO:
        humano.posicion[1] += humano.velocidad
        break
    }

    //Actualizamos la posición de la IA
    if (pelota.posicion[1] > (ia.posicion[1]))
      ia.posicion[1] += ia.velocidad
    if (pelota.posicion[1] < (ia.posicion[1]))
      ia.posicion[1] -= ia.velocidad

    //Comprobamos si ha habido punto
    //Controlamos el final del juego
    if (pelota.posicion[0] <= 0)
      this.ganar(this.IA)
    if (pelota.posicion[0] >= this.modelo.getCampo().anchura)
      this.ganar(this.HUMANO)
  }
	/**
		Informa del ganador de la partida.
	**/
	ganar(ganador){
		clearInterval(this.animador)
		switch(ganador){
			case this.HUMANO:
				alert('¡¡Es imposible que me hayas ganado!!\n¡¡TRAMPOSO!! 😡😡😡')
				break
			case this.IA:
				alert('Te he ganado... como siempre 😏')
				break
		}
	}
}

/**
	Clase de visualización.
**/
class Vista {
  /**
  	Constructor de la clase Vista.
  	Crea el campo y los objetos del juego en sus posiciones iniciales.
		@param {HTMLCanvas} canvas Objeto HTMLCanvas en el que se mostrará el juego.
		@param {Object} campo Objeto con los datos del campo de juego.
  **/
  constructor(canvas, campo) {
    this.canvas = canvas //El área de dibujo
    this.pelota = {
      color: 'yellow',
      radio: 5
    }
    //Construimos los jugadores
    let humano = {
      color: 'white',
      anchura: 10, //pixels
      altura: 50 //pixels
    }
    let ia = {
      color: 'black',
      anchura: 10, //pixels
      altura: 50 //pixels
    }
    this.jugadores = [humano, ia]

    //Inicializamos el campo.
    this.canvas.width = campo.anchura
    this.canvas.height = campo.altura
    this.canvas.ctx = canvas.getContext('2d')
  }
	/**
		Devuelve los jugadores de la vista.
		@return {Array} Array con los dos jugadores, humano e IA.
	**/
  getJugadores() {
    return this.jugadores
  }
  /**
  	Dibuja el campo en la situación inicial de saque.
  **/
  dibujarInicio() {
    //Dibujamos el mensaje Inicial
    this.canvas.ctx.fillStyle = 'yellow'
    this.canvas.ctx.font = "30px Comic Sans MS"
    this.canvas.ctx.textAlign = "center"
    this.canvas.ctx.fillText("Pulsa SPACE para empezar", this.canvas.width / 2, this.canvas.height / 2 - 50)
  }
  /**
  	Dibuja el campo en la situación actual.
  	Dibuja el campo, la pelota, la red, los límites y los jugadores.
  **/
  dibujar(campo, pelota, jugadores) {
    if (this.canvas == null) return //Seguridad

    //Borramos
    this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.dibujarCampo(campo)
    this.dibujarJugadores(jugadores)
    this.dibujarPelota(pelota)
  }
  /**
  	Dibuja el campo de juego.
  **/
  dibujarCampo(campo) {
    this.canvas.ctx.beginPath()

    //Línea de red
    this.canvas.ctx.strokeStyle = 'white'
    this.canvas.ctx.lineWidth = 6
    this.canvas.ctx.moveTo(campo.anchura / 2 - 5, 0)
    this.canvas.ctx.lineTo(campo.anchura / 2 - 5, campo.altura)
    this.canvas.ctx.stroke()

    /*
    //Línea de centro
    canvas.ctx.lineWidth = 1
    canvas.ctx.moveTo(WIDTH/4, HEIGHT/2)
    canvas.ctx.lineTo(3*WIDTH/4, HEIGHT/2)

    //Líneas de saque
    canvas.ctx.moveTo(WIDTH/4, 0)
    canvas.ctx.lineTo(WIDTH/4, HEIGHT)
    canvas.ctx.moveTo(3*WIDTH/4, 0)
    canvas.ctx.lineTo(3*WIDTH/4, HEIGHT)

    //Líneas de banda
    canvas.ctx.moveTo(0, HEIGHT/8)
    canvas.ctx.lineTo(WIDTH, HEIGHT/8)
    canvas.ctx.moveTo(0, 7*HEIGHT/8)
    canvas.ctx.lineTo(WIDTH, 7*HEIGHT/8)

    canvas.ctx.stroke()
    */
  }
  /**
  	Dibuja la pelota.
  **/
  dibujarPelota(pelota) {
    this.canvas.ctx.fillStyle = this.pelota.color
    this.canvas.ctx.beginPath()
    this.canvas.ctx.arc( //cx, cy, radio, start_angle, end_angle
      pelota.posicion[0] - this.pelota.radio,
      pelota.posicion[1], this.pelota.radio, 0, 2 * Math.PI)
    this.canvas.ctx.fill()
  }
  /**
  	Dibuja los Jugadores
  **/
  dibujarJugadores(jugadores) {
    for (let i = 0; i < 2; i++) {
      this.canvas.ctx.fillStyle = this.jugadores[i].color
      this.canvas.ctx.fillRect(
        jugadores[i].posicion[0],
        jugadores[i].posicion[1] - this.jugadores[i].altura / 2,
        this.jugadores[i].anchura,
        this.jugadores[i].altura)
      this.canvas.ctx.fill()
    }
  }
}

/**
	Clase de soporte del modelo de datos.
**/
class Modelo {
  constructor() {
    this.campo = {
      //dimensiones del campo de tenis en pixels:
      anchura: 1000,
      altura: 600,
      margen: 25
    }
    //Inicializamos la pelota en el medio, en dirección izquierda
    this.pelota = {
      posicion: [this.campo.anchura / 2, this.campo.altura / 2],
      velocidad: 5,
      direccion: Math.PI
    }

    //Jugador Humano
    let humano = {
      direccion: null,
      posicion: [0 + this.campo.margen, this.campo.altura / 2], //Izquierda y en el medio
      velocidad: 3
    }

    //Jugador IA
    let ia = {
      direccion: null,
      posicion: [this.campo.anchura - this.campo.margen, this.campo.altura / 2], //Derecha y en el medio
      velocidad: 5
    }

    this.jugadores = [humano, ia]
  }
  getCampo() {
    return this.campo
  }
  getPelota() {
    return this.pelota
  }
  getJugadores() {
    return this.jugadores
  }
  setPelota(pelota) {
    this.pelota = pelota
  }
  setJugador(jugador, indice) {
    this.jugadores[indice] = jugador
  }
}

var app = new Tenis()
