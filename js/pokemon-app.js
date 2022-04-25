const MAP_SIZE = 500
const NU_CENTER = ol.proj.fromLonLat([-87.6753, 42.056])
const count = 10

// downtown center, uncomment to use downtown instead, or make your own
// const NU_CENTER = ol.proj.fromLonLat([-87.6813, 42.049])
const AUTOMOVE_SPEED = 1
const UPDATE_RATE = 100
/*
 Apps are made out of a header (title/controls) and footer
 and some number of columns
 If its vertical, the columns can become sections in one column
 */

let landmarkCount = 0

let gameState = {
	points: 0,
	captured: [],
	messages: []
}

// Create an interactive map
// Change any of these functions

let map = new InteractiveMap({
	mapCenter: NU_CENTER,

	// Ranges
	ranges: [200, 50, 20, 1], // must be in reverse order

	initializeMap() {
		// A good place to load landmarks
		// this.loadLandmarks("landmarks-all-nu", (landmark) => {
		// 	// Keep this landmark?

		// 	// Keep all landmarks in the set
		// 	return true

		// 	// Only keep this landmark if its a store or amenity, e.g.
		// 	// return landmark.properties.amenity || landmark.properties.store
		// })

		// Create random landmarks
		// You can also use this to create trails or clusters for the user to find

		// Automatically generated 15 random landmarks in NU
		// count = 10
		for (var i = 0; i < count; i++) {
			// make a polar offset (radius, theta) 
			// from the map's center (units are *approximately* meters)
			let position = clonePolarOffset(NU_CENTER, 200*Math.random() + 100, 60*Math.random())
			this.createLandmark({
				pos: position,
				name: words.getRandomWord(),
			})
		}
	},

	update() {
		// Do something each frame
	},

	initializeLandmark: (landmark, isPlayer) => {
		// Add data to any landmark when it's created

		// Any openmap data?
		if (landmark.openMapData) {
			console.log(landmark.openMapData)
			landmark.name = landmark.openMapData.name
		}
		
		// *You* decide how to create a marker
		// These aren't used, but could be examples
		landmark.idNumber = landmarkCount++
		landmark.color = [Math.random(), 1, .5]

		// Give it a random number of points
		landmark.points = Math.floor(Math.random()*10 + 1)
		landmark.captured = false
		return landmark
	}, 

	onEnterRange: (landmark, newLevel, oldLevel, dist) => {
		// What happens when the user enters a range
		// -1 is not in any range

		console.log("enter", landmark.name, newLevel)
		if (newLevel == 2) {

			// Add points to my gamestate
			// gameState.points += landmark.points
			// gameState.points += 1

			

			// Have we captured this?
			if (!gameState.captured.includes(landmark.name)) {
				gameState.captured.push(landmark.name)
				gameState.points += 1
				// Add a message

				gameState.messages[0] = `You successfully hunted a egg in ${landmark.name}`
				landmark.captured = true
			}

			if (gameState.points >= count) {
				gameState.messages[0] = `Congrats! You have captured all the eggs! 😅`
			}

		}
	},

	onExitRange: (landmark, newLevel, oldLevel, dist) => {
		// What happens when the user EXITS a range around a landmark 
		// e.g. (2->1, 0->-1)
		
		console.log("exit", landmark.name, newLevel)
	},
	
	
	featureToStyle: (landmark) => {
		// How should we draw this landmark?
		// Returns an object used to set up the drawing

		if (landmark.isPlayer) {
			return {
				icon: "person_pin_circle",
				noBG: true // skip the background
			}
		}
		
		// Pick out a hue, we can reuse it for foreground and background
		let hue = landmark.points*.1
		iconColor = [hue, 1, .5]

		if (landmark.captured) {
			iconColor = [0, 0, 0]
		}
		return {
			label: landmark.name + "\n" + landmark.distanceToPlayer +"m",
			fontSize: 8,

			// Icons (in icon folder)
			icon: "person_pin_circle",

			// Colors are in HSL (hue, saturation, lightness)
			iconColor: iconColor,
			bgColor: [hue, 1, .2],
			noBG: false // skip the background
		}
	},

	
})

let user = new User(
	{
		uid: 0000,
		displayName: "FakePlayer"
	}
)


window.onload = (event) => {


	const app = new Vue({
		template: `
		<div id="app">
		<header></header>
		<div class="logo">
			<h2>EGG HUNTERS</h2>
		</div>
				<div id="main-columns">

					<div class="info">
						<div class="info-left">
							<div class="panel">
								<user-widget :user="user" />
							</div>
							<div style="color:white">Press timer to begin</div>
							<button style="color:black" v-on:click="countDownTimer()">{{ countDown }} seconds left</button>
						</div>
					
						<div class="main-column" style="flex:1;overflow:scroll;max-height:200px">
							<div style="color:white">
								points: {{gameState.points}}
							</div>
							<div style="color:white">
								captured: {{gameState.captured}}
							</div>
							<div style="color:white">
								Current find: {{gameState.messages}}
							</div>

							
						</div>
					</div>

					<div class="main-column" style="overflow:hidden;width:${MAP_SIZE}px;height:${MAP_SIZE}px">
						<location-widget :map="map" />
					
					</div>

				</div>	
		<footer></footer>
		</div>`,
		
		data() {
			return {
				user: user,
				map: map,
				gameState: gameState,
				countDown: 1000,
				countDownTimer() {
					if (this.countDown > 0) {
						setTimeout(() => {
							this.countDown -= 1
							this.countDownTimer();
						}, 1000)
					}
				}
			}
		},
		watch: {

            timerCount: {
                handler(value) {

                    if (value > 0) {
                        setTimeout(() => {
                            this.timerCount--;
                        }, 1000);
                    }

                },
                immediate: true // This ensures the watcher is triggered upon creation
            }
		},
		// Get all of the intarsia components, plus various others
		components: Object.assign({
			"user-widget": userWidget,
			"location-widget": locationWidget,
		}),

		el: "#app"
	})

};

