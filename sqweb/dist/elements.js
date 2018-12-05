var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from './../libraries/lit-html-element/lib/lit-extended.js';
import { LitHTMLElement, customElement } from './../libraries/lit-html-element/LitHTMLElement.js';
import { renderer } from "./renderer.js";
let InputAnnotation = class InputAnnotation extends LitHTMLElement {
    constructor() {
        super();
        this.name = "";
        this.sqm = "";
        this.time = "";
    }
    saveName(event) {
        this.name = event.target.value;
        renderer.dataHandler.saveName(this.name);
    }
    saveSQM(event) {
        this.sqm = event.target.value;
        renderer.dataHandler.saveSQM(this.sqm);
    }
    saveTime(event) {
        this.time = event.target.value;
        renderer.dataHandler.saveTime(this.time + "T00:00");
    }
    render() {
        return html `
        <style>
        body{
            font-family: Helvetica;
        }
        div{        
            padding: 2em;
            margin-left: auto;
            margin-right: auto;
            background-color: #fff;
            width: 90%;
            text-align: center;
        }
        
        .formWrapper {
        max-width: 300px;
        text-align: left;
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
            <div class="formWrapper">
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
            </div>
            
        </div>`;
    }
};
InputAnnotation = __decorate([
    customElement()
], InputAnnotation);
export { InputAnnotation };
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
            font-family: Helvetica;
        }
        div{
            background-color: #000;         
            padding: 2em;
            margin-left: auto;
            margin-right: auto;
            width: 90%;
            color: #fff;
        }
        .formWrapper {
            max-width: 400px;
            text-align: left;
        }
        .label{
            margin-left: 1em;
            
        }
        input{
            display: block;
            float: right;
            margin-left: 0em;
            margin-right: 1em;
        }
        </style>
        <div class="fileInput" name="fileInput">
        <div class="formWrapper">
            <label class="label" for="text">Load image:</label>
            <input type="file" name="img_input" id="img_input" value="${renderer.dataHandler.myImage}" on-change="${(e) => {
            this.uploadImage(e);
        }}"/>
            </div>
        </div>
        
        
        `;
    }
};
InputImage = __decorate([
    customElement()
], InputImage);
export { InputImage };
let ResultText = class ResultText extends LitHTMLElement {
    constructor() {
        super();
    }
    render() {
        return html `
        <style>
        body{
            width: 300px;
            font-family: Helvetica;
        }
        div{
            background-color: #fff;         
            padding: 2em;
            margin-left: auto;
            margin-right: auto;
            max-width: 90%;
            text-align: center;
        }
        
        img {
            max-width: 90%;
            max-height: 60vh;
        }

        </style>
          <div id="div_submitted">
            <p>Your submitted photo:</p>
            <img src="${renderer.dataHandler.myImage}">
            <br>
            <p>This photo has been classified as the <b>${renderer.dataHandler.resultData.order}.</b> best, out of
             the ${renderer.dataHandler.resultData.count} photos currently stored in the database. </p>
        </div>
    `;
    }
};
ResultText = __decorate([
    customElement()
], ResultText);
export { ResultText };
let ResultView = class ResultView extends LitHTMLElement {
    constructor() {
        super();
    }
    predicateBy(prop) {
        return function (a, b) {
            if (a[prop] > b[prop]) {
                return 1;
            }
            else if (a[prop] < b[prop]) {
                return -1;
            }
            return 0;
        };
    }
    loadImages(e) {
        console.log(e);
        var wrapper = e.target.previousElementSibling;
        console.log(wrapper);
        var main = '<span>These are the closest results to your photo (sorted db preview):</span>\n<br>';
        var pictures = renderer.dataHandler.resultData.pictures;
        pictures.sort(this.predicateBy('order'));
        for (var j = 0; j < pictures.length; j++) {
            var add = '<div class="image">' +
                '<span>' + (parseInt(renderer.dataHandler.resultData.pictures[j].order) + 1).toString() + '</span>' +
                '<img src="' + renderer.dataHandler.resultData.pictures[j].picture.toString() + '"></div>';
            main += add;
        }
        wrapper.innerHTML = main;
    }
    render() {
        const main = html `
        <style>
        body{
            width: 300px;
            font-family: Helvetica;
        }
        div#wrapper{
            background-color: #333;         
            padding: 2em;
            margin-left: auto;
            margin-right: auto;
            max-width: 90%;
            display:flex;
            flex-wrap: wrap;
            justify-content: space-between;
            color: #fff;
        }
        
        .image{
            padding: 2rem;
            flex-basis: 20%;            
        }
        
        .image img {
            width: 90%;
            max-width: 400px;
            margin-left: 1rem;
            border-color: black;
            border-width: 25px;
            border-style: solid;
        }
        
        #wrapper > span {
            flex-basis: 100%;        
        }

        </style>
        
        <div id="wrapper">
        </div class="">
        <img src="${renderer.dataHandler.myImage}", width="0", style="border:1px solid #d3d3d3;", onload="${(e) => this.loadImages(e)}">
        <br>
        `;
        return main;
    }
};
ResultView = __decorate([
    customElement()
], ResultView);
export { ResultView };
//# sourceMappingURL=elements.js.map