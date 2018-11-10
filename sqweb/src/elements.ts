import {html, render} from './../libraries/lit-html-element/lib/lit-extended.js';
import {LitHTMLElement, customElement,  ref} from  './../libraries/lit-html-element/LitHTMLElement.js';
import {renderer} from "./renderer.js";

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
            padding: 0;
            margin: 0;
            background-color: blanchedalmond;
        }
        
        label{
        
        }
        input{
        
        }
        </style>
                <br>
        <div class="fileInput" name="fileInput">
            <label class="form_label" for="text">Load image:</label>
            <input type="file" name="img_input" id="img_input" value="" on-change="${(e) => {
                this.uploadImage(e);
            }}"/><br>
            
        </div>
        
        
        `;
    }
}