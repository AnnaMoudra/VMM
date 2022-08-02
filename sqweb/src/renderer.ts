import {html, render} from './../libraries/lit-html-element/lib/lit-extended.js';
import {LitHTMLElement, customElement,  ref} from  './../libraries/lit-html-element/LitHTMLElement.js';
//import {io} from "./renderer";
declare global {
    const io: any;
}

declare namespace io {}

class AnnotationData{
    time: Date = new Date();
    name: string = "";
    sqm: string = "";
}

class ResultData{
    order: number = 0;
    count: number = 0;
    pictures: [];
}

/**
 * Client  - socket.io endpoint
 **/
export class Client{
    ipAddress: string = ""; // websocket server IP address
    socket: any; //io.Socket;
    id: number = null;

    constructor(server: string){
        this.ipAddress = server;
        this.socket = io.connect(this.ipAddress);
        this.socket.on('generatedId', this.saveId)
        this.socket.on('disconnect', this.clientDisconnected);
        console.log("Client created");
    }

    saveId(data){
        this.id = data.id;
        renderer.ID = data.id;
        console.log('Id saved:'+this.id);
    }

    clientDisconnected(){
        //todo
    }
}

/**
 * DataHandler - preserves user input
 **/
class DataHandler{
    annotationData: AnnotationData = new AnnotationData();
    resultData: ResultData = new ResultData();
    myImage: string = '';
    myCanvas: HTMLImageElement;
    class: boolean = false;

    constructor(){
    }

    getImage(){
        console.log("sending id: ", renderer.ID);
        var img = {
            id: renderer.ID,
            image: this.myImage
        }
        return JSON.stringify(img);
    }

    getAnnotation(){
        const data = {
            id: renderer.ID,
            date: this.annotationData.time,
            name: this.annotationData.name,
            sqm: this.annotationData.sqm
        };
        return JSON.stringify(data);
    }

    saveName(value: string){
        this.annotationData.name = value;
    }

    saveSQM(value: string){
        this.annotationData.sqm = value;
    }

    saveTime(value: string){
        this.annotationData.time = new Date(value);
    }

    saveImageData(result : any){
        this.myImage = result.toString();
        console.log("Saving:" + this.myImage);
        renderer.refreshPage();
    }

}

/**
 * Renderer singleton handles application processes
 **/
class Renderer{
    dataHandler: DataHandler;
    client: Client;
    version: string = "v0.0.1";
    ID: number = 0;

    constructor(){
        this.client = new Client('http://localhost:8080');
        this.dataHandler = new DataHandler();
    }

    /**
     * Emit Annotation data to server
     **/
    emitData(msg: string, data:JSON){
        console.log('sending message')
        this.client.socket.emit(msg, data);
    }

    /**
     * Emit Image data to server
     **/
    emitImage(msg: string, data:JSON){
        console.log('emitting image')
        this.client.socket.emit(msg, data);
    }

    /**
     * Re-render InputPage with changes.
     **/
    refreshPage(){
        this.renderApi();
    }

    /**
     * Switch classification ready state to true and re-render page with Classify btn
     **/
    readyToClass(){
        renderer.dataHandler.class = true;
        renderer.refreshPage();
    }

    handleResults(data:JSON){
        /*
        *         pic_order: results.order,
        all_DB: results.count,
        picture_data: []*/
        console.log("Received results: ");
        console.log(JSON.stringify(data));
        var temp = JSON.stringify(data);
        const dat = JSON.parse(temp);
        //this.dataHandler.resultData = new ResultData();
        renderer.dataHandler.resultData.order = dat.pic_order;
        renderer.dataHandler.resultData.count = dat.all_DB;
        renderer.dataHandler.resultData.pictures = dat.picture_data;

        renderer.renderResults();
        /**
         * setTimeout(function(){}, 3000);
         * var myResView = document.getElementsByTagName('result-view') as NodeListOf<HTMLElement>;
         * var myResText = document.getElementsByTagName('result-text') as NodeListOf<HTMLElement>;
         * renderer.loadRenderImage(myResText.item(0));
         * renderer.loadRenderImages(myResView.item(0));
         */

    }

    /**
     * Handle signals from Users input
     **/
    sendData(type){
        if(type == "img"){
            this.emitImage('getImage', JSON.parse(this.dataHandler.getImage()));
            this.emitData('getInfo', JSON.parse(this.dataHandler.getAnnotation()));
            console.log("Sending image and info to server.");
            this.client.socket.on('goodToClass', this.readyToClass)
            return;
        }
        else if (type == "classify"){
            const data = {
                id: renderer.ID,
            };
            this.client.socket.emit('runClassification', data);
            //TODO
            //redirect to waiting page!
            this.renderWaiting();
            this.client.socket.on('results', this.handleResults)
        }
        else{
            console.log("Not sure what to send :o !")
        }
    }


