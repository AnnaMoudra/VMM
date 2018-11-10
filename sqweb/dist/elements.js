var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from './../libraries/lit-html-element/lib/lit-extended.js';
import { LitHTMLElement, customElement } from './../libraries/lit-html-element/LitHTMLElement.js';
import { renderer } from "./renderer.js";
let InputImage = class InputImage extends LitHTMLElement {
    constructor() {
        super();
        this.img = null;
        this.name = "";
        this.img = document.createElement('img');
        this.img.id = 'imgFile';
    }
    uploadImage(event) {
        var file = event.target.files[0];
        //this.img.src = file.name;
        renderer.dataHandler.myImage = file;
        if (file.type.match('image.*')) {
            var reader = new FileReader();
            // Read in the image file as a data URL.
            console.log("Loading file");
            reader.readAsDataURL(file);
            reader.onload = function (e) {
                console.log("file loaded:" + reader.result);
                var canvas = document.getElementById("preview");
                var ctx = canvas.getContext("2d");
                var img = document.createElement('img');
                img.id = 'imgFile';
                img.src = e.target.result;
                img.onload = () => ctx.drawImage(img, 0, 0, img.width, img.height, // source rectangle
                0, 0, canvas.width, canvas.height);
                renderer.dataHandler.saveImageData(e.target.result);
            };
        }
        else {
            console.log("NOT AN IMAGE");
        }
    }
    render() {
        return html `
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
};
InputImage = __decorate([
    customElement()
], InputImage);
export { InputImage };
//# sourceMappingURL=elements.js.map