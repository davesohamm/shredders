const recordButton = document.getElementById('recordButton');
const stopButton = document.getElementById('stopButton');
const uploadButton = document.getElementById('uploadButton');
const fileInput = document.getElementById('fileInput');
const audioPlayer = document.getElementById('audioPlayer');
const textOutput = document.getElementById('textOutput');
const submitButton = document.getElementById('submitButton');

let mediaRecorder;
let audioChunks = [];
let audioBlob;

function enableSubmitButton() {
    submitButton.disabled = false;
}

recordButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);
uploadButton.addEventListener('click', uploadFile);
submitButton.addEventListener('click', submitAudio);

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            audioPlayer.src = URL.createObjectURL(audioBlob);
            audioPlayer.controls = true;
            enableSubmitButton();
        };

        mediaRecorder.start();
        recordButton.disabled = true;
        stopButton.disabled = false;
    } catch (error) {
        console.error('Error accessing microphone:', error);
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        recordButton.disabled = false;
        stopButton.disabled = true;
    }
}

function uploadFile() {
    fileInput.click();
}

fileInput.addEventListener('change', handleFileUpload);

function handleFileUpload() {
    const selectedFile = fileInput.files[0];

    if (selectedFile) {
        audioBlob = selectedFile;
        audioPlayer.src = URL.createObjectURL(selectedFile);
        audioPlayer.controls = true;
        enableSubmitButton();
    }
}

function submitAudio() {
    if (audioBlob) {
        const formData = new FormData();
        formData.append('audio_file', audioBlob);

        fetch('/convert-audio', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            textOutput.value = data.text;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

// Copy Button Functionality
const copyButton = document.getElementById("copyButton");
const textBox = document.getElementById("textBox");

copyButton.addEventListener("click", () => {
    textBox.select();
    document.execCommand("copy");
});