    /**
     * RenderInput GUI
     **/
    renderApi(){

        const main = html`
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
            margin-left: auto;
            margin-right: auto;
            max-width: 90%;
            width: 30em;
            display: block;
        }
        .buttonWrapper {
            margin-top: 2rem;
            text-align: center;
            margin-bottom: 2rem;
        }
        .send_btn{
            background-color: #0b64b0;         
            margin-left: 1em;
            margin-right: 1em;
            max-width: 8em;
            font-weight: bolder;
            border: none;
            padding: 0.8em;
            color: #fff;
            border-radius: 3px;
        }
        
        .class_btn{
            background-color: #b51e7a;         
            margin-left: 1em;
            margin-right: 1em;
            max-width: 8em;
            font-weight: bolder;
            border: none;
            padding: 0.8em;
            color: #fff;
            border-radius: 3px;
        }
        
        </style>
        <h2>SkyQuality: light pollution classifier</h2>
        <input-annotation></input-annotation>
        <input-image></input-image>
        <br>
        <canvas id="preview", width="300", height="300", style="border:1px solid #d3d3d3;">
        Your browser does not support the HTML5 canvas tag.
        </canvas>
        <div class="buttonWrapper">
        <button class="send_btn" type="submit" id="send_image" value="Send" on-click="${
            (e) => {
                e.preventDefault();
                this.sendData('img');
            }
            }"
        double-click="${
            (e) => e.preventDefault()}" >Send Image</button>
        
        <button class="class_btn" type="submit" id="send_class" value="Send" on-click="${
            (e) => {
                e.preventDefault();
                this.sendData('classify');
            }
            }"
        double-click="${
            (e) => {
                e.preventDefault();
            }
            }" >Classify</button></div>
        
        `;

        render(main, document.body);

        if(this.dataHandler.myImage == ''){
            console.log(document.getElementById("send_image"));
            document.getElementById("send_image").hidden = true;
        }
        else {
            document.getElementById("send_image").hidden = false;
        }

        if(this.dataHandler.class == false){
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
    renderWaiting(){

        const main = html`
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
    loadRenderImage(element){
        console.log(element.shadowRoot.childNodes);
        var shadow = element.shadowRoot;
        var myDiv = element.shadowRoot.childNodes.item(3) as HTMLDivElement;
        console.log(myDiv);
        var ctx = myDiv.querySelector('#submitted').getContext('2d');
        var img = new Image;
        img.onload = function(){
            ctx.drawImage(img,0,0); // Or at whatever offset you like
        };
        img.src = renderer.dataHandler.myImage;
    }

    loadRenderImages(element){
        var pictures = renderer.dataHandler.resultData.pictures;
        for(var j = 0; j < pictures.length; j++){
            var myCanvas = element.shadowRoot.getElementById('can_'+j.toString()) as  HTMLCanvasElement;
            var ctx = myCanvas.getContext('2d');
            var img = new Image;
            img.onload = function(){
                ctx.drawImage(img,0,0); // Or at whatever offset you like
            };
            img.src = pictures[j];
        }
    }

    loadImages(){
        var wrapper = document.getElementById("wrapper") as HTMLDivElement;
        console.log(wrapper);
        var main='<p>These are the closest results to your photo (sorted db preview):</p>\n<br>';
        var pictures = renderer.dataHandler.resultData.pictures;
        for(var j = 0; j < pictures.length; j++){
            var add = '<img src="'+renderer.dataHandler.myImage+'", width="300", style="border:1px solid #d3d3d3;">\n<br>';
            main += add;
            /*
            <canvas id="can_0", width="150", height="150", style="border:1px solid #d3d3d3;">
                Your browser does not support the HTML5 canvas tag.
            </canvas>
            <br>
            var myCanvas = document.getElementById('can_'+j.toString()) as  HTMLCanvasElement;
            var ctx = myCanvas.getContext('2d');
            var img = new Image;
            img.onload = function(){
                ctx.drawImage(img,0,0); // Or at whatever offset you like
            };
            img.src = pictures[j];
            */
        }
        wrapper.innerHTML = main;
    }

    renderResults(){

        const main = html`
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
        <br>
        <result-text></result-text>
        <result-view></result-view>
        
        
      
        `;
        render(main, document.body);

    }

}

export let renderer = new Renderer();