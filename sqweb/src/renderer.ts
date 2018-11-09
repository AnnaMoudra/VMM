import {html, render} from './../libraries/lit-html-element/lib/lit-extended.js';

declare global {
    const io: any;
}

declare namespace io {}

class AnnotationData{
    time: Date;
    sqm: number;

}

class Client{
    ipAddress: string = ""; // websocket server IP address
    socket: any; //io.Socket;

    constructor(server: string){
        this.ipAddress = server;
        this.socket = io.connect(this.ipAddress);
        this.socket.on('disconnect', this.clientDisconnected);
        console.log("Client created");
    }

    clientDisconnected(){
        //todo
    }
}

class DataHandler{
    annotationData: AnnotationData = null;
    myImage: string = '';
    myCanvas: HTMLImageElement;

    constructor(){
    }


    getImage(){
        return ""
    }

    getAnnotation(){
        const data = {
            'type': "annotation"
        };

        return "";
    }

    clearMessagesData(){

    }

    clearForm(form, canvas){

    }

    saveForm(form, canvas){

    }

    saveAnnotationData(){
        renderer.refreshPage();
    }

    saveImageData(){
        renderer.refreshPage();
    }

}

class Renderer{
    dataHandler: DataHandler;
    client: Client;
    version: string = "v0.1.1";

    constructor(){
        this.client = new Client('http://localhost:8080');
        this.dataHandler = new DataHandler();
    }


    emitData(msg: string, data:JSON){
        console.log('sending message')
        this.client.socket.emit(msg, data);
    }

    emitImage(msg: string, data:JSON){
        console.log('sending image')
        this.client.socket.emit(msg, data);
    }

    refreshPage(){
        this.renderApi();
    }

    sendData(type){
        if(type == "img"){
            this.emitImage('image', JSON.parse(this.dataHandler.getImage()));
            console.log("sending image")
            return;
        }
        else if(type == "command"){
            console.log("sending command")
        }
        else{
            console.log("annotation")
            this.emitData('annotation', JSON.parse(this.dataHandler.getAnnotation()));

        }
    }

    renderApi(){
        const main = html`
        <style>

        
        </style>
        <h2>Night Sky classifier</h2>
        <br>
        <input-image></input-image>
        <p>Canvas:</p>
        <canvas id="preview", width="500", height="500", style="border:1px solid #d3d3d3;">
        Your browser does not support the HTML5 canvas tag.
        </canvas>
        
        `;

        render(main, document.body);
    }

    /* 2 frames with icons*/
    renderNotify(){
        const messages = html`
        <style>
         *{
            margin: 0;
            padding: 0;
            font-family: "Gill Sans", sans-serif;
            outline: none;
            background-color: #fdfffb;
           
        }
        .main-body{
            position: fixed;
            margin-top: 2em;
            margin-left: 8em;
            padding-top: 0.2em;
            padding-left: 3em;
            width: 100%;
            height: 100%;
        }
        h2 { position: fixed; margin-top: 0.2em;}
        
        </style>
        <header-panel></header-panel>
        <side-bar></side-bar>
        <div class="main-body">
        <h2>NotifyMessages</h2>
        <br>
        <data-preview></data-preview>
        <frame-preview></frame-preview>
        <send-button></send-button>
        <br>
        </div>`;
        render(messages, document.body);
    }
}
export let renderer = new Renderer();