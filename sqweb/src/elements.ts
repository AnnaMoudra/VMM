import {html, render} from './../libraries/lit-html-element/lib/lit-extended.js';
import {LitHTMLElement, customElement,  ref} from  './../libraries/lit-html-element/LitHTMLElement.js';
import {renderer} from "./renderer.js";

@customElement()
export class InputAnnotation extends LitHTMLElement{
    name: string = "";
    sqm: string = "";
    time: string = "";

    constructor() {
        super();
    }

    saveName(event){
        this.name = event.target.value;
        renderer.dataHandler.saveName(this.name);
    }

    saveSQM(event){
        this.sqm = event.target.value
        renderer.dataHandler.saveSQM(this.sqm);
    }

    saveTime(event){
        this.time = event.target.value
        renderer.dataHandler.saveTime(this.time+"T00:00");
    }


    render() {
        return html`
        <style>
        div{
            padding: 2em;
            margin-left: 1em;
            margin-right: 1em;
            background-color: #deecff;
            max-width: 20em;
        }
        
        .label{
            margin-left: 1em;
            
        }
        input{
        display: block;
            float: right;
            margin-left: 0.2em;
            margin-right: 1em;
        }
        
        </style>
        
        <br>
                
        <div class="annotationInput" name="annotationInput">
            <label class="label" for="text">Name:</label>
            <input type="text" name="name_input" id="name_input" value="${renderer.dataHandler.annotationData.name}" 
            on-change="${(e) => this.saveName(e)}"
            />
        <br>
        <br>
        
            <label class="label" for="text">SQM value:</label>
            <input type="text" name="sqm_input" id="sqm_input" value="${renderer.dataHandler.annotationData.sqm}" 
            on-change="${(e) => this.saveSQM(e)}"
            />
        <br>
        <br>
        
            <label class="label" for="text">Time:</label>
            <input type="datetime-local" name="time_input" id="time_input" value="${renderer.dataHandler.annotationData.time}" 
            on-change="${(e) => this.saveTime(e)}"
            />
            
        </div>`;
    }
}


@customElement()
export class InputImage extends LitHTMLElement{

    img : HTMLImageElement = null;
    name: string = "";

    constructor() {
        super();
        this.img = document.createElement('img');
        this.img.id = 'imgFile';
    }


    uploadImage(event){
        var file = event.target.files[0];
        //this.img.src = file.name;
        renderer.dataHandler.myImage = file;

        if(file.type.match('image.*')){
            var reader = new FileReader();
            // Read in the image file as a data URL.
            console.log("Loading file");
            reader.readAsDataURL(file);
            reader.onload = function(e) {
                console.log("file loaded:"+ reader.result);
                var canvas = document.getElementById("preview") as HTMLCanvasElement;
                var ctx = canvas.getContext("2d");
                var img = document.createElement('img');
                img.id = 'imgFile';
                img.src = e.target.result;
                img.onload = () => ctx.drawImage(img, 0, 0, img.width,    img.height,     // source rectangle
                    0, 0, canvas.width, canvas.height);
                renderer.dataHandler.saveImageData(e.target.result);
            }

        }
        else{
            console.log("NOT AN IMAGE")
        }

    }

    render(){
        return html`
        <style>
        body{
            width: 300px;
        }
        div{
            background-color: blanchedalmond;         
            padding: 2em;
            margin-left: 1em;
            margin-right: 1em;
            max-width: 30em;
        }
        .label{
            margin-left: 1em;
            
        }
        input{
        display: block;
            float: right;
            margin-left: 0.2em;
            margin-right: 1em;
        }
        </style>
                <br>
        <div class="fileInput" name="fileInput">
            <label class="label" for="text">Load image:</label>
            <input type="file" name="img_input" id="img_input" value="${renderer.dataHandler.myImage}" on-change="${(e) => {
                this.uploadImage(e);
            }}"/>
        </div>
        <br>
        
        
        `;
    }
}