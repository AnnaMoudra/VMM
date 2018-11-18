import { html, render } from './../libraries/lit-html-element/lib/lit-extended.js';
class AnnotationData {
    constructor() {
        this.time = new Date();
        this.name = "";
        this.sqm = "";
    }
}
class Client {
    constructor(server) {
        this.ipAddress = ""; // websocket server IP address
        this.id = null;
        this.ipAddress = server;
        this.socket = io.connect(this.ipAddress);
        this.socket.on('generatedId', this.saveId);
        this.socket.on('disconnect', this.clientDisconnected);
        console.log("Client created");
    }
    saveId(data) {
        this.id = data.Id;
        console.log('Id saved:' + this.id);
    }
    clientDisconnected() {
        //todo
    }
}
class DataHandler {
    constructor() {
        this.annotationData = new AnnotationData();
        this.myImage = '';
        this.client = null;
    }
    getImage() {
        var img = {
            id: this.client.id,
            image: this.myImage
        };
        return JSON.stringify(img);
    }
    getAnnotation() {
        const data = {
            id: this.client.id,
            date: this.annotationData.time,
            name: this.annotationData.name,
            sqm: this.annotationData.sqm
        };
        return JSON.stringify(data);
    }
    clearMessagesData() {
    }
    saveForm() {
    }
    saveName(value) {
        this.annotationData.name = value;
    }
    saveSQM(value) {
        this.annotationData.sqm = value;
    }
    saveTime(value) {
        this.annotationData.time = new Date(value);
    }
    saveAnnotationData() {
        renderer.refreshPage();
    }
    saveImageData(result) {
        this.myImage = result.toString();
        console.log("Saving:" + this.myImage);
        renderer.refreshPage();
    }
}
class Renderer {
    constructor() {
        this.version = "v0.1.1";
        this.client = new Client('http://localhost:8080');
        this.dataHandler = new DataHandler();
        this.dataHandler.client = this.client;
    }
    emitData(msg, data) {
        console.log('sending message');
        this.client.socket.emit(msg, data);
    }
    emitImage(msg, data) {
        console.log('emitting image');
        this.client.socket.emit(msg, data);
    }
    refreshPage() {
        this.renderApi();
    }
    readyToClass() {
    }
    sendData(type) {
        if (type == "img") {
            this.emitImage('getImage', JSON.parse(this.dataHandler.getImage()));
            this.emitData('getInfo', JSON.parse(this.dataHandler.getAnnotation()));
            console.log("sending DATA");
            this.dataHandler.client.socket.on('goodToClass', this.readyToClass);
            return;
        }
        else {
            console.log("sending WHAT");
        }
    }
    renderApi() {
        const main = html `
        <style>

        canvas{
            background-color: #ffaab5;         
            margin-left: 1em;
            margin-right: 1em;
            max-width: 30em;
        }
        .send_btn{
            background-color: #51a04d;         
            margin-left: 1em;
            margin-right: 1em;
            max-width: 8em;
            font-weight: bolder;
            border: none;
            padding: 0.5em;
            color: aliceblue;
            border-radius: 0.5em;
        }
        
        </style>
        <h2>SkyQuality: light pollution classifier</h2>
        <input-annotation></input-annotation>
        <br>
        <input-image></input-image>
        <canvas id="preview", width="200", height="200", style="border:1px solid #d3d3d3;">
        Your browser does not support the HTML5 canvas tag.
        </canvas>
        <button class="send_btn" type="submit" id="send_image" value="Send" on-click="${(e) => {
            e.preventDefault();
            this.sendData('img');
        }}"
        double-click="${(e) => e.preventDefault()}" >Send Image</button>
        <button class="send_btn" type="submit" id="send_class" value="Send" on-click="${(e) => {
            e.preventDefault();
            this.sendData('classify');
        }}"
        double-click="${(e) => e.preventDefault()}" >Classify</button>
        
        `;
        render(main, document.body);
        if (this.dataHandler.myImage == '') {
            console.log(document.getElementById("send_image"));
            document.getElementById("send_image").hidden = true;
        }
        else {
            document.getElementById("send_image").hidden = false;
        }
        if (this.dataHandler.class == false) {
            document.getElementById("send_class").hidden = true;
        }
        else {
            document.getElementById("send_class").hidden = false;
        }
        render(main, document.body);
    }
}
export let renderer = new Renderer();
//# sourceMappingURL=renderer.js.map