var Constants = {
	VERSION: '1.0.0',
	NOTES: []
};

// Builds notes object for reference against binary values.
var allNotes = [['C'], ['C#','Db'], ['D'], ['D#','Eb'], ['E'],['F'], ['F#','Gb'], ['G'], ['G#','Ab'], ['A'], ['A#','Bb'], ['B']];
var counter = 0;

// All available octaves.
for (let i = -1; i <= 9; i++) {
	allNotes.forEach(function(noteGroup) {
		noteGroup.forEach(function(note) {Constants.NOTES[counter] = note + i});
		counter ++;
	});
}

export default Constants;