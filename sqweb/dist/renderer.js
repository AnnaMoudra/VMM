import { html, render } from './../libraries/lit-html-element/lib/lit-extended.js';
class AnnotationData {
    constructor() {
        this.time = new Date();
        this.name = "";
        this.sqm = "";
    }
}
/**
 * Client  - socket.io endpoint
 **/
export class Client {
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
        this.id = data.id;
        renderer.ID = data.id;
        console.log('Id saved:' + this.id);
    }
    clientDisconnected() {
        //todo
    }
}
/**
 * DataHandler - preserves user input
 **/
class DataHandler {
    constructor() {
        this.annotationData = new AnnotationData();
        this.myImage = '';
        this.class = false;
    }
    getImage() {
        console.log("sending id: ", renderer.ID);
        var img = {
            id: renderer.ID,
            image: this.myImage
        };
        return JSON.stringify(img);
    }
    getAnnotation() {
        const data = {
            id: renderer.ID,
            date: this.annotationData.time,
            name: this.annotationData.name,
            sqm: this.annotationData.sqm
        };
        return JSON.stringify(data);
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
    saveImageData(result) {
        this.myImage = result.toString();
        console.log("Saving:" + this.myImage);
        renderer.refreshPage();
    }
}
/**
 * Renderer singleton handles application processes
 **/
class Renderer {
    constructor() {
        this.version = "v0.0.1";
        this.ID = 0;
        this.client = new Client('http://localhost:8080');
        this.dataHandler = new DataHandler();
    }
    /**
     * Emit Annotation data to server
     **/
    emitData(msg, data) {
        console.log('sending message');
        this.client.socket.emit(msg, data);
    }
    /**
     * Emit Image data to server
     **/
    emitImage(msg, data) {
        console.log('emitting image');
        this.client.socket.emit(msg, data);
    }
    /**
     * Re-render InputPage with changes.
     **/
    refreshPage() {
        this.renderApi();
    }
    /**
     * Switch classification ready state to true and re-render page with Classify btn
     **/
    readyToClass() {
        renderer.dataHandler.class = true;
        renderer.refreshPage();
    }
    /**
     * Handle signals from Users input
     **/
    sendData(type) {
        if (type == "img") {
            this.emitImage('getImage', JSON.parse(this.dataHandler.getImage()));
            this.emitData('getInfo', JSON.parse(this.dataHandler.getAnnotation()));
            console.log("Sending image and info to server.");
            this.client.socket.on('goodToClass', this.readyToClass);
            return;
        }
        else if (type == "classify") {
            const data = {
                id: renderer.ID,
            };
            this.client.socket.emit('runClassification', data);
            //TODO
            //redirect to waiting page!
            this.renderWaiting();
            this.client.socket.on('results', this.handleResults);
        }
        else {
            console.log("Not sure what to send :o !");
        }
    }
    /**
     * RenderInput GUI
     **/
    renderApi() {
        const main = html `
        <style>
        body{
            background-image: url('../bg_img/bg90m.png');
            font-family: Helvetica;
        }

        h2{
            margin-top: 1em;
            margin-left: 1em;
            margin-right: 1em;
            font-family: Helvetica;
            color: rgba(23,23,26,0.89);
        }
        canvas{
            background-color: rgba(255,41,103,0.26);         
            margin-left: 1em;
            margin-right: 1em;
            max-width: 30em;
            border-radius: 0.02em;
        }
        .send_btn{
            background-color: #51a04d;         
            margin-left: 1em;
            margin-right: 1em;
            max-width: 8em;
            font-weight: bolder;
            border: none;
            padding: 0.5em;
            color: #f2ffeb;
            border-radius: 0.5em;
        }
        
        .class_btn{
            background-color: #d88a18;         
            margin-left: 1em;
            margin-right: 1em;
            max-width: 8em;
            font-weight: bolder;
            border: none;
            padding: 0.5em;
            color: #fffdd5;
            border-radius: 0.5em;
        }
        
        </style>
        <h2>SkyQuality: light pollution classifier</h2>
        <input-annotation></input-annotation>
        <br>
        <input-image></input-image>
        <br>
        <canvas id="preview", width="300", height="300", style="border:1px solid #d3d3d3;">
        Your browser does not support the HTML5 canvas tag.
        </canvas>
        <button class="send_btn" type="submit" id="send_image" value="Send" on-click="${(e) => {
            e.preventDefault();
            this.sendData('img');
        }}"
        double-click="${(e) => e.preventDefault()}" >Send Image</button>
        
        <button class="class_btn" type="submit" id="send_class" value="Send" on-click="${(e) => {
            e.preventDefault();
            this.sendData('classify');
        }}"
        double-click="${(e) => {
            e.preventDefault();
        }}" >Classify</button>
        
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
    /**
     * Render Waiting Page
     **/
    renderWaiting() {
        const main = html `
        <style>
        body{
            background-image: url('../bg_img/bg90m.png');
            font-family: Helvetica;
        }

        h2{
            margin-top: 1em;
            margin-left: 1em;
            margin-right: 1em;
            color: rgba(23,23,26,0.89);
        }
        
        h3{
            margin-top: 3em;
            margin-left: 3em;
            margin-right: 1em;
            color: rgb(241,105,83);
        }
        
        body{
            background-color: #deecff;
        }
        
        </style>
        
        <h2>SkyQuality: light pollution classifier</h2>
        <h3>Waiting for results...</h3>
       
        `;
        render(main, document.body);
    }
    /**
     * Render results of classification
     **/
    renderResults() {
    }
}
export let renderer = new Renderer();
//# sourceMappingURL=renderer.js.map