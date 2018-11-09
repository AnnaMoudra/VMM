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
    }cd


    uploadImage(event){
        var file = event.target.files[0];
        this.img.src = file.name;

        if(file.type.match('image.*')){
            var reader = new FileReader();
            // Read in the image file as a data URL.
            reader.readAsDataURL(file);
            reader.onload = function(e) {
                var c = document.getElementById("preview") as HTMLCanvasElement;
                var ctx = c.getContext("2d");
                var img = document.createElement('img');
                img.id = 'imgFile';
                img.src = reader.result;
                ctx.drawImage(img, 10, 10);
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
                this.saveImage();
            }}"/><br>
            
        </div>
        
        
        `;
    }
}